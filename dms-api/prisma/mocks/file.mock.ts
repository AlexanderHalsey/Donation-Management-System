import { FileMetadataCreateInput } from '@generated/prisma/models'

export const buildMockTaxReceiptPdfTemplateFile = (): FileMetadataCreateInput => ({
  storageKey: 'tax-receipt-template.pdf',
  name: 'tax-receipt-template.pdf',
  size: 2048,
  mimeType: 'application/pdf',
  hash: 'dc56f275b89acef89a21d30fa54e1976e12eef7632c53d5bb29e9db4dfde26f3',
  status: 'ACTIVE',
})
