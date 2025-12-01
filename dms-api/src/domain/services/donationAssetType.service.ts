import { Injectable } from '@nestjs/common'

import { PrismaService } from '@/infrastructure'

import type { DonationAssetType } from '@shared/models'
import type { DonationAssetTypeRequest } from '@/api/dtos'

@Injectable()
export class DonationAssetTypeService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<DonationAssetType[]> {
    return this.prisma.donationAssetType.findMany()
  }

  async getById(id: string): Promise<DonationAssetType> {
    return this.prisma.donationAssetType.findUniqueOrThrow({ where: { id } })
  }

  async create(request: DonationAssetTypeRequest): Promise<DonationAssetType> {
    return this.prisma.$transaction(async (tx) => {
      const donationAssetType = await tx.donationAssetType.create({ data: request })
      if (request.isDefault) {
        await tx.donationAssetType.updateMany({
          where: { id: { not: donationAssetType.id } },
          data: { isDefault: false },
        })
      }
      return donationAssetType
    })
  }

  async update(id: string, request: DonationAssetTypeRequest): Promise<DonationAssetType> {
    return this.prisma.$transaction(async (tx) => {
      const donationAssetType = await tx.donationAssetType.update({
        where: { id },
        data: request,
      })
      if (request.isDefault) {
        await tx.donationAssetType.updateMany({
          where: { id: { not: id } },
          data: { isDefault: false },
        })
      }
      return donationAssetType
    })
  }

  async disable(id: string): Promise<DonationAssetType> {
    return this.prisma.donationAssetType.update({
      where: { id },
      data: { isDisabled: true },
    })
  }
}
