import { FileMetadataCreateInput } from '@generated/prisma/models'

export const buildMockTaxReceiptPdfTemplateFile = (): FileMetadataCreateInput => ({
  storageKey: 'src/infrastructure/storage/tax-receipt-template.pdf',
  name: 'tax-receipt-template.pdf',
  size: 2048,
  mimeType: 'application/pdf',
  hash: '8546a2457cd8f83560c06ec9d5e56ac944bcd8c09395a5a1e49ef6af98b1e253',
  status: 'ACTIVE',
})
