import { Injectable, Logger } from '@nestjs/common'

import { PrismaService } from '@/infrastructure'

import type { DonationAssetType } from '@shared/models'
import type { DonationAssetTypeRequest } from '@/api/dtos'

@Injectable()
export class DonationAssetTypeService {
  private readonly logger = new Logger(DonationAssetTypeService.name)

  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<DonationAssetType[]> {
    const donationAssetTypes = await this.prisma.donationAssetType.findMany()

    this.logger.log(`Retrieved ${donationAssetTypes.length} donation asset types`)

    return donationAssetTypes
  }

  async getById(id: string): Promise<DonationAssetType> {
    const donationAssetType = await this.prisma.donationAssetType.findUniqueOrThrow({
      where: { id },
    })

    this.logger.log(
      `Retrieved donation asset type with ID ${id} and name "${donationAssetType.name}"`,
    )

    return donationAssetType
  }

  async create(request: DonationAssetTypeRequest): Promise<DonationAssetType> {
    return this.prisma.$transaction(async (tx) => {
      const donationAssetType = await tx.donationAssetType.create({
        data: {
          name: request.name,
          isDefault: request.isDefault,
        },
      })

      if (request.isDefault) {
        await tx.donationAssetType.updateMany({
          where: { id: { not: donationAssetType.id } },
          data: { isDefault: false },
        })
      }

      this.logger.log(
        `Created donation asset type with ID ${donationAssetType.id} and name "${donationAssetType.name}"`,
      )

      return donationAssetType
    })
  }

  async update(id: string, request: DonationAssetTypeRequest): Promise<DonationAssetType> {
    return this.prisma.$transaction(async (tx) => {
      const donationAssetType = await tx.donationAssetType.update({
        where: { id },
        data: {
          name: request.name,
          isDefault: request.isDefault,
        },
      })

      if (request.isDefault) {
        await tx.donationAssetType.updateMany({
          where: { id: { not: id } },
          data: { isDefault: false },
        })
      }

      this.logger.log(
        `Updated donation asset type with ID ${donationAssetType.id}. New name: "${donationAssetType.name}", isDefault: ${donationAssetType.isDefault}`,
      )

      return donationAssetType
    })
  }

  async disable(id: string): Promise<DonationAssetType> {
    const donationAssetType = await this.prisma.donationAssetType.update({
      where: { id },
      data: { isDisabled: true },
    })

    this.logger.log(`Disabled donation asset type with ID ${donationAssetType.id}`)

    return donationAssetType
  }

  async cleanupNonAttachedDisabled(): Promise<void> {
    await this.prisma.donationAssetType.deleteMany({
      where: {
        isDisabled: true,
        donations: { none: {} },
      },
    })

    this.logger.log('Cleaned up non-attached disabled donation asset types')
  }
}
