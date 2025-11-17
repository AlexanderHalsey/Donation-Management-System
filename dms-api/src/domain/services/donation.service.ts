import { Injectable } from '@nestjs/common'

import { isEmpty } from 'es-toolkit/compat'
import { nullsToUndefined } from '@shared/utils'

import { PrismaService } from '@/infrastructure'

import {
  Donation,
  DonationListPaginationRequest,
  DonationListFilter,
  DonationListItem,
} from '@shared/models'

const BASIC_REF_FIELDS = {
  select: {
    id: true,
    name: true,
  },
} as const

const BASIC_INCLUDE_FIELDS = {
  donationType: BASIC_REF_FIELDS,
  organisation: BASIC_REF_FIELDS,
  paymentMode: BASIC_REF_FIELDS,
  donor: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  },
} as const

const BASIC_OMIT_FIELDS = {
  donationAssetTypeId: true,
  donationMethodId: true,
  donationTypeId: true,
  organisationId: true,
  paymentModeId: true,
  donorId: true,
} as const

@Injectable()
export class DonationService {
  constructor(private readonly prisma: PrismaService) {}

  async getFilteredList(
    pagination: DonationListPaginationRequest,
    filter?: DonationListFilter,
  ): Promise<{ donations: DonationListItem[]; totalCount: number }> {
    const [donations, totalCount] = await this.prisma.$transaction([
      this.prisma.donation.findMany({
        include: BASIC_INCLUDE_FIELDS,
        omit: BASIC_OMIT_FIELDS,
        where: filter,
        orderBy: isEmpty(pagination.orderBy) ? { updatedAt: 'desc' } : pagination.orderBy,
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
      }),
      this.prisma.donation.count({ where: filter }),
    ])
    return {
      donations: donations.map(nullsToUndefined),
      totalCount,
    }
  }

  async getById(donationId: string): Promise<Donation> {
    return nullsToUndefined(
      await this.prisma.donation.findUniqueOrThrow({
        include: {
          ...BASIC_INCLUDE_FIELDS,
          donationMethod: BASIC_REF_FIELDS,
          donationAssetType: BASIC_REF_FIELDS,
        },
        omit: BASIC_OMIT_FIELDS,
        where: { id: donationId },
      }),
    )
  }

  // for create and update ensure donationType and organisation are correctly linked
}
