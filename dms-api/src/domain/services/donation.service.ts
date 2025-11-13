import { Injectable } from '@nestjs/common'

import { nullsToUndefined } from '@shared/utils'

import { PrismaService } from '@/infrastructure'

import { Donation, DonationListPaginationRequest, DonationListFilter } from '@shared/models'

const DONATION_QUERY_OPTIONS = {
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
    donor: {
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        firstName: true,
        lastName: true,
      },
    },
  },
  omit: {
    donationAssetTypeId: true,
    donationMethodId: true,
    donationTypeId: true,
    organisationId: true,
    paymentModeId: true,
  },
} as const

@Injectable()
export class DonationService {
  constructor(private readonly prisma: PrismaService) {}

  async getFilteredList(
    pagination: DonationListPaginationRequest,
    filter?: DonationListFilter,
  ): Promise<Donation[]> {
    return (
      await this.prisma.donation.findMany({
        ...DONATION_QUERY_OPTIONS,
        where: filter,
        orderBy: pagination.orderBy,
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
      })
    ).map(nullsToUndefined)
  }

  async getCount(filter?: DonationListFilter): Promise<number> {
    return this.prisma.donation.count({
      where: filter,
    })
  }

  async getById(donationId: string): Promise<Donation> {
    return nullsToUndefined(
      await this.prisma.donation.findUniqueOrThrow({
        where: { id: donationId },
        ...DONATION_QUERY_OPTIONS,
      }),
    )
  }

  // for create and update ensure donationType and organisation are correctly linked
}
