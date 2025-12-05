import { FileMetadataCreateManyInput } from '@generated/prisma/models'

export const buildMockOrganisationFiles = (): FileMetadataCreateManyInput[] => [
  {
    storageKey: 'src/infrastructure/storage/logo.png',
    name: 'logo.png',
    size: 1024,
    mimeType: 'image/png',
    hash: '581e5200cf8cd32368b87a85885c8868fa0ed5f10bca20eb55dbb6117e2f7526',
    status: 'ACTIVE',
  },
  {
    storageKey: 'src/infrastructure/storage/signature.webp',
    name: 'signature.webp',
    size: 1024,
    mimeType: 'image/webp',
    hash: '26a5e1d7ef984196e90a11986c6385715fa1d6ee523f79ab9eb8112b85c52ce4',
    status: 'ACTIVE',
  },
]

export const buildMockTaxReceiptPdfTemplateFile = (): FileMetadataCreateManyInput => ({
  storageKey: 'src/infrastructure/storage/tax-receipt-template.pdf',
  name: 'tax-receipt-template.pdf',
  size: 2048,
  mimeType: 'application/pdf',
  hash: '5249b6afe8c88544d338e612527515a9fdabbf677b0ec8b9a4e09e84d453d7fe',
  status: 'ACTIVE',
})
