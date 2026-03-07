import { ConfigModule } from '@nestjs/config'
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager'
import { Test, TestingModule } from '@nestjs/testing'

import { omit } from 'es-toolkit'

import { mockDeep, mockReset } from 'jest-mock-extended'

import { PrismaService, BullMQService } from '@/infrastructure'

import { FileService } from '../services/file.service'
import { TaxReceiptService } from '../services/taxReceipt.service'
import { TaxReceiptGeneratorService } from '../services/taxReceiptGenerator.service'

import type {
  FileMetadata as FileMetadataPrisma,
  Prisma,
  TaxReceipt,
  Donation,
  Donor,
  Organisation,
} from '@generated/prisma/client'
import type { FileMetadata } from '@shared/models'
import { InternalServerErrorException } from '@nestjs/common'

describe('TaxReceiptService', () => {
  const prismaServiceMock = mockDeep<PrismaService>()
  const fileServiceMock = mockDeep<FileService>()
  const taxReceiptGeneratorServiceMock = mockDeep<TaxReceiptGeneratorService>()
  const bullMqServiceMock = mockDeep<BullMQService>()
  const cacheManagerMock = mockDeep<Cache>()

  let taxReceiptService: TaxReceiptService

  beforeEach(async () => {
    jest.resetAllMocks()
    mockReset(prismaServiceMock)
    mockReset(fileServiceMock)
    mockReset(taxReceiptGeneratorServiceMock)
    mockReset(bullMqServiceMock)
    mockReset(cacheManagerMock)

    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        TaxReceiptService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
        {
          provide: FileService,
          useValue: fileServiceMock,
        },
        {
          provide: TaxReceiptGeneratorService,
          useValue: taxReceiptGeneratorServiceMock,
        },
        {
          provide: BullMQService,
          useValue: bullMqServiceMock,
        },
        {
          provide: CACHE_MANAGER,
          useValue: cacheManagerMock,
        },
      ],
    }).compile()

    app.useLogger(false)

    taxReceiptService = app.get<TaxReceiptService>(TaxReceiptService)
  })

  it('should get tax receipt list', async () => {
    prismaServiceMock.$transaction.mockResolvedValueOnce([[], 0])

    await taxReceiptService.getFilteredList(
      { page: 1, pageSize: 10, orderBy: { createdAt: 'desc' } },
      { donorId: { in: ['donor-id-123'] } },
    )

    expect(prismaServiceMock.$transaction).toHaveBeenCalledTimes(1)
  })

  it('should get tax receipt by id', async () => {
    prismaServiceMock.taxReceipt.findUniqueOrThrow.mockResolvedValueOnce(mockDeep<TaxReceipt>())

    await taxReceiptService.getTaxReceiptById('tax-receipt-id-123')

    expect(prismaServiceMock.taxReceipt.findUniqueOrThrow).toHaveBeenCalledTimes(1)
  })

  it('should return tax receipt status counts', async () => {
    prismaServiceMock.taxReceipt.groupBy.mockResolvedValueOnce(
      mockDeep<
        (TaxReceipt & {
          _count: { id: number }
          _sum: undefined
          _avg: undefined
          _max: undefined
          _min: undefined
        })[]
      >([
        { status: 'COMPLETED', _count: { id: 10 } },
        { status: 'PENDING', _count: { id: 5 } },
      ]),
    )

    const result = await taxReceiptService.getTaxReceiptStatusCounts()

    expect(result).toEqual({ COMPLETED: 10, PENDING: 5 })
    expect(prismaServiceMock.taxReceipt.groupBy).toHaveBeenCalledWith({
      by: ['status'],
      _count: { id: true },
    })
  })

  describe('createIndividualTaxReceipt', () => {
    beforeEach(() => {
      prismaServiceMock.$transaction.mockImplementationOnce(async (cb) => {
        return cb(prismaServiceMock)
      })
    })
    it('creates individual tax receipt successfully', async () => {
      const donationId = 'donation-1'
      const donorId = 'donor-1'
      const taxReceiptId = 'new-tax-receipt-id'
      const receiptNumber = 12345

      const mockDonation = mockDeep<
        Donation & {
          organisation: { isTaxReceiptEnabled: boolean }
          donationType: { isTaxReceiptEnabled: boolean }
          donor: Donor
        }
      >({
        id: donationId,
        organisation: { isTaxReceiptEnabled: true },
        donationType: { isTaxReceiptEnabled: true },
        donor: { id: donorId, isDisabled: false },
        taxReceiptId: null,
      })
      prismaServiceMock.donation.findUniqueOrThrow.mockResolvedValueOnce(mockDonation)

      prismaServiceMock.$transaction.mockImplementationOnce(async (cb) => {
        return cb(prismaServiceMock)
      })

      prismaServiceMock.taxReceipt.create.mockResolvedValueOnce(
        mockDeep<TaxReceipt>({ id: taxReceiptId, receiptNumber }),
      )

      const result = await taxReceiptService.createIndividualTaxReceipt({ donationId })

      expect(result).toEqual({ taxReceiptId })
      expect(prismaServiceMock.$transaction).toHaveBeenCalledTimes(1)
      expect(prismaServiceMock.taxReceipt.create).toHaveBeenCalledWith({
        data: {
          type: 'INDIVIDUAL',
          status: 'PENDING',
          donorId: donorId,
        },
        select: { id: true, receiptNumber: true },
      })
      expect(prismaServiceMock.donation.update).toHaveBeenCalledWith({
        where: { id: donationId },
        data: { taxReceiptId: taxReceiptId },
      })
      expect(bullMqServiceMock.addTaxReceiptJob).toHaveBeenCalledWith('GENERATE', {
        taxReceiptId: taxReceiptId,
        taxReceiptNumber: receiptNumber,
        donationIds: [donationId],
        taxReceiptType: 'INDIVIDUAL',
      })
    })

    it('handles tax receipt job creation failure', async () => {
      const donationId = 'donation-1'
      const donorId = 'donor-1'
      const taxReceiptId = 'new-tax-receipt-id'
      const receiptNumber = 12345
      const jobError = new InternalServerErrorException({
        code: 'JOB_SCHEDULING_FAILED',
        message:
          'Failed to schedule tax receipt generation job for tax receipt ID new-tax-receipt-id',
      })

      const mockDonation = mockDeep<
        Donation & {
          organisation: { isTaxReceiptEnabled: boolean }
          donationType: { isTaxReceiptEnabled: boolean }
          donor: Donor
        }
      >({
        id: donationId,
        organisation: { isTaxReceiptEnabled: true },
        donationType: { isTaxReceiptEnabled: true },
        donor: { id: donorId, isDisabled: false },
        taxReceiptId: null,
      })
      prismaServiceMock.donation.findUniqueOrThrow.mockResolvedValueOnce(mockDonation)

      prismaServiceMock.$transaction.mockImplementationOnce(async (cb) => {
        return cb(prismaServiceMock)
      })

      prismaServiceMock.taxReceipt.create.mockResolvedValueOnce(
        mockDeep<TaxReceipt>({ id: taxReceiptId, receiptNumber }),
      )

      bullMqServiceMock.addTaxReceiptJob.mockRejectedValueOnce(jobError)

      await expect(taxReceiptService.createIndividualTaxReceipt({ donationId })).rejects.toThrow(
        jobError,
      )

      expect(prismaServiceMock.taxReceipt.update).toHaveBeenCalledWith({
        where: { id: taxReceiptId },
        data: { status: 'FAILED' },
      })
    })
  })

  describe('createAnnualTaxReceipts', () => {
    beforeEach(() => {
      prismaServiceMock.$transaction.mockImplementationOnce(async (cb) => {
        return cb(prismaServiceMock)
      })
    })

    it('throws error if no donations found for donor', async () => {
      const organisationId = 'org-1'
      const donorIds = ['donor-1']
      const year = 2024

      const mockDonor = mockDeep<Donor & { donations: Array<Donation> }>({
        id: 'donor-1',
        isDisabled: false,
        donations: [],
      })
      prismaServiceMock.donor.findMany.mockResolvedValueOnce([mockDonor])

      await expect(
        taxReceiptService.createAnnualTaxReceipts({ organisationId, donorIds, year }),
      ).rejects.toThrow(
        `No donations found for donor ID donor-1 in organisation ID ${organisationId} for year ${year}`,
      )
    })

    it('creates annual tax receipts successfully', async () => {
      const organisationId = 'org-1'
      const donorIds = ['donor-1', 'donor-2']
      const year = 2024

      const mockDonors = mockDeep<
        (Donor & {
          donations: { id: string }[]
        })[]
      >([
        {
          id: 'donor-1',
          isDisabled: false,
          donations: [{ id: 'donation-1' }],
        },
        {
          id: 'donor-2',
          isDisabled: false,
          donations: [{ id: 'donation-2' }],
        },
      ])

      const mockTaxReceipts = mockDeep<TaxReceipt[]>([
        { id: 'tax-receipt-1', receiptNumber: 12345, donorId: 'donor-1' },
        { id: 'tax-receipt-2', receiptNumber: 12346, donorId: 'donor-2' },
      ])

      prismaServiceMock.donor.findMany.mockResolvedValueOnce(mockDonors)

      prismaServiceMock.$transaction.mockImplementationOnce(async (cb) => {
        return cb(prismaServiceMock)
      })

      prismaServiceMock.taxReceipt.createManyAndReturn.mockResolvedValueOnce(mockTaxReceipts)

      const result = await taxReceiptService.createAnnualTaxReceipts({
        organisationId,
        donorIds,
        year,
      })

      expect(result.taxReceiptIds).toEqual(['tax-receipt-1', 'tax-receipt-2'])
      expect(prismaServiceMock.donor.findMany).toHaveBeenCalledWith({
        where: { id: { in: donorIds } },
        select: {
          id: true,
          isDisabled: true,
          donations: {
            where: {
              taxReceiptId: null,
              organisation: { isTaxReceiptEnabled: true },
              donationType: { isTaxReceiptEnabled: true },
              donor: { isDisabled: false },
              organisationId,
              donatedAt: {
                gte: `${year}-01-01T00:00:00.000Z`,
                lte: `${year}-12-31T23:59:59.999Z`,
              },
            },
            select: {
              id: true,
            },
          },
        },
      })
      expect(prismaServiceMock.taxReceipt.createManyAndReturn).toHaveBeenCalledWith({
        data: [
          { type: 'ANNUAL', status: 'PENDING', donorId: 'donor-1' },
          { type: 'ANNUAL', status: 'PENDING', donorId: 'donor-2' },
        ],
        select: { id: true, receiptNumber: true, donorId: true },
      })
      expect(bullMqServiceMock.addTaxReceiptJob).toHaveBeenCalledWith('GENERATE_BATCH', [
        {
          taxReceiptId: 'tax-receipt-1',
          taxReceiptNumber: 12345,
          donationIds: ['donation-1'],
          taxReceiptType: 'ANNUAL',
        },
        {
          taxReceiptId: 'tax-receipt-2',
          taxReceiptNumber: 12346,
          donationIds: ['donation-2'],
          taxReceiptType: 'ANNUAL',
        },
      ])
    })

    it('handles batch tax receipt job creation failure', async () => {
      const organisationId = 'org-1'
      const donorIds = ['donor-1']
      const year = 2024
      const jobError = new InternalServerErrorException({
        code: 'JOB_SCHEDULING_FAILED',
        message:
          'Failed to schedule tax receipt generation jobs for annual tax receipts for organisation ID org-1 and year 2024',
      })

      const mockDonors = mockDeep<
        (Donor & {
          donations: (Donation & {
            organisation: { isTaxReceiptEnabled: boolean }
            donationType: { isTaxReceiptEnabled: boolean }
            donor: Donor
          })[]
        })[]
      >([
        {
          id: 'donor-1',
          isDisabled: false,
          donations: [
            {
              id: 'donation-1',
              taxReceiptId: null,
              donor: { id: 'donor-1', isDisabled: false },
              organisation: { isTaxReceiptEnabled: true },
              donationType: { isTaxReceiptEnabled: true },
            },
          ],
        },
      ])

      const mockTaxReceipts = mockDeep<TaxReceipt[]>([
        { id: 'tax-receipt-1', receiptNumber: 12345, donorId: 'donor-1' },
      ])

      prismaServiceMock.donor.findMany.mockResolvedValueOnce(mockDonors)

      prismaServiceMock.$transaction.mockImplementationOnce(async (cb) => {
        return cb(prismaServiceMock)
      })

      prismaServiceMock.taxReceipt.createManyAndReturn.mockResolvedValueOnce(mockTaxReceipts)

      bullMqServiceMock.addTaxReceiptJob.mockRejectedValueOnce(jobError)

      await expect(
        taxReceiptService.createAnnualTaxReceipts({ organisationId, donorIds, year }),
      ).rejects.toThrow(jobError)

      expect(prismaServiceMock.taxReceipt.update).toHaveBeenCalledWith({
        where: { id: 'tax-receipt-1' },
        data: { status: 'FAILED' },
      })
    })
  })

  describe('handleTaxReceiptGenerationFailure', () => {
    it('updates tax receipt status to FAILED', async () => {
      const taxReceiptId = 'tax-receipt-id-123'

      await taxReceiptService.handleTaxReceiptGenerationFailure({ taxReceiptId })

      expect(prismaServiceMock.taxReceipt.update).toHaveBeenCalledWith({
        where: { id: taxReceiptId },
        data: { status: 'FAILED' },
      })
    })
  })

  describe('processTaxReceiptGenerationJob', () => {
    it('processes tax receipt generation successfully', async () => {
      const donationId = 'donation-1'
      const taxReceiptNumber = 12345
      const donor = {
        id: 'donor-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      }
      const organisation = {
        id: 'org-1',
        title: 'Test Org',
        streetAddress: '123 Test St',
        postalCode: '12345',
        city: 'Test City',
        object: 'Test Object',
        objectDescription: 'Test Description',
        signatoryName: 'Test Signatory',
        signatoryPosition: 'President',
        logoId: 'logo-file-id',
        signatureId: 'signature-file-id',
        updatedAt: new Date('2024-01-01T12:00:00Z'),
      }
      const mockDonationWithRelations = mockDeep<
        Prisma.DonationGetPayload<{
          include: {
            donor: true
            organisation: true
            donationMethod: true
            paymentMode: true
            donationAssetType: true
          }
        }>[]
      >([
        {
          id: donationId,
          donorId: donor.id,
          donor,
          organisation,
          donationMethod: { id: 'method-1', name: 'Online' },
          paymentMode: { id: 'payment-1', name: 'Credit Card' },
          donationAssetType: { id: 'asset-1', name: 'Money' },
        },
      ])

      prismaServiceMock.$transaction.mockResolvedValueOnce([mockDonationWithRelations])

      fileServiceMock.downloadFile.mockResolvedValueOnce({
        buffer: Buffer.from('logo-file-buffer'),
        metadata: mockDeep<FileMetadata>(),
      })
      fileServiceMock.downloadFile.mockResolvedValueOnce({
        buffer: Buffer.from('signature-file-buffer'),
        metadata: mockDeep<FileMetadata>(),
      })

      taxReceiptGeneratorServiceMock.generateTaxReceipt.mockResolvedValue(
        Buffer.from('pdf-file-buffer'),
      )

      fileServiceMock.createFile.mockResolvedValueOnce('generated-file-id-123')

      await taxReceiptService.processTaxReceiptGenerationJob({
        jobId: 'job-123',
        taxReceiptId: 'tax-receipt-id-123',
        taxReceiptNumber: taxReceiptNumber,
        donationIds: [donationId],
        taxReceiptType: 'INDIVIDUAL',
      })

      expect(prismaServiceMock.taxReceipt.update).toHaveBeenCalledWith({
        where: { id: 'tax-receipt-id-123' },
        data: { status: 'PROCESSING' },
      })
      expect(prismaServiceMock.donation.findMany).toHaveBeenCalledWith({
        where: { id: { in: [donationId] } },
        include: {
          donor: true,
          organisation: true,
          donationMethod: true,
          paymentMode: true,
          donationAssetType: true,
        },
      })
      expect(fileServiceMock.downloadFile).toHaveBeenCalledTimes(2)
      expect(taxReceiptGeneratorServiceMock.generateTaxReceipt).toHaveBeenCalledWith({
        taxReceiptNumber,
        organisation: expect.objectContaining(
          omit(organisation, ['id', 'logoId', 'signatureId', 'updatedAt']),
        ),
        donor: mockDonationWithRelations[0].donor,
        donations: mockDonationWithRelations,
        taxReceiptType: 'INDIVIDUAL',
      })
      expect(fileServiceMock.createFile).toHaveBeenCalledWith({
        name: `${taxReceiptNumber}.pdf`,
        mimeType: 'application/pdf',
        buffer: Buffer.from('pdf-file-buffer'),
      })
      expect(prismaServiceMock.taxReceipt.update).toHaveBeenCalledTimes(2)
      expect(prismaServiceMock.taxReceipt.update).toHaveBeenLastCalledWith({
        where: { id: 'tax-receipt-id-123' },
        data: {
          status: 'COMPLETED',
          fileId: 'generated-file-id-123',
        },
      })
    })

    it('throws error if donations belong to different organisations', async () => {
      const mockDonationsWithDifferentOrgs = mockDeep<
        Prisma.DonationGetPayload<{
          include: {
            organisation: { select: { id: boolean; title: boolean } }
          }
        }>[]
      >([
        {
          id: 'donation-1',
          organisation: { id: 'org-1', title: 'Org 1' },
        },
        {
          id: 'donation-2',
          organisation: { id: 'org-2', title: 'Org 2' },
        },
      ])

      prismaServiceMock.$transaction.mockResolvedValueOnce([mockDonationsWithDifferentOrgs])

      await expect(
        taxReceiptService.processTaxReceiptGenerationJob({
          jobId: 'job-123',
          taxReceiptId: 'tax-receipt-id-123',
          taxReceiptNumber: 12345,
          donationIds: ['donation-1', 'donation-2'],
          taxReceiptType: 'INDIVIDUAL',
        }),
      ).rejects.toThrow(
        'Donations must belong to the same organisation. Current organisation IDs: org-1, org-2',
      )
    })

    it('throws error if organisation details are incomplete', async () => {
      const mockDonationWithIncompleteOrg = mockDeep<
        Prisma.DonationGetPayload<{
          include: {
            organisation: true
          }
        }>[]
      >([
        {
          id: 'donation-1',
          organisation: {
            id: 'org-1',
            title: null, // Missing required field
            streetAddress: '123 Test St',
            postalCode: '12345',
            city: 'Test City',
            object: 'Test Object',
            objectDescription: 'Test Description',
            signatoryName: 'Test Signatory',
            signatoryPosition: 'President',
            logoId: 'logo-file-id',
            signatureId: 'signature-file-id',
            updatedAt: new Date('2024-01-01T12:00:00Z'),
          },
        },
      ])

      prismaServiceMock.$transaction.mockResolvedValueOnce([mockDonationWithIncompleteOrg])

      await expect(
        taxReceiptService.processTaxReceiptGenerationJob({
          jobId: 'job-123',
          taxReceiptId: 'tax-receipt-id-123',
          taxReceiptNumber: 12345,
          donationIds: ['donation-1'],
          taxReceiptType: 'INDIVIDUAL',
        }),
      ).rejects.toThrow('Organisation details are incomplete for tax receipt generation')
    })

    it('throws error if fewer donations found than requested', async () => {
      prismaServiceMock.$transaction.mockResolvedValueOnce([
        [
          {
            id: 'donation-1',
            organisation: {
              id: 'org-1',
              title: 'Test Org',
              streetAddress: '123 Test St',
              postalCode: '12345',
              city: 'Test City',
              object: 'Test Object',
              objectDescription: 'Test Description',
              signatoryName: 'Test Signatory',
              signatoryPosition: 'President',
              logoId: 'logo-file-id',
              signatureId: 'signature-file-id',
            },
          },
        ],
      ])

      await expect(
        taxReceiptService.processTaxReceiptGenerationJob({
          jobId: 'job-123',
          taxReceiptId: 'tax-receipt-id-123',
          taxReceiptNumber: 12345,
          donationIds: ['donation-1', 'donation-2'],
          taxReceiptType: 'INDIVIDUAL',
        }),
      ).rejects.toThrow('One or more donations not found during tax receipt processing')
    })

    describe('email queueing logic', () => {
      const donationId = 'donation-1'
      const donor = { id: 'donor-1', firstName: 'John', lastName: 'Doe', email: null }
      const organisation = {
        id: 'org-1',
        title: 'Test Org',
        streetAddress: '123 Test St',
        postalCode: '12345',
        city: 'Test City',
        object: 'Test Object',
        objectDescription: 'Test Description',
        signatoryName: 'Test Signatory',
        signatoryPosition: 'President',
        logoId: 'logo-file-id',
        signatureId: 'signature-file-id',
        updatedAt: new Date('2024-01-01T12:00:00Z'),
      }
      beforeEach(() => {
        fileServiceMock.downloadFile.mockResolvedValueOnce({
          buffer: Buffer.from('logo-file-buffer'),
          metadata: mockDeep<FileMetadata>(),
        })
        fileServiceMock.downloadFile.mockResolvedValueOnce({
          buffer: Buffer.from('signature-file-buffer'),
          metadata: mockDeep<FileMetadata>(),
        })
        fileServiceMock.createFile.mockResolvedValueOnce('file-id')
        taxReceiptGeneratorServiceMock.generateTaxReceipt.mockResolvedValue(Buffer.from('pdf'))
      })

      it('does not queue email job if donor has no email or receipt is not annual', async () => {
        prismaServiceMock.$transaction.mockResolvedValueOnce(
          mockDeep<[(Donation & { donor: Donor; organisation: Organisation })[]]>([
            [
              {
                id: donationId,
                donorId: donor.id,
                donor,
                organisation,
              },
            ],
          ]),
        )
        await taxReceiptService.processTaxReceiptGenerationJob({
          jobId: 'job-123',
          taxReceiptId: 'tax-receipt-id-123',
          taxReceiptNumber: 12345,
          donationIds: [donationId],
          taxReceiptType: 'INDIVIDUAL', // not 'ANNUAL'
        })
        expect(bullMqServiceMock.addEmailJob).not.toHaveBeenCalled()
      })

      it('queues email job if donor has email and receipt is annual', async () => {
        prismaServiceMock.$transaction.mockResolvedValueOnce(
          mockDeep<[(Donation & { donor: Donor; organisation: Organisation })[]]>([
            [
              {
                id: donationId,
                donorId: donor.id,
                donor: {
                  ...donor,
                  email: 'john@example.com', // has email
                },
                organisation,
              },
            ],
          ]),
        )
        await taxReceiptService.processTaxReceiptGenerationJob({
          jobId: 'job-123',
          taxReceiptId: 'tax-receipt-id-123',
          taxReceiptNumber: 12345,
          donationIds: [donationId],
          taxReceiptType: 'ANNUAL', // is 'ANNUAL'
        })
        expect(bullMqServiceMock.addEmailJob).toHaveBeenCalled()
      })
    })
  })

  describe('cancelTaxReceipt', () => {
    beforeEach(() => {
      prismaServiceMock.$transaction.mockImplementationOnce(async (cb) => {
        return cb(prismaServiceMock)
      })
    })

    it('throws error if tax receipt is not completed', async () => {
      prismaServiceMock.taxReceipt.findUniqueOrThrow.mockResolvedValueOnce(
        mockDeep<TaxReceipt>({
          id: 'tax-receipt-id-123',
          status: 'CANCELED',
        }),
      )

      await expect(
        taxReceiptService.cancelTaxReceipt('tax-receipt-id-123', {
          canceledReason: 'Duplicate receipt',
        }),
      ).rejects.toThrow('Tax receipt status does not allow cancellation. Status: CANCELED')
    })

    it('successfully cancels tax receipt', async () => {
      prismaServiceMock.taxReceipt.findUniqueOrThrow.mockResolvedValueOnce(
        mockDeep<TaxReceipt & { file: FileMetadataPrisma }>({
          id: 'tax-receipt-id-123',
          status: 'COMPLETED',
          file: {
            id: 'file-id-123',
            storageKey: 'storage-key-123',
          },
        }),
      )

      await taxReceiptService.cancelTaxReceipt('tax-receipt-id-123', {
        canceledReason: 'Duplicate receipt',
      })

      expect(prismaServiceMock.taxReceipt.update).toHaveBeenCalledWith({
        where: { id: 'tax-receipt-id-123' },
        data: {
          status: 'CANCELED',
          canceledReason: 'Duplicate receipt',
          canceledAt: expect.any(Date),
        },
      })
      expect(prismaServiceMock.donation.updateMany).toHaveBeenCalledWith({
        where: { taxReceiptId: 'tax-receipt-id-123' },
        data: { taxReceiptId: null },
      })
      expect(bullMqServiceMock.addTaxReceiptJob).toHaveBeenCalledWith('CANCEL', {
        fileId: 'file-id-123',
        storageKey: 'storage-key-123',
      })
    })
  })

  describe('processTaxReceiptCancellationJob', () => {
    it('processes tax receipt cancellation successfully', async () => {
      const fileId = 'file-id-123'
      const storageKey = 'storage-key-123'
      const originalPdfBuffer = Buffer.from('original-pdf-buffer')
      const cancelledPdfBuffer = Buffer.from('cancelled-pdf-buffer')

      fileServiceMock.downloadFile.mockResolvedValueOnce({
        buffer: originalPdfBuffer,
        metadata: mockDeep<FileMetadata>(),
      })

      taxReceiptGeneratorServiceMock.cancelTaxReceipt.mockResolvedValueOnce(cancelledPdfBuffer)

      await taxReceiptService.processTaxReceiptCancellationJob({
        jobId: 'job-123',
        fileId,
        storageKey,
      })

      expect(fileServiceMock.downloadFile).toHaveBeenCalledWith(fileId)
      expect(taxReceiptGeneratorServiceMock.cancelTaxReceipt).toHaveBeenCalledWith(
        originalPdfBuffer,
      )
      expect(fileServiceMock.updateFileContent).toHaveBeenCalledWith({
        id: fileId,
        storageKey,
        buffer: cancelledPdfBuffer,
        mimeType: 'application/pdf',
      })
    })
  })
})
