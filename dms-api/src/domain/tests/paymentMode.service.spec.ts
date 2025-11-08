import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { mockDeep, mockReset } from 'jest-mock-extended'

import { PaymentModeService } from '../services/paymentMode.service'
import { PrismaService } from '@/infrastructure'

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
    prismaServiceMock.paymentMode.findMany.mockResolvedValueOnce([])

    await paymentModeService.getAll()

    expect(prismaServiceMock.paymentMode.findMany).toHaveBeenCalledTimes(1)
  })
})
