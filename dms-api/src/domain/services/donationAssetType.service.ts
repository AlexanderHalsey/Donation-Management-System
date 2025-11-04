import { Injectable } from '@nestjs/common'

import { PrismaService } from '@/infrastructure'

import { DonationAssetType } from '@shared/models'

@Injectable()
export class DonationAssetTypeService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<DonationAssetType[]> {
    return this.prisma.donationAssetType.findMany()
  }
}
