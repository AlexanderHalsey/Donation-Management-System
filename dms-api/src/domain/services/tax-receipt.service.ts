import { BadRequestException, Injectable } from '@nestjs/common'

import { uniq } from 'es-toolkit'
import { isEmpty } from 'es-toolkit/compat'
import { nullsToUndefined } from '@shared/utils'

import { PrismaService } from '@/infrastructure'

import { FileService } from './file.service'
import { TaxReceiptGeneratorService } from './tax-receipt-generator.service'

import type {
  TaxReceiptListItem,
  TaxReceiptListFilter,
  TaxReceiptListPaginationRequest,
  TaxReceiptType,
} from '@shared/models'
import { CancelTaxReceiptRequest } from '@/api/dtos'

@Injectable()
export class TaxReceiptService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
    private readonly taxReceiptGeneratorService: TaxReceiptGeneratorService,
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

  async createTaxReceipt({
    donationIds,
    taxReceiptType,
  }: {
    donationIds: string[]
    taxReceiptType: TaxReceiptType
  }): Promise<string> {
    const donations = await this.prisma.donation.findMany({
      where: { id: { in: donationIds } },
      include: {
        organisation: {
          select: { id: true, isTaxReceiptEnabled: true, logoId: true, signatureId: true },
        },
        donationType: { select: { isTaxReceiptEnabled: true } },
      },
    })

    if (donations.length !== donationIds.length) {
      throw new BadRequestException('One or more donations not found')
    }

    const donorIds = uniq(donations.map((donation) => donation.donorId))

    if (donorIds.length > 1) {
      throw new BadRequestException(
        'Donations must belong to the same donor. Current donor IDs: ' + donorIds.join(', '),
      )
    }

    donations.forEach((donation) => {
      if (donation.taxReceiptId) {
        throw new BadRequestException(
          'Donation already has a tax receipt associated with it : ' + donation.taxReceiptId,
        )
      }
      if (
        !donation.organisation.isTaxReceiptEnabled ||
        !donation.donationType.isTaxReceiptEnabled
      ) {
        throw new BadRequestException(
          'Tax receipts are not enabled for this donation : ' + donation.id,
        )
      }
    })

    const { id: taxReceiptId, receiptNumber: taxReceiptNumber } = await this.prisma.$transaction(
      async (tx) => {
        const taxReceipt = await tx.taxReceipt.create({
          data: {
            type: taxReceiptType,
            status: 'PENDING',
            donorId: donorIds[0],
          },
          select: { id: true, receiptNumber: true },
        })

        await tx.donation.updateMany({
          where: { id: { in: donationIds } },
          data: { taxReceiptId: taxReceipt.id },
        })

        return taxReceipt
      },
    )

    // To be queued later, catch is temporary until a proper job queue is implemented
    this.processTaxReceiptGeneration({
      taxReceiptId,
      taxReceiptNumber,
      donationIds,
      taxReceiptType,
    }).catch((error) => {
      this.handleTaxReceiptGenerationFailure(taxReceiptId, error)
    })

    return taxReceiptId
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

    const organisations = uniq(donations.map((donation) => donation.organisation))

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
      throw new Error('Organisation details are incomplete for tax receipt generation')
    }

    if (donations.length < donationIds.length) {
      throw new Error('One or more donations not found during tax receipt processing')
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
  }

  async cancelTaxReceipt(id: string, request: CancelTaxReceiptRequest): Promise<void> {
    await this.prisma.$transaction(
      async (tx) => {
        const taxReceipt = await this.prisma.taxReceipt.findUniqueOrThrow({
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
        await this.prisma.donation.updateMany({
          where: { taxReceiptId: id },
          data: { taxReceiptId: null },
        })

        const { buffer: originalBuffer } = await this.fileService.downloadFile(taxReceipt.file.id)
        const canceledBuffer =
          await this.taxReceiptGeneratorService.cancelTaxReceipt(originalBuffer)
        await this.fileService.updateFileContent(taxReceipt.file, canceledBuffer)
      },
      { timeout: 2 * 60 * 1000 },
    )
  }

  async handleTaxReceiptGenerationFailure(taxReceiptId: string, _error: Error): Promise<void> {
    await this.prisma.taxReceipt.update({
      where: { id: taxReceiptId },
      data: { status: 'FAILED' },
    })
  }
}
