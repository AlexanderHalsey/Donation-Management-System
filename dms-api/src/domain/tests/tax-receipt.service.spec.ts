import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { omit } from 'es-toolkit'

import { mockDeep, mockReset } from 'jest-mock-extended'

import { PrismaService, BullMQService } from '@/infrastructure'

import { FileService } from '../services/file.service'
import { TaxReceiptService } from '../services/tax-receipt.service'
import { TaxReceiptGeneratorService } from '../services/tax-receipt-generator.service'

import type {
  FileMetadata as FileMetadataPrisma,
  Prisma,
  TaxReceipt,
} from '@generated/prisma/client'
import type { FileMetadata } from '@shared/models'

describe('TaxReceiptService', () => {
  const prismaServiceMock = mockDeep<PrismaService>()
  const fileServiceMock = mockDeep<FileService>()
  const taxReceiptGeneratorServiceMock = mockDeep<TaxReceiptGeneratorService>()
  const bullMqServiceMock = mockDeep<BullMQService>()

  let taxReceiptService: TaxReceiptService

  beforeEach(async () => {
    jest.resetAllMocks()
    mockReset(prismaServiceMock)

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
      ],
    }).compile()

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

  describe('create tax receipt', () => {
    it('throws error if donations belong to different donors', async () => {
      prismaServiceMock.donation.findMany.mockResolvedValueOnce(
        mockDeep<Prisma.DonationGetPayload<null>[]>([
          {
            id: 'donation-1',
            donorId: 'donor-1',
          },
          {
            id: 'donation-2',
            donorId: 'donor-2',
          },
        ]),
      )

      await expect(
        taxReceiptService.createTaxReceipt({
          donationIds: ['donation-1', 'donation-2'],
          taxReceiptType: 'INDIVIDUAL',
        }),
      ).rejects.toThrow(
        'Donations must belong to the same donor. Current donor IDs: donor-1, donor-2',
      )
    })

    it('throws error if a donation already has a tax receipt', async () => {
      prismaServiceMock.donation.findMany.mockResolvedValueOnce(
        mockDeep<Prisma.DonationGetPayload<null>[]>([
          {
            id: 'donation-1',
            donorId: 'donor-1',
            taxReceiptId: 'existing-tax-receipt-id',
          },
        ]),
      )

      await expect(
        taxReceiptService.createTaxReceipt({
          donationIds: ['donation-1'],
          taxReceiptType: 'INDIVIDUAL',
        }),
      ).rejects.toThrow(
        'Donation already has a tax receipt associated with it : existing-tax-receipt-id',
      )
    })

    it('throws error if tax receipts are not enabled for a donation', async () => {
      prismaServiceMock.donation.findMany.mockResolvedValueOnce(
        mockDeep<
          Prisma.DonationGetPayload<{
            include: {
              organisation: { select: { isTaxReceiptEnabled: boolean } }
              donationType: { select: { isTaxReceiptEnabled: boolean } }
            }
          }>[]
        >([
          {
            id: 'donation-1',
            donorId: 'donor-1',
            taxReceiptId: null,
            organisation: { isTaxReceiptEnabled: true },
            donationType: { isTaxReceiptEnabled: false },
          },
        ]),
      )

      await expect(
        taxReceiptService.createTaxReceipt({
          donationIds: ['donation-1'],
          taxReceiptType: 'INDIVIDUAL',
        }),
      ).rejects.toThrow('Tax receipts are not enabled for this donation : donation-1')
    })

    it('creates tax receipt successfully', async () => {
      prismaServiceMock.donation.findMany.mockResolvedValueOnce(
        mockDeep<
          Prisma.DonationGetPayload<{
            include: {
              organisation: { select: { isTaxReceiptEnabled: boolean } }
              donationType: { select: { isTaxReceiptEnabled: boolean } }
            }
          }>[]
        >([
          {
            id: 'donation-1',
            donorId: 'donor-1',
            taxReceiptId: null,
            organisation: { isTaxReceiptEnabled: true },
            donationType: { isTaxReceiptEnabled: true },
          },
        ]),
      )

      prismaServiceMock.$transaction.mockImplementationOnce(async (cb) => {
        return cb(prismaServiceMock)
      })

      prismaServiceMock.taxReceipt.create.mockResolvedValueOnce(
        mockDeep<TaxReceipt>({ id: 'new-tax-receipt-id', receiptNumber: 12345 }),
      )

      const taxReceiptId = await taxReceiptService.createTaxReceipt({
        donationIds: ['donation-1'],
        taxReceiptType: 'INDIVIDUAL',
      })

      expect(taxReceiptId).toBe('new-tax-receipt-id')
      expect(prismaServiceMock.$transaction).toHaveBeenCalledTimes(1)
      expect(prismaServiceMock.taxReceipt.create).toHaveBeenCalledWith({
        data: {
          type: 'INDIVIDUAL',
          status: 'PENDING',
          donorId: 'donor-1',
        },
        select: { id: true, receiptNumber: true },
      })
      expect(prismaServiceMock.donation.updateMany).toHaveBeenCalledTimes(1)
      expect(bullMqServiceMock.addTaxReceiptJob).toHaveBeenCalledWith('GENERATE', {
        taxReceiptId: 'new-tax-receipt-id',
        taxReceiptNumber: 12345,
        donationIds: ['donation-1'],
        taxReceiptType: 'INDIVIDUAL',
      })
    })
  })

  describe('processTaxReceiptGeneration', () => {
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
        address: '123 Test St',
        postCode: '12345',
        locality: 'Test City',
        object: 'Test Object',
        objectDescription: 'Test Description',
        signatoryName: 'Test Signatory',
        signatoryPosition: 'President',
        logoId: 'logo-file-id',
        signatureId: 'signature-file-id',
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

      await taxReceiptService.processTaxReceiptGeneration({
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
        organisation: expect.objectContaining(omit(organisation, ['id', 'logoId', 'signatureId'])),
        donor: mockDonationWithRelations[0].donor,
        donations: mockDonationWithRelations,
        taxReceiptType: 'INDIVIDUAL',
      })
      expect(fileServiceMock.createFile).toHaveBeenCalledWith({
        name: 'tax-receipt-tax-receipt-id-123.pdf',
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
        taxReceiptService.processTaxReceiptGeneration({
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
            address: '123 Test St',
            postCode: '12345',
            locality: 'Test City',
            object: 'Test Object',
            objectDescription: 'Test Description',
            signatoryName: 'Test Signatory',
            signatoryPosition: 'President',
            logoId: 'logo-file-id',
            signatureId: 'signature-file-id',
          },
        },
      ])

      prismaServiceMock.$transaction.mockResolvedValueOnce([mockDonationWithIncompleteOrg])

      await expect(
        taxReceiptService.processTaxReceiptGeneration({
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
              address: '123 Test St',
              postCode: '12345',
              locality: 'Test City',
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
        taxReceiptService.processTaxReceiptGeneration({
          taxReceiptId: 'tax-receipt-id-123',
          taxReceiptNumber: 12345,
          donationIds: ['donation-1', 'donation-2'],
          taxReceiptType: 'INDIVIDUAL',
        }),
      ).rejects.toThrow('One or more donations not found during tax receipt processing')
    })
  })

  describe('should cancel tax receipt', () => {
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

      expect(prismaServiceMock.taxReceipt.update).toHaveBeenCalledTimes(1)
      expect(prismaServiceMock.donation.updateMany).toHaveBeenCalledTimes(1)
      expect(bullMqServiceMock.addTaxReceiptJob).toHaveBeenCalledWith(
        'CANCEL',
        expect.objectContaining({
          fileId: expect.any(String),
          storageKey: expect.any(String),
        }),
      )
    })
  })

  describe('processTaxReceiptCancellation', () => {
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

      await taxReceiptService.processTaxReceiptCancellation({
        fileId,
        storageKey,
      })

      expect(fileServiceMock.downloadFile).toHaveBeenCalledWith(fileId)
      expect(taxReceiptGeneratorServiceMock.cancelTaxReceipt).toHaveBeenCalledWith(
        originalPdfBuffer,
      )
      expect(fileServiceMock.updateFileContent).toHaveBeenCalledWith(
        fileId,
        storageKey,
        cancelledPdfBuffer,
      )
    })
  })
})
