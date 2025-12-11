import { TaxReceiptCreateInput } from '../generated/prisma/models'
import { buildMockTaxReceiptPdfTemplateFile } from './file.mock'

export const buildMockTaxReceiptCreateInput = ({
  donorId,
  donations,
  type,
  createdAt,
}: {
  donorId: string
  donations: { id: string }[]
  type: 'ANNUAL' | 'INDIVIDUAL'
  createdAt: Date
}): TaxReceiptCreateInput => {
  return {
    createdAt,
    status: 'COMPLETED',
    canceledReason: null,
    canceledAt: null,
    type,
    file: { create: buildMockTaxReceiptPdfTemplateFile() },
    donor: { connect: { id: donorId } },
    donations: { connect: donations },
  }
}
