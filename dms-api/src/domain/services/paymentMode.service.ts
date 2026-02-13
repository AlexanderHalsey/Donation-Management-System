import { Inject, Injectable, Logger } from '@nestjs/common'
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager'

import { PrismaService } from '@/infrastructure'

import type { PaymentMode } from '@shared/models'
import type { PaymentModeRequest } from '@/api/dtos'

@Injectable()
export class PaymentModeService {
  private readonly logger = new Logger(PaymentModeService.name)

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async getAll(): Promise<PaymentMode[]> {
    const paymentModes = await this.prisma.paymentMode.findMany()

    this.logger.log(`Retrieved ${paymentModes.length} payment modes`)

    return paymentModes
  }

  async getById(id: string): Promise<PaymentMode> {
    const paymentMode = await this.prisma.paymentMode.findUniqueOrThrow({ where: { id } })

    this.logger.log(`Retrieved payment mode with id ${id}`)

    return paymentMode
  }

  async create(request: PaymentModeRequest): Promise<PaymentMode> {
    const paymentMode = await this.prisma.paymentMode.create({
      data: {
        name: request.name,
      },
    })

    this.logger.log(`Created payment mode with id ${paymentMode.id}`)
    await this.cacheManager.del('payment-modes')

    return paymentMode
  }

  async update(id: string, request: PaymentModeRequest): Promise<PaymentMode> {
    const paymentMode = await this.prisma.paymentMode.update({
      where: { id },
      data: {
        name: request.name,
      },
    })

    this.logger.log(`Updated payment mode with id ${id}`)
    await this.cacheManager.del('payment-modes')

    return paymentMode
  }

  async disable(id: string): Promise<PaymentMode> {
    const paymentMode = await this.prisma.paymentMode.update({
      where: { id },
      data: { isDisabled: true },
    })

    this.logger.log(`Disabled payment mode with id ${id}`)
    await this.cacheManager.del('payment-modes')

    return paymentMode
  }

  async cleanupNonAttachedDisabled(): Promise<void> {
    await this.prisma.paymentMode.deleteMany({
      where: {
        isDisabled: true,
        donations: { none: {} },
      },
    })

    this.logger.log(`Cleaned up non-attached disabled payment modes`)
    await this.cacheManager.del('payment-modes')
  }
}
