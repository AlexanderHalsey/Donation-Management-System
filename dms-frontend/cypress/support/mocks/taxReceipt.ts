import { addDays } from 'date-fns'
import { v4 } from 'uuid'
import { sortBy } from 'es-toolkit'
import { get } from 'es-toolkit/compat'

import type {
  DonorRef,
  TaxReceiptListItem,
  TaxReceiptListFilter,
  TaxReceiptListSortOrder,
} from '@shared/models'

export type TaxReceiptListFilterMock = Omit<TaxReceiptListFilter, 'donorId'> & {
  donorId?: { in?: number[] }
}

export function buildMockTaxReceipts(
  donorRefs: DonorRef[],
  orderBy?: TaxReceiptListSortOrder,
  filter?: TaxReceiptListFilterMock,
): TaxReceiptListItem[] {
  const totalCount = 100 as const

  let taxReceipts: TaxReceiptListItem[] = Array.from({ length: totalCount }).map((_, index) => ({
    id: v4(),
    createdAt: addDays(new Date(2024, 0, 1), index),
    updatedAt: addDays(new Date(2024, 1, 1), index),
    donor: donorRefs[index % donorRefs.length],
    receiptNumber: index + 1000,
    isCanceled: index % 50 === 0,
    type: index % 2 === 0 ? 'annual' : 'individual',
    file: {
      id: v4(),
      name: `tax-receipt-${index + 1}.pdf`,
    },
  }))

  taxReceipts = taxReceipts.filter((taxReceipt) => {
    if (
      (filter?.donorId?.in !== undefined &&
        !filter.donorId.in.includes(donorRefs.indexOf(taxReceipt.donor))) ||
      (typeof filter?.createdAt?.gte === 'object' && taxReceipt.createdAt < filter.createdAt.gte) ||
      (typeof filter?.createdAt?.lte === 'object' && taxReceipt.createdAt > filter.createdAt.lte) ||
      (filter?.isCanceled?.equals !== undefined &&
        taxReceipt.isCanceled !== filter.isCanceled.equals) ||
      (filter?.type?.equals !== undefined && filter.type.equals !== taxReceipt.type)
    ) {
      return false
    }

    return true
  })

  if (!orderBy) return taxReceipts

  let order: 'asc' | 'desc' | { name: string } | { lastName: string } = Object.values(orderBy)[0]
  let key: keyof TaxReceiptListSortOrder = Object.keys(orderBy)[0] as keyof TaxReceiptListSortOrder
  if (typeof order === 'object') {
    if ('lastName' in order) {
      key = (key + '.lastName') as keyof TaxReceiptListSortOrder
      order = order.lastName as 'asc' | 'desc'
    } else {
      key = (key + '.name') as keyof TaxReceiptListSortOrder
      order = order.name as 'asc' | 'desc'
    }
  }
  taxReceipts = sortBy(taxReceipts, [(item) => get(item, key)])
  if (order === 'desc') taxReceipts.reverse()

  return taxReceipts
}
