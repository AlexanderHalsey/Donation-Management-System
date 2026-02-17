import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager'

import { uniqBy } from 'es-toolkit'
import { isEmpty } from 'es-toolkit/compat'
import { nullsToUndefined } from '@shared/utils'

import { BullMQService, PrismaService } from '@/infrastructure'

import { FileService } from './file.service'
import { TaxReceiptGeneratorService } from './taxReceiptGenerator.service'

import { WorkerJobProcessException, WorkerJobScheduleException } from '../exceptions'

import type {
  TaxReceiptListItem,
  TaxReceiptListFilter,
  TaxReceiptListPaginationRequest,
  TaxReceiptStatus,
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
  private readonly logger = new Logger(TaxReceiptService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
    private readonly taxReceiptGeneratorService: TaxReceiptGeneratorService,
    private readonly bullMQService: BullMQService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
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

    this.logger.log(`Retrieved ${taxReceipts.length} filtered tax receipts`)

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

    this.logger.log(`Retrieved tax receipt with id ${id}`)

    return nullsToUndefined({
      ...taxReceipt,
      donationIds: taxReceipt.donations.map((donation) => donation.id),
    })
  }

  async getTaxReceiptStatusCounts(): Promise<Record<TaxReceiptStatus, number>> {
    const result = await this.prisma.taxReceipt.groupBy({
      by: ['status'],
      _count: { id: true },
    })

    const statusCounts = result.reduce(
      (acc, item) => {
        acc[item.status] = item._count.id
        return acc
      },
      {} as Record<TaxReceiptStatus, number>,
    )

    this.logger.log(`Retrieved tax receipt status counts: ${JSON.stringify(statusCounts)}`)

    return statusCounts
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

        this.logger.log(
          `Created individual tax receipt with id ${taxReceipt.id} for donation ${donationId}`,
        )

        return taxReceipt
      },
    )

    this.logger.log(
      `Scheduling generation job for tax receipt ${taxReceiptId} of donation ${donationId}`,
    )

    try {
      await this.bullMQService.addTaxReceiptJob('GENERATE', {
        taxReceiptId,
        taxReceiptNumber,
        donationIds: [donationId],
        taxReceiptType: 'INDIVIDUAL',
      })
    } catch (error) {
      await this.handleTaxReceiptGenerationFailure({ taxReceiptId })
      throw new InternalServerErrorException({
        code: 'TAX_RECEIPT_JOB_SCHEDULING_FAILED',
        message: `Failed to schedule tax receipt generation job for tax receipt ID ${taxReceiptId}`,
        stack: error.stack,
      })
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
      throw new BadRequestException({
        code: 'TAX_RECEIPT_YEAR_NOT_RELEASED',
        message: `Annual tax receipts for year ${year} cannot be generated before ${TAX_RECEIPT_RELEASE_MONTH_INDEX + 1}/${TAX_RECEIPT_RELEASE_DAY}/${new Date().getFullYear()}`,
      })
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
          throw new BadRequestException({
            code: 'NO_DONATIONS_FOUND_FOR_DONOR',
            message: `No donations found for donor ID ${donor.id} in organisation ID ${organisationId} for year ${year}`,
          })
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

      this.logger.log(
        `Created ${taxReceipts.length} annual tax receipts for organisation ID ${organisationId} and year ${year}`,
      )

      return taxReceipts
    })

    this.logger.log(
      `Scheduling generation jobs for ${taxReceipts.length} annual tax receipts for organisation ID ${organisationId} and year ${year}`,
    )

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
        await this.handleTaxReceiptGenerationFailure({ taxReceiptId: taxReceipt.id })
      }
      throw new InternalServerErrorException({
        code: 'TAX_RECEIPT_JOB_SCHEDULING_FAILED',
        message: `Failed to schedule tax receipt generation jobs for annual tax receipts for organisation ID ${organisationId} and year ${year}`,
        stack: error.stack,
      })
    }

    return { taxReceiptIds: taxReceipts.map((tr) => tr.id) }
  }

  async processTaxReceiptGenerationJob({
    jobId,
    taxReceiptId,
    taxReceiptNumber,
    donationIds,
    taxReceiptType,
  }: {
    jobId: string
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

    this.logger.log(
      `Processing tax receipt generation for tax receipt ID ${taxReceiptId} and job ID ${jobId}`,
    )

    const organisations = uniqBy(
      donations.map((donation) => donation.organisation),
      (org) => org.id,
    )

    if (organisations.length > 1) {
      throw new WorkerJobProcessException({
        code: 'MULTIPLE_ORGANISATIONS_FOUND',
        message: `Donations must belong to the same organisation. Current organisation IDs: ${organisations.map((org) => org.id).join(', ')}`,
      })
    }

    const organisation = organisations[0]

    if (
      [
        'title',
        'streetAddress',
        'postalCode',
        'city',
        'object',
        'objectDescription',
        'signatoryName',
        'signatoryPosition',
        'logoId',
        'signatureId',
      ].some((field) => !organisation?.[field as keyof typeof organisation])
    ) {
      throw new WorkerJobProcessException({
        code: 'INCOMPLETE_ORGANISATION_DETAILS',
        message: 'Organisation details are incomplete for tax receipt generation',
      })
    }

    if (donations.length < donationIds.length) {
      throw new WorkerJobProcessException({
        code: 'DONATIONS_NOT_FOUND',
        message: 'One or more donations not found during tax receipt processing',
      })
    }

    const [logo, signature] = await Promise.all([
      this.getCachedFileBuffer(
        organisation.logoId!,
        `organisation_${organisation.id}_${organisation.updatedAt.toISOString().replace(/:/g, '-')}_logo`,
      ),
      this.getCachedFileBuffer(
        organisation.signatureId!,
        `organisation_${organisation.id}_${organisation.updatedAt.toISOString().replace(/:/g, '-')}_signature`,
      ),
    ])

    const pdfBuffer = await this.taxReceiptGeneratorService.generateTaxReceipt({
      taxReceiptNumber,
      organisation: {
        title: organisation.title!,
        streetAddress: organisation.streetAddress!,
        postalCode: organisation.postalCode!,
        city: organisation.city!,
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

    this.logger.log(
      `Generated PDF buffer for tax receipt ID ${taxReceiptId}, size: ${pdfBuffer.length} bytes`,
    )

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

    this.logger.log(`Updated tax receipt ID ${taxReceiptId} with file ID ${fileId}`)

    if (donations[0].donor.email && taxReceiptType === 'ANNUAL') {
      this.logger.log(
        `Scheduling email job for tax receipt ID ${taxReceiptId} to be sent to ${donations[0].donor.email}`,
      )
      try {
        await this.bullMQService.addEmailJob({
          to: donations[0].donor.email,
          taxReceiptNumber,
          fileId,
        })
      } catch (err) {
        throw new WorkerJobScheduleException({
          code: 'EMAIL_JOB_SCHEDULING_FAILED',
          message: `Failed to schedule email job for tax receipt ID ${taxReceiptId} and donor email ${donations[0].donor.email}`,
          stack: err instanceof Error ? err.stack : undefined,
        })
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
          throw new BadRequestException({
            code: 'TAX_RECEIPT_CANCELLATION_NOT_ALLOWED',
            message: 'Tax receipt status does not allow cancellation. Status: ' + taxReceipt.status,
          })
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

    this.logger.log(`Canceled tax receipt with id ${id} and scheduled cancellation processing`)
  }

  async processTaxReceiptCancellationJob({
    jobId,
    fileId,
    storageKey,
  }: {
    jobId: string
    fileId: string
    storageKey: string
  }): Promise<void> {
    const { buffer: existingPdfBuffer } = await this.fileService.downloadFile(fileId)
    const canceledPdfBuffer =
      await this.taxReceiptGeneratorService.cancelTaxReceipt(existingPdfBuffer)
    await this.fileService.updateFileContent({
      id: fileId,
      storageKey,
      mimeType: 'application/pdf',
      buffer: canceledPdfBuffer,
    })
    this.logger.log(`Processed tax receipt cancellation for file ID ${fileId} in job ID ${jobId}`)
  }

  async handleTaxReceiptGenerationFailure({
    jobId,
    taxReceiptId,
  }: {
    jobId?: string
    taxReceiptId: string
  }): Promise<void> {
    await this.prisma.taxReceipt.update({ where: { id: taxReceiptId }, data: { status: 'FAILED' } })
    this.logger.warn(
      `Marked tax receipt ID ${taxReceiptId}${jobId ? ` with jobId ${jobId}` : ''} as FAILED due to generation error`,
    )
  }

  private async getCachedFileBuffer(fileId: string, cacheKey: string): Promise<Buffer> {
    const cachedBuffer = await this.cacheManager.get<Buffer>(cacheKey)
    if (cachedBuffer) {
      this.logger.log(`Cache hit for file ID ${fileId} with cache key ${cacheKey}`)
      return cachedBuffer
    } else {
      this.logger.log(
        `Cache miss for file ID ${fileId} with cache key ${cacheKey}. Downloading from storage.`,
      )
      const { buffer } = await this.fileService.downloadFile(fileId)
      await this.cacheManager.set(cacheKey, buffer, 24 * 60 * 60 * 1000) // 24 hours
      return buffer
    }
  }
}
