import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { mockDeep, mockReset } from 'jest-mock-extended'

import { FileService } from '../services/file.service'
import { TaxReceiptService } from '../services/tax-receipt.service'
import { TaxReceiptGeneratorService } from '../services/tax-receipt-generator.service'
import { PrismaService } from '@/infrastructure'

import type { PrismaClient, TaxReceipt } from '@generated/prisma/client'

describe('TaxReceiptService', () => {
  const prismaServiceMock = mockDeep<PrismaService>()
  const fileServiceMock = mockDeep<FileService>()
  const taxReceiptGeneratorServiceMock = mockDeep<TaxReceiptGeneratorService>()
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
        mockDeep<Awaited<ReturnType<PrismaClient['donation']['findMany']>>>([
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
        mockDeep<Awaited<ReturnType<PrismaClient['donation']['findMany']>>>([
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
          (Awaited<ReturnType<PrismaClient['donation']['findMany']>>[number] & {
            organisation: { isTaxReceiptEnabled: boolean }
            donationType: { isTaxReceiptEnabled: boolean }
          })[]
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
          (Awaited<ReturnType<PrismaClient['donation']['findMany']>>[number] & {
            organisation: { isTaxReceiptEnabled: boolean }
            donationType: { isTaxReceiptEnabled: boolean }
          })[]
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
        mockDeep<TaxReceipt>({ id: 'new-tax-receipt-id' }),
      )

      taxReceiptService.processTaxReceiptGeneration = jest.fn().mockResolvedValueOnce(void 0)

      const taxReceiptId = await taxReceiptService.createTaxReceipt({
        donationIds: ['donation-1'],
        taxReceiptType: 'INDIVIDUAL',
      })

      expect(taxReceiptId).toBe('new-tax-receipt-id')
      expect(prismaServiceMock.$transaction).toHaveBeenCalledTimes(1)
      expect(prismaServiceMock.taxReceipt.create).toHaveBeenCalledTimes(1)
      expect(prismaServiceMock.donation.updateMany).toHaveBeenCalledTimes(1)
      expect(taxReceiptService.processTaxReceiptGeneration).toHaveBeenCalledTimes(1)
    })
  })

  it('processes tax receipt generation', async () => {
    prismaServiceMock.donation.findMany.mockResolvedValueOnce(
      mockDeep<Awaited<ReturnType<PrismaClient['donation']['findMany']>>>([
        {
          id: 'donation-1',
          donorId: 'donor-1',
        },
      ]),
    )

    taxReceiptGeneratorServiceMock.generateTaxReceipt.mockResolvedValueOnce(
      Buffer.from('pdf-file-buffer'),
    )

    fileServiceMock.createFile.mockResolvedValueOnce('generated-file-id-123')

    await taxReceiptService.processTaxReceiptGeneration({
      taxReceiptId: 'tax-receipt-id-123',
      donationIds: ['donation-1'],
      taxReceiptType: 'INDIVIDUAL',
    })

    expect(prismaServiceMock.taxReceipt.update).toHaveBeenCalledWith({
      where: { id: 'tax-receipt-id-123' },
      data: { status: 'PROCESSING' },
    })
    expect(prismaServiceMock.donation.findMany).toHaveBeenCalledTimes(1)
    expect(taxReceiptGeneratorServiceMock.generateTaxReceipt).toHaveBeenCalledTimes(1)
    expect(fileServiceMock.createFile).toHaveBeenCalledTimes(1)
    expect(prismaServiceMock.taxReceipt.update).toHaveBeenCalledTimes(2)
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
        mockDeep<TaxReceipt>({
          id: 'tax-receipt-id-123',
          status: 'COMPLETED',
        }),
      )
      fileServiceMock.downloadFile.mockResolvedValueOnce(
        mockDeep<Awaited<ReturnType<typeof fileServiceMock.downloadFile>>>({
          buffer: Buffer.from('original-pdf-buffer'),
        }),
      )
      taxReceiptGeneratorServiceMock.cancelTaxReceipt.mockResolvedValueOnce(
        Buffer.from('canceled-pdf-buffer'),
      )

      await taxReceiptService.cancelTaxReceipt('tax-receipt-id-123', {
        canceledReason: 'Duplicate receipt',
      })

      expect(prismaServiceMock.taxReceipt.update).toHaveBeenCalledTimes(1)
      expect(prismaServiceMock.donation.updateMany).toHaveBeenCalledTimes(1)
      expect(fileServiceMock.downloadFile).toHaveBeenCalledTimes(1)
      expect(taxReceiptGeneratorServiceMock.cancelTaxReceipt).toHaveBeenCalledTimes(1)
      expect(fileServiceMock.updateFileContent).toHaveBeenCalledTimes(1)
    })
  })
})
