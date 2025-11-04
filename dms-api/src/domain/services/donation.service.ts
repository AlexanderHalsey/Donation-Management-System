import { Injectable } from '@nestjs/common'

import { nullsToUndefined } from '@shared/utils'

import { PrismaService } from '@/infrastructure'

import { DonationPaginationRequest } from '@/api/dtos'
import { Donation } from '@shared/models'

@Injectable()
export class DonationService {
  constructor(private readonly prisma: PrismaService) {}

  async getFilteredList(pagination: DonationPaginationRequest): Promise<Donation[]> {
    return (
      await this.prisma.donation.findMany({
        include: {
          donationAssetType: true,
          donationMethod: true,
          donationType: true,
          organisation: {
            select: {
              id: true,
              createdAt: true,
              updatedAt: true,
              name: true,
            },
          },
          paymentMode: true,
        },
        omit: {
          donationAssetTypeId: true,
          donationMethodId: true,
          donationTypeId: true,
          organisationId: true,
          paymentModeId: true,
        },
        orderBy: pagination.orderBy,
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
      })
    ).map(nullsToUndefined)
  }

  async getTotalCount(): Promise<number> {
    return this.prisma.donation.count()
  }

  // for create and update ensure donationType and organisation are correctly linked
}
