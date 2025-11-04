import { Injectable } from '@nestjs/common'

import { PrismaService } from '@/infrastructure'

import { DonationType } from '@shared/models'

@Injectable()
export class DonationTypeService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<DonationType[]> {
    return this.prisma.donationType.findMany()
  }
}
