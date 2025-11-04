import { Injectable } from '@nestjs/common'

import { PrismaService } from '@/infrastructure'

import { DonationMethod } from '@shared/models'

@Injectable()
export class DonationMethodService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<DonationMethod[]> {
    return this.prisma.donationMethod.findMany()
  }
}
