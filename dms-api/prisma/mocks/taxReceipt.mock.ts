import { TaxReceiptCreateManyInput } from '../generated/prisma/models'

export const buildMockTaxReceiptCreateManyInput = ({
  index,
  fileId,
  donorId,
  type,
  createdAt,
}: {
  index: number
  fileId: string
  donorId: string
  type: 'ANNUAL' | 'INDIVIDUAL'
  createdAt: Date
}): TaxReceiptCreateManyInput => {
  return {
    fileId,
    donorId,
    createdAt,
    receiptNumber: 1000 + index,
    isCanceled: false,
    canceledReason: null,
    canceledAt: null,
    type,
  }
}
