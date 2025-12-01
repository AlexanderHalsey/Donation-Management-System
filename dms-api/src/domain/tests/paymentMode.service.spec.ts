import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { mockDeep, mockReset } from 'jest-mock-extended'

import { PaymentModeService } from '../services/paymentMode.service'
import { PrismaService } from '@/infrastructure'

import type { PaymentMode } from '@shared/models'

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

  it('should get payment mode by ID', async () => {
    const id = 'payment-mode-id-123'
    const mockPaymentMode = mockDeep<PaymentMode>()
    prismaServiceMock.paymentMode.findUniqueOrThrow.mockResolvedValueOnce(mockPaymentMode)

    await paymentModeService.getById(id)

    expect(prismaServiceMock.paymentMode.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id },
    })
  })

  it('should create payment mode', async () => {
    const request = {
      name: 'New Payment Mode',
    }
    const createdPaymentMode = mockDeep<PaymentMode>({ id: 'new-payment-mode-id-123' })
    prismaServiceMock.paymentMode.create.mockResolvedValueOnce(createdPaymentMode)

    await paymentModeService.create(request)

    expect(prismaServiceMock.paymentMode.create).toHaveBeenCalledWith({ data: request })
  })

  it('should update payment mode', async () => {
    const id = 'payment-mode-id-123'
    const request = {
      name: 'Updated Payment Mode',
    }
    prismaServiceMock.paymentMode.update.mockResolvedValueOnce(mockDeep<PaymentMode>())

    await paymentModeService.update(id, request)

    expect(prismaServiceMock.paymentMode.update).toHaveBeenCalledWith({
      where: { id },
      data: request,
    })
  })

  it('should disable payment mode', async () => {
    const id = 'payment-mode-id-123'
    prismaServiceMock.paymentMode.update.mockResolvedValueOnce(mockDeep<PaymentMode>())

    await paymentModeService.disable(id)

    expect(prismaServiceMock.paymentMode.update).toHaveBeenCalledWith({
      where: { id },
      data: { isDisabled: true },
    })
  })
})
