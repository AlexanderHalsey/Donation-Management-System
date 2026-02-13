import { BadRequestException, Injectable, Logger } from '@nestjs/common'

import { uniqBy } from 'es-toolkit'
import { isEmpty } from 'es-toolkit/compat'
import { nullsToUndefined, type RecursivelyReplaceNullWithUndefined } from '@shared/utils'

import {
  ELIGIBLE_TAX_RECEIPT_DONATION_FILTER,
  getTaxReceiptYearEnd,
  getTaxReceiptYearStart,
} from './taxReceipt.service'

import { PrismaService } from '@/infrastructure'

import { getTaxReceiptStatusOptions } from '@shared/constants'

import {
  Donation,
  DonationExport,
  DonationListFilter,
  DonationListItem,
  DonationListPaginationRequest,
  DonationListSortOrder,
  Donor,
} from '@shared/models'

import { DonationRequest } from '@/api/dtos'
import { Language } from '../types'

const BASIC_INCLUDE_FIELDS = {
  donationType: true,
  organisation: {
    select: {
      id: true,
      name: true,
      isDisabled: true,
      isTaxReceiptEnabled: true,
    },
  },
  paymentMode: true,
  donor: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      isDisabled: true,
    },
  },
} as const

const FULL_INCLUDE_FIELDS = {
  ...BASIC_INCLUDE_FIELDS,
  donationMethod: true,
  donationAssetType: true,
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
  private readonly logger = new Logger(DonationService.name)

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

    this.logger.log(`Fetched ${totalCount} filtered donations`)

    return {
      donations: donations.map((donation) => this.transformToDonationModel(donation)),
      totalCount,
    }
  }

  async getById(donationId: string): Promise<Donation> {
    const donation = await this.prisma.donation.findUniqueOrThrow({
      where: { id: donationId },
      include: FULL_INCLUDE_FIELDS,
      omit: BASIC_OMIT_FIELDS,
    })

    this.logger.log(`Fetched donation with ID: ${donationId}`)

    return this.transformToDonationModel(donation)
  }

  async getEligibleTaxReceiptYearOrganisations(): Promise<
    {
      year: number
      organisationId: string
    }[]
  > {
    const donations = await this.prisma.donation.findMany({
      select: { donatedAt: true, organisation: { select: { id: true } } },
      where: {
        ...ELIGIBLE_TAX_RECEIPT_DONATION_FILTER,
        // Only consider donations from previous years
        donatedAt: { lte: getTaxReceiptYearEnd(new Date().getFullYear() - 1) },
      },
    })

    const eligibleYearOrganisations = uniqBy(
      donations.map((donation) => ({
        year: donation.donatedAt.getFullYear(),
        organisationId: donation.organisation.id,
      })),
      (entry) => `${entry.year}-${entry.organisationId}`,
    )

    this.logger.log(
      `Fetched ${eligibleYearOrganisations.length} eligible year-organisation combinations for tax receipts`,
    )

    return eligibleYearOrganisations
  }

  async getEligibleTaxReceiptDonations({
    year,
    organisationId,
  }: {
    year: number
    organisationId: string
  }): Promise<(DonationListItem & { donor: Donor })[]> {
    const donations = await this.prisma.donation.findMany({
      include: {
        ...BASIC_INCLUDE_FIELDS,
        donor: true,
      },
      omit: BASIC_OMIT_FIELDS,
      where: {
        ...ELIGIBLE_TAX_RECEIPT_DONATION_FILTER,
        organisationId,
        donatedAt: {
          gte: getTaxReceiptYearStart(year),
          lte: getTaxReceiptYearEnd(year),
        },
      },
      orderBy: { updatedAt: 'desc' },
    })
    if (!donations.length) {
      throw new BadRequestException({
        code: 'NO_ELIGIBLE_DONATIONS',
        message: `No eligible donations found for organisation ID: ${organisationId} in year: ${year}`,
      })
    }
    const eligibleTaxReceiptDonations = donations.map((donation) => {
      const transformedDonation = this.transformToDonationModel(donation)
      return {
        ...transformedDonation,
        donor: {
          ...transformedDonation.donor,
          donationCount: donations.filter((d) => d.donor.id === donation.donor.id).length,
          donationTotalAmount: donations
            .filter((d) => d.donor.id === donation.donor.id)
            .reduce((sum, d) => sum + d.amount, 0),
        },
      }
    })

    this.logger.log(
      `Fetched ${eligibleTaxReceiptDonations.length} eligible donations for tax receipts for organisation ID: ${organisationId} in year: ${year}`,
    )

    return eligibleTaxReceiptDonations
  }

  async createDonation(formData: DonationRequest): Promise<Donation> {
    await this._validateDonationType(formData)

    const donation = await this.prisma.donation.create({
      data: {
        donorId: formData.donorId,
        donatedAt: formData.donatedAt,
        amount: formData.amount,
        organisationId: formData.organisationId,
        donationTypeId: formData.donationTypeId,
        paymentModeId: formData.paymentModeId,
        donationMethodId: formData.donationMethodId,
        donationAssetTypeId: formData.donationAssetTypeId,
      },
      include: FULL_INCLUDE_FIELDS,
      omit: BASIC_OMIT_FIELDS,
    })

    this.logger.log(`Created donation with ID: ${donation.id}`)

    return this.transformToDonationModel(donation)
  }

  async updateDonation(donationId: string, formData: DonationRequest): Promise<Donation> {
    const existingDonation = await this.prisma.donation.findUniqueOrThrow({
      where: { id: donationId },
      select: { taxReceiptId: true },
    })

    if (existingDonation.taxReceiptId) {
      throw new BadRequestException({
        code: 'DONATION_HAS_TAX_RECEIPT',
        message:
          "Can't update donation. Donation already has a tax receipt associated with it :" +
          existingDonation.taxReceiptId,
      })
    }

    await this._validateDonationType(formData)

    const donation = await this.prisma.donation.update({
      data: {
        donorId: formData.donorId,
        donatedAt: formData.donatedAt,
        amount: formData.amount,
        organisationId: formData.organisationId,
        donationTypeId: formData.donationTypeId,
        paymentModeId: formData.paymentModeId,
        donationMethodId: formData.donationMethodId,
        donationAssetTypeId: formData.donationAssetTypeId,
      },
      where: { id: donationId },
      include: FULL_INCLUDE_FIELDS,
      omit: BASIC_OMIT_FIELDS,
    })

    this.logger.log(`Updated donation with ID: ${donationId}`)

    return this.transformToDonationModel(donation)
  }

  async deleteDonation(donationId: string): Promise<void> {
    const donation = await this.prisma.donation.findUniqueOrThrow({
      where: { id: donationId },
      select: { taxReceiptId: true },
    })

    if (donation.taxReceiptId) {
      throw new BadRequestException({
        code: 'DONATION_HAS_TAX_RECEIPT',
        message:
          "Can't delete donation. Donation already has a tax receipt associated with it :" +
          donation.taxReceiptId,
      })
    }

    await this.prisma.donation.delete({
      where: { id: donationId },
    })

    this.logger.log(`Deleted donation with ID: ${donationId}`)
  }

  async getExportList(
    orderBy: DonationListSortOrder,
    language: Language,
    filter?: DonationListFilter,
  ): Promise<DonationExport[]> {
    const donations = await this.prisma.donation.findMany({
      include: { ...FULL_INCLUDE_FIELDS, taxReceipt: true },
      omit: BASIC_OMIT_FIELDS,
      where: filter,
      orderBy: isEmpty(orderBy) ? { updatedAt: 'desc' } : orderBy,
    })
    const donationExportList = donations.map((donation) => ({
      donatedAt: donation.donatedAt,
      amount: donation.amount,
      lastName: donation.donor.lastName,
      firstName: donation.donor.firstName || undefined,
      paymentMode: donation.paymentMode.name,
      donationType: donation.donationType.name,
      organisation: donation.organisation.name,
      donationMethod: donation.donationMethod?.name || undefined,
      donationAssetType: donation.donationAssetType?.name || undefined,
      taxReceiptNumber: donation.taxReceipt?.receiptNumber || undefined,
      taxReceiptType: donation.taxReceipt?.type || undefined,
      taxReceiptStatus:
        getTaxReceiptStatusOptions(language).find(
          (option) => option.id === donation.taxReceipt?.status,
        )?.name || undefined,
    }))

    this.logger.log(`Fetched ${donationExportList.length} donations for export`)

    return donationExportList
  }

  async getDonationStats(minDate?: Date): Promise<{ count: number; amount: number }> {
    const result = await this.prisma.donation.aggregate({
      where: minDate ? { donatedAt: { gte: minDate } } : undefined,
      _sum: { amount: true },
      _count: { id: true },
    })

    const donationStats = {
      count: result._count.id,
      amount: result._sum.amount || 0,
    }

    this.logger.log(
      `Fetched${minDate ? ' ' : ' all'} donation stats${minDate ? ` since ${minDate.toISOString()}` : ''}: ${JSON.stringify(donationStats)}`,
    )

    return donationStats
  }

  async getDonationDistribution(
    groupBy: 'paymentModeId' | 'organisationId' | 'donationTypeId',
  ): Promise<{ id: string; count: number; amount: number }[]> {
    const result = await this.prisma.donation.groupBy({
      by: [groupBy],
      _sum: { amount: true },
      _count: { id: true },
    })

    const donationDistribution = result.map((item) => ({
      id: item[groupBy],
      count: item._count.id,
      amount: item._sum.amount || 0,
    }))

    this.logger.log(
      `Fetched donation distribution grouped by ${groupBy}: ${JSON.stringify(donationDistribution)}`,
    )

    return donationDistribution
  }

  private async _validateDonationType(formData: DonationRequest) {
    try {
      await this.prisma.donationType.findUniqueOrThrow({
        where: { id: formData.donationTypeId, organisationId: formData.organisationId },
      })
    } catch {
      throw new BadRequestException({
        code: 'INVALID_DONATION_TYPE',
        message: `Invalid donation type ID: ${formData.donationTypeId} for organisation ID: ${formData.organisationId}`,
      })
    }
  }

  transformToDonationModel<
    T extends {
      organisation: { isTaxReceiptEnabled: boolean }
      donationType: { isTaxReceiptEnabled: boolean }
    },
  >(donation: T): RecursivelyReplaceNullWithUndefined<T> & { isTaxReceiptEnabled: boolean } {
    const isTaxReceiptEnabled =
      donation.organisation.isTaxReceiptEnabled && donation.donationType.isTaxReceiptEnabled
    return {
      ...nullsToUndefined(donation),
      isTaxReceiptEnabled,
    }
  }
}
