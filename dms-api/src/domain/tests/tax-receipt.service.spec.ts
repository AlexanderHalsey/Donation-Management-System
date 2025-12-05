import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { mockDeep, mockReset } from 'jest-mock-extended'

import { TaxReceiptService } from '../services/tax-receipt.service'
import { PrismaService } from '@/infrastructure'

import { TaxReceipt } from '@generated/prisma/client'

describe('TaxReceiptService', () => {
  const prismaServiceMock = mockDeep<PrismaService>()
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

  describe('should cancel tax receipt', () => {
    it('throws error if tax receipt is already canceled', async () => {
      prismaServiceMock.taxReceipt.findFirstOrThrow.mockResolvedValueOnce(
        mockDeep<TaxReceipt>({
          id: 'tax-receipt-id-123',
          isCanceled: true,
        }),
      )

      await expect(
        taxReceiptService.cancelTaxReceipt('tax-receipt-id-123', {
          canceledReason: 'Duplicate receipt',
        }),
      ).rejects.toThrow('Tax receipt is already canceled')
    })

    it('successfully cancels tax receipt', async () => {
      prismaServiceMock.taxReceipt.findFirstOrThrow.mockResolvedValueOnce(
        mockDeep<TaxReceipt>({
          id: 'tax-receipt-id-123',
          isCanceled: false,
        }),
      )
      prismaServiceMock.taxReceipt.update.mockResolvedValueOnce(mockDeep<TaxReceipt>())

      await taxReceiptService.cancelTaxReceipt('tax-receipt-id-123', {
        canceledReason: 'Duplicate receipt',
      })

      expect(prismaServiceMock.taxReceipt.update).toHaveBeenCalledTimes(1)
    })
  })
})
