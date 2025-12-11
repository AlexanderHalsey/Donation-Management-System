import { Injectable } from '@nestjs/common'

import { isEmpty } from 'es-toolkit/compat'
import { nullsToUndefined, type RecursivelyReplaceNullWithUndefined } from '@shared/utils'

import { PrismaService } from '@/infrastructure'

import {
  Donation,
  DonationListPaginationRequest,
  DonationListFilter,
  DonationListItem,
} from '@shared/models'
import { DonationRequest } from '@/api/dtos'

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
    return this.transformToDonationModel(donation)
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

    return this.transformToDonationModel(donation)
  }

  async updateDonation(donationId: string, formData: DonationRequest): Promise<Donation> {
    const existingDonation = await this.prisma.donation.findUniqueOrThrow({
      where: { id: donationId },
      select: { taxReceiptId: true },
    })

    if (existingDonation.taxReceiptId) {
      throw new Error(
        "Can't update donation. Donation already has a tax receipt associated with it :" +
          existingDonation.taxReceiptId,
      )
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

    return this.transformToDonationModel(donation)
  }

  async deleteDonation(donationId: string): Promise<void> {
    const donation = await this.prisma.donation.findUniqueOrThrow({
      where: { id: donationId },
      select: { taxReceiptId: true },
    })

    if (donation.taxReceiptId) {
      throw new Error(
        "Can't delete donation. Donation already has a tax receipt associated with it :" +
          donation.taxReceiptId,
      )
    }

    await this.prisma.donation.delete({
      where: { id: donationId },
    })
  }

  private async _validateDonationType(formData: DonationRequest) {
    await this.prisma.donationType.findUniqueOrThrow({
      where: { id: formData.donationTypeId, organisationId: formData.organisationId },
    })
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
