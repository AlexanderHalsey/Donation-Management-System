import { Injectable } from '@nestjs/common'

import { omit } from 'es-toolkit'
import { isEmpty } from 'es-toolkit/compat'
import { nullsToUndefined } from '@shared/utils'

import { PrismaService } from '@/infrastructure'
import { getDonorListItem } from '@generated/prisma/sql'

import {
  Donor,
  DonorListFilter,
  DonorListItem,
  DonorListPaginationRequest,
  DonorRef,
} from '@shared/models'

@Injectable()
export class DonorService {
  constructor(private readonly prisma: PrismaService) {}

  async getFilteredList(
    pagination: DonorListPaginationRequest,
    filter?: DonorListFilter,
  ): Promise<{ donors: DonorListItem[]; totalCount: number }> {
    const startDate = filter?.donatedAt?.gte || null
    const endDate = filter?.donatedAt?.lte || null
    const donorIds = filter?.id?.in ? filter.id.in.join(',') : null
    const minAmount = filter?.totalAmount?.gte || null
    const maxAmount = filter?.totalAmount?.lte || null

    Object.keys(pagination.orderBy ?? {}).forEach((key) =>
      pagination.orderBy![key] === undefined ? delete pagination.orderBy![key] : {},
    )
    pagination.orderBy = isEmpty(pagination.orderBy) ? { updatedAt: 'desc' } : pagination.orderBy
    const [orderByField, orderByDirection] = Object.entries(pagination.orderBy)[0]
    const limit = pagination.pageSize
    const offset = (pagination.page - 1) * pagination.pageSize

    const donors = await this.prisma.$queryRawTyped(
      getDonorListItem(
        startDate,
        endDate,
        donorIds,
        minAmount,
        maxAmount,
        orderByField,
        orderByDirection,
        limit,
        offset,
      ),
    )

    const items = donors.map((donor) => ({
      ...donor,
      donationCount: Number(donor.donationCount),
      donationTotalAmount: donor.donationTotalAmount ?? 0,
      // remove totalCount from each item
      totalCount: undefined,
    }))
    const totalCount = donors.length > 0 ? Number(donors[0].totalCount) : 0

    return { donors: nullsToUndefined(items), totalCount }
  }

  async getAllRefs(): Promise<DonorRef[]> {
    return nullsToUndefined(
      await this.prisma.donor.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          isDisabled: true,
        },
      }),
    )
  }

  async getById(donorId: string): Promise<Donor> {
    const donor = await this.prisma.donor.findUniqueOrThrow({
      where: { id: donorId },
      include: {
        donations: {
          select: {
            amount: true,
          },
        },
      },
    })
    return nullsToUndefined({
      ...omit(donor, ['donations']),
      donationCount: donor.donations.length,
      donationTotalAmount: donor.donations.reduce((sum, donation) => sum + donation.amount, 0),
    })
  }
}
