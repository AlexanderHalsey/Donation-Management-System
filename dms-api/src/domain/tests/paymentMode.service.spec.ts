import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { mockDeep, mockReset } from 'jest-mock-extended'
import { v4 } from 'uuid'

import { PaymentModeService } from '../services/paymentMode.service'
import { PrismaService } from '@/infrastructure'

import { PaymentMode } from '@shared/models'

describe('PaymentModeService', () => {
  const prismaServiceMock = mockDeep<PrismaService>()
  let paymentModeService: PaymentModeService

  beforeEach(async () => {
    jest.resetAllMocks()
    mockReset(prismaServiceMock)

    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        PaymentModeService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile()

    paymentModeService = app.get<PaymentModeService>(PaymentModeService)
  })

  it('should get payment mode list', async () => {
    const mockPaymentModes = buildMockPaymentModes()
    prismaServiceMock.paymentMode.findMany.mockResolvedValueOnce(mockPaymentModes)

    const result = await paymentModeService.getAll()

    mockPaymentModes.forEach((mockPaymentMode, index) => {
      expect(result[index]).toMatchObject({
        name: mockPaymentMode.name,
      })
    })
  })
})

export function buildMockPaymentModes(): PaymentMode[] {
  return Array.from({ length: 4 }).map((_, index) => ({
    id: v4(),
    createdAt: new Date(2024, 0, index + 1),
    updatedAt: new Date(2024, 1, index + 1),
    name: `Payment Mode ${index + 1}`,
  }))
}
