import { BadRequestException, Injectable } from '@nestjs/common'

import { uniqBy } from 'es-toolkit'
import { isEmpty } from 'es-toolkit/compat'
import { nullsToUndefined } from '@shared/utils'

import { BullMQService, PrismaService } from '@/infrastructure'

import { FileService } from './file.service'
import { TaxReceiptGeneratorService } from './taxReceiptGenerator.service'

import type {
  TaxReceiptListItem,
  TaxReceiptListFilter,
  TaxReceiptListPaginationRequest,
  TaxReceiptType,
} from '@shared/models'
import { CancelTaxReceiptRequest } from '@/api/dtos'

export const getTaxReceiptYearStart = (year: number) => `${year}-01-01T00:00:00.000Z`
export const getTaxReceiptYearEnd = (year: number) => `${year}-12-31T23:59:59.999Z`
export const TAX_RECEIPT_RELEASE_MONTH_INDEX = 0
export const TAX_RECEIPT_RELEASE_DAY = 15
export const ELIGIBLE_TAX_RECEIPT_DONATION_FILTER = {
  taxReceiptId: null,
  donor: { isDisabled: false },
  organisation: { isTaxReceiptEnabled: true },
  donationType: { isTaxReceiptEnabled: true },
} as const

@Injectable()
export class TaxReceiptService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
    private readonly taxReceiptGeneratorService: TaxReceiptGeneratorService,
    private readonly bullMQService: BullMQService,
  ) {}

  async getFilteredList(
    pagination: TaxReceiptListPaginationRequest,
    filter?: TaxReceiptListFilter,
  ): Promise<{ taxReceipts: TaxReceiptListItem[]; totalCount: number }> {
    const [taxReceipts, totalCount] = await this.prisma.$transaction([
      this.prisma.taxReceipt.findMany({
        include: {
          donor: { select: { id: true, firstName: true, lastName: true, isDisabled: true } },
          file: { select: { id: true, name: true } },
        },
        omit: { donorId: true, fileId: true },
        where: filter,
        orderBy: isEmpty(pagination.orderBy) ? { updatedAt: 'desc' } : pagination.orderBy,
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
      }),
      this.prisma.taxReceipt.count({ where: filter }),
    ])
    return {
      taxReceipts: taxReceipts.map(nullsToUndefined),
      totalCount,
    }
  }

  async getTaxReceiptById(id: string): Promise<TaxReceiptListItem & { donationIds: string[] }> {
    const taxReceipt = await this.prisma.taxReceipt.findUniqueOrThrow({
      where: { id },
      include: { donor: true, file: true, donations: { select: { id: true } } },
    })
    return nullsToUndefined({
      ...taxReceipt,
      donationIds: taxReceipt.donations.map((donation) => donation.id),
    })
  }

  taxReceiptReleaseDate(): Date {
    return new Date(
      new Date().getFullYear(),
      TAX_RECEIPT_RELEASE_MONTH_INDEX,
      TAX_RECEIPT_RELEASE_DAY,
    )
  }

  isTaxReceiptYearReleased(year: number): boolean {
    if (year >= new Date().getFullYear()) return false
    if (year < new Date().getFullYear() - 1) return true
    return new Date() >= this.taxReceiptReleaseDate()
  }

  async createIndividualTaxReceipt({
    donationId,
  }: {
    donationId: string
  }): Promise<{ taxReceiptId: string }> {
    const donation = await this.prisma.donation.findUniqueOrThrow({
      where: {
        ...ELIGIBLE_TAX_RECEIPT_DONATION_FILTER,
        id: donationId,
      },
      select: { donor: { select: { id: true } } },
    })

    const { id: taxReceiptId, receiptNumber: taxReceiptNumber } = await this.prisma.$transaction(
      async (tx) => {
        const taxReceipt = await tx.taxReceipt.create({
          data: {
            type: 'INDIVIDUAL',
            status: 'PENDING',
            donorId: donation.donor.id,
          },
          select: { id: true, receiptNumber: true },
        })

        await tx.donation.update({
          where: { id: donationId },
          data: { taxReceiptId: taxReceipt.id },
        })

        return taxReceipt
      },
    )

    try {
      await this.bullMQService.addTaxReceiptJob('GENERATE', {
        taxReceiptId,
        taxReceiptNumber,
        donationIds: [donationId],
        taxReceiptType: 'INDIVIDUAL',
      })
    } catch (error) {
      await this.handleTaxReceiptGenerationFailure(taxReceiptId, error)
      throw error
    }

    return { taxReceiptId }
  }

  async createAnnualTaxReceipts({
    organisationId,
    donorIds,
    year,
  }: {
    organisationId: string
    donorIds: string[]
    year: number
  }): Promise<{
    taxReceiptIds: string[]
  }> {
    if (!this.isTaxReceiptYearReleased(year)) {
      throw new BadRequestException(
        `Annual tax receipts for year ${year} cannot be generated before ${TAX_RECEIPT_RELEASE_MONTH_INDEX + 1}/${TAX_RECEIPT_RELEASE_DAY}/${new Date().getFullYear()}`,
      )
    }
    const donors = await this.prisma.donor.findMany({
      where: { id: { in: donorIds } },
      select: {
        id: true,
        isDisabled: true,
        donations: {
          where: {
            ...ELIGIBLE_TAX_RECEIPT_DONATION_FILTER,
            organisationId,
            donatedAt: {
              gte: getTaxReceiptYearStart(year),
              lte: getTaxReceiptYearEnd(year),
            },
          },
          select: { id: true },
        },
      },
    })

    const taxReceipts = await this.prisma.$transaction(async (tx) => {
      donors.forEach((donor) => {
        if (donor.donations.length === 0) {
          throw new BadRequestException(
            `No donations found for donor ID ${donor.id} in organisation ID ${organisationId} for year ${year}`,
          )
        }
      })

      const taxReceipts = (
        await tx.taxReceipt.createManyAndReturn({
          data: donors.map((donor) => ({
            type: 'ANNUAL',
            status: 'PENDING',
            donorId: donor.id,
          })),
          select: { id: true, receiptNumber: true, donorId: true },
        })
      ).map((taxReceipt) => ({
        ...taxReceipt,
        donationIds: donors
          .find((donor) => donor.id === taxReceipt.donorId)!
          .donations.map((donation) => donation.id),
      }))

      for (const taxReceipt of taxReceipts) {
        await tx.donation.updateMany({
          where: { id: { in: taxReceipt.donationIds } },
          data: { taxReceiptId: taxReceipt.id },
        })
      }

      return taxReceipts
    })

    try {
      await this.bullMQService.addTaxReceiptJob(
        'GENERATE_BATCH',
        taxReceipts.map((taxReceipt) => ({
          taxReceiptId: taxReceipt.id,
          taxReceiptNumber: taxReceipt.receiptNumber,
          donationIds: taxReceipt.donationIds,
          taxReceiptType: 'ANNUAL',
        })),
      )
    } catch (error) {
      for (const taxReceipt of taxReceipts) {
        await this.handleTaxReceiptGenerationFailure(taxReceipt.id, error)
      }
      throw error
    }

    return { taxReceiptIds: taxReceipts.map((tr) => tr.id) }
  }

  async processTaxReceiptGeneration({
    taxReceiptId,
    taxReceiptNumber,
    donationIds,
    taxReceiptType,
  }: {
    taxReceiptId: string
    taxReceiptNumber: number
    donationIds: string[]
    taxReceiptType: TaxReceiptType
  }): Promise<void> {
    const [donations] = await this.prisma.$transaction([
      this.prisma.donation.findMany({
        where: { id: { in: donationIds } },
        include: {
          donor: true,
          organisation: true,
          donationMethod: true,
          paymentMode: true,
          donationAssetType: true,
        },
      }),
      this.prisma.taxReceipt.update({
        where: { id: taxReceiptId },
        data: { status: 'PROCESSING' },
      }),
    ])

    const organisations = uniqBy(
      donations.map((donation) => donation.organisation),
      (org) => org.id,
    )

    if (organisations.length > 1) {
      throw new BadRequestException(
        'Donations must belong to the same organisation. Current organisation IDs: ' +
          organisations.map((org) => org.id).join(', '),
      )
    }

    const organisation = organisations[0]

    if (
      [
        'title',
        'address',
        'postCode',
        'locality',
        'object',
        'objectDescription',
        'signatoryName',
        'signatoryPosition',
        'logoId',
        'signatureId',
      ].some((field) => !organisation?.[field as keyof typeof organisation])
    ) {
      throw new BadRequestException(
        'Organisation details are incomplete for tax receipt generation',
      )
    }

    if (donations.length < donationIds.length) {
      throw new BadRequestException('One or more donations not found during tax receipt processing')
    }

    const [{ buffer: logo }, { buffer: signature }] = await Promise.all([
      this.fileService.downloadFile(organisation.logoId!),
      this.fileService.downloadFile(organisation.signatureId!),
    ])

    const pdfBuffer = await this.taxReceiptGeneratorService.generateTaxReceipt({
      taxReceiptNumber,
      organisation: {
        title: organisation.title!,
        address: organisation.address!,
        postCode: organisation.postCode!,
        locality: organisation.locality!,
        object: organisation.object!,
        objectDescription: organisation.objectDescription!,
        signatoryName: organisation.signatoryName!,
        signatoryPosition: organisation.signatoryPosition!,
        logo,
        signature,
      },
      donor: donations[0].donor,
      donations,
      taxReceiptType,
    })

    const fileId = await this.fileService.createFile({
      name: `tax-receipt-${taxReceiptId}.pdf`,
      mimeType: 'application/pdf',
      buffer: pdfBuffer,
    })

    await this.prisma.taxReceipt.update({
      where: { id: taxReceiptId },
      data: {
        status: 'COMPLETED',
        fileId,
      },
    })

    if (donations[0].donor.email && taxReceiptType === 'ANNUAL') {
      try {
        await this.bullMQService.addEmailJob({
          to: donations[0].donor.email,
          taxReceiptNumber,
          fileId,
        })
      } catch (err) {
        console.error('Failed to add email job', { err })
      }
    }
  }

  async cancelTaxReceipt(id: string, request: CancelTaxReceiptRequest): Promise<void> {
    await this.prisma.$transaction(
      async (tx) => {
        const taxReceipt = await tx.taxReceipt.findUniqueOrThrow({
          where: { id },
          include: { file: true },
        })

        if (
          taxReceipt.status !== 'COMPLETED' ||
          taxReceipt.fileId === null ||
          taxReceipt.file === null
        ) {
          throw new BadRequestException(
            'Tax receipt status does not allow cancellation. Status: ' + taxReceipt.status,
          )
        }

        await tx.taxReceipt.update({
          where: { id },
          data: {
            status: 'CANCELED',
            canceledReason: request.canceledReason,
            canceledAt: new Date(),
          },
        })

        await tx.donation.updateMany({
          where: { taxReceiptId: id },
          data: { taxReceiptId: null },
        })

        // If this fails, the entire transaction rolls back automatically
        await this.bullMQService.addTaxReceiptJob('CANCEL', {
          fileId: taxReceipt.file.id,
          storageKey: taxReceipt.file.storageKey,
        })
      },
      { timeout: 2 * 60 * 1000 },
    )
  }

  async processTaxReceiptCancellation({
    fileId,
    storageKey,
  }: {
    fileId: string
    storageKey: string
  }): Promise<void> {
    const { buffer: existingPdfBuffer } = await this.fileService.downloadFile(fileId)
    const canceledPdfBuffer =
      await this.taxReceiptGeneratorService.cancelTaxReceipt(existingPdfBuffer)
    await this.fileService.updateFileContent(fileId, storageKey, canceledPdfBuffer)
  }

  async handleTaxReceiptGenerationFailure(taxReceiptId: string, _error: Error): Promise<void> {
    await this.prisma.taxReceipt.update({
      where: { id: taxReceiptId },
      data: { status: 'FAILED' },
    })
  }
}
