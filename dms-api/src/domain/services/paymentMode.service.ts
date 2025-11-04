import { Injectable } from '@nestjs/common'

import { PrismaService } from '@/infrastructure'

import { PaymentMode } from '@shared/models'

@Injectable()
export class PaymentModeService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<PaymentMode[]> {
    return this.prisma.paymentMode.findMany()
  }
}
