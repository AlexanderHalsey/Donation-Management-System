import { Injectable } from '@nestjs/common'

import { PrismaService } from '@/infrastructure'

import type { PaymentMode } from '@shared/models'
import type { PaymentModeRequest } from '@/api/dtos'

@Injectable()
export class PaymentModeService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<PaymentMode[]> {
    return this.prisma.paymentMode.findMany()
  }

  async getById(id: string): Promise<PaymentMode> {
    return this.prisma.paymentMode.findUniqueOrThrow({ where: { id } })
  }

  async create(request: PaymentModeRequest): Promise<PaymentMode> {
    return this.prisma.paymentMode.create({
      data: {
        name: request.name,
      },
    })
  }

  async update(id: string, request: PaymentModeRequest): Promise<PaymentMode> {
    return this.prisma.paymentMode.update({
      where: { id },
      data: {
        name: request.name,
      },
    })
  }

  async disable(id: string): Promise<PaymentMode> {
    return this.prisma.paymentMode.update({
      where: { id },
      data: { isDisabled: true },
    })
  }
}
