import { Injectable } from '@nestjs/common'

import { omit } from 'es-toolkit'
import { isEmpty } from 'es-toolkit/compat'
import { nullsToUndefined } from '@shared/utils'

import { PrismaService, TypedSqlService } from '@/infrastructure'

import { DonorCreateInput } from '@generated/prisma/models'
import {
  Donor,
  DonorExport,
  DonorListFilter,
  DonorListItem,
  DonorListPaginationRequest,
  DonorListSortOrder,
  DonorRef,
} from '@shared/models'

@Injectable()
export class DonorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly typedSql: TypedSqlService,
  ) {}

  async getFilteredList(
    pagination: DonorListPaginationRequest,
    filter?: DonorListFilter,
  ): Promise<{ donors: DonorListItem[]; totalCount: number }> {
    const startDate = filter?.donatedAt?.gte || null
    const endDate = filter?.donatedAt?.lte || null
    const donorIds = filter?.id?.in ? filter.id.in.join(',') : null
    const isDisabled = filter?.isDisabled?.equals ?? null
    const minAmount = filter?.totalAmount?.gte || null
    const maxAmount = filter?.totalAmount?.lte || null

    Object.keys(pagination.orderBy ?? {}).forEach((key) =>
      pagination.orderBy![key] === undefined ? delete pagination.orderBy![key] : {},
    )
    pagination.orderBy = isEmpty(pagination.orderBy) ? { lastName: 'asc' } : pagination.orderBy
    const [orderByField, orderByDirection] = Object.entries(pagination.orderBy)[0]
    const limit = pagination.pageSize
    const offset = (pagination.page - 1) * pagination.pageSize

    const donors = await this.prisma.$queryRawTyped(
      await this.typedSql.getDonorListItem(
        startDate,
        endDate,
        donorIds,
        isDisabled,
        minAmount,
        maxAmount,
        orderByField,
        orderByDirection,
        limit,
        offset,
      ),
    )

    const totalCount = donors.length > 0 ? Number(donors[0].totalCount ?? 0) : 0
    const items = donors.map((donor) => ({
      ...omit(donor, ['totalCount']),
      donationCount: Number(donor.donationCount ?? 0),
      donationTotalAmount: donor.donationTotalAmount ?? 0,
    }))

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

  async getExportList(
    orderBy: DonorListSortOrder,
    filter?: DonorListFilter,
  ): Promise<DonorExport[]> {
    const { donors } = await this.getFilteredList(
      {
        page: 1,
        pageSize: Number.MAX_SAFE_INTEGER,
        orderBy,
      },
      filter,
    )
    return donors
  }

  async synchronizeDonors({ toUpsert }: { toUpsert: DonorCreateInput[] }): Promise<void> {
    for (const donor of toUpsert) {
      await this.prisma.donor.upsert({
        where: { externalId: donor.externalId },
        create: donor,
        update: donor,
        select: { id: true, externalId: true },
      })
    }
  }
}
