import { Injectable } from '@nestjs/common'

import { omit } from 'es-toolkit'
import { isEmpty } from 'es-toolkit/compat'
import { nullsToUndefined } from '@shared/utils'

import { PrismaService } from '@/infrastructure'

import { TaxReceiptType as PrismaTaxReceiptType } from '@generated/prisma/enums'
import { TaxReceipt as PrismaTaxReceipt } from '@generated/prisma/client'

import type {
  TaxReceiptListItem,
  TaxReceiptListFilter,
  TaxReceiptListPaginationRequest,
} from '@shared/models'

@Injectable()
export class TaxReceiptService {
  constructor(private readonly prisma: PrismaService) {}

  async getFilteredList(
    pagination: TaxReceiptListPaginationRequest,
    filter?: TaxReceiptListFilter,
  ): Promise<{ taxReceipts: TaxReceiptListItem[]; totalCount: number }> {
    const dbFilter = filter
      ? {
          ...omit(filter, ['type']),
          type: filter?.type
            ? {
                equals:
                  filter.type.equals === 'annual'
                    ? PrismaTaxReceiptType.ANNUAL
                    : PrismaTaxReceiptType.INDIVIDUAL,
              }
            : undefined,
        }
      : undefined
    const [taxReceipts, totalCount] = await this.prisma.$transaction([
      this.prisma.taxReceipt.findMany({
        include: {
          donor: { select: { id: true, firstName: true, lastName: true, isDisabled: true } },
          file: { select: { id: true, name: true } },
        },
        omit: { donorId: true, fileId: true },
        where: dbFilter,
        orderBy: isEmpty(pagination.orderBy) ? { updatedAt: 'desc' } : pagination.orderBy,
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
      }),
      this.prisma.taxReceipt.count({ where: dbFilter }),
    ])
    return {
      taxReceipts: taxReceipts.map((taxReceipt) => this.convertTaxReceiptToModel(taxReceipt)),
      totalCount,
    }
  }

  convertTaxReceiptToModel(
    taxReceipt: Omit<PrismaTaxReceipt, 'donorId' | 'fileId'> & {
      donor: {
        id: string
        firstName: string | null
        lastName: string
        isDisabled: boolean
      }
      file: { id: string; name: string }
    },
  ): TaxReceiptListItem {
    const type = taxReceipt.type === PrismaTaxReceiptType.ANNUAL ? 'annual' : 'individual'
    return nullsToUndefined({ ...taxReceipt, type })
  }
}
