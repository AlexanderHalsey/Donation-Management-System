import { FileMetadataCreateInput } from '@generated/prisma/models'

export const buildMockTaxReceiptPdfTemplateFile = (): FileMetadataCreateInput => ({
  storageKey: 'src/infrastructure/storage/tax-receipt-template.pdf',
  name: 'tax-receipt-template.pdf',
  size: 2048,
  mimeType: 'application/pdf',
  hash: '5249b6afe8c88544d338e612527515a9fdabbf677b0ec8b9a4e09e84d453d7fe',
  status: 'ACTIVE',
})
