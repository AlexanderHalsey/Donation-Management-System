import { OrganisationCreateInput } from '../generated/prisma/models'

const ORGANISATION_NAMES = ['Helping Hands', 'Global Aid', 'Community Care'] as const

export const buildMockOrganisationCreateInput = (index: number): OrganisationCreateInput => ({
  name: ORGANISATION_NAMES[index],
  title: `Organisation Title ${index}`,
  address: `1234 Mock St, Mock City, MC 12345`,
  locality: `Mock City`,
  postCode: `MC12345`,
  object: `Organisation ${index} Object`,
  objectDescription: `Description for Organisation ${index}`,
  signatoryName: `Signatory ${index}`,
  signatoryPosition: `Signatory Title ${index}`,
  isTaxReceiptEnabled: index === 0,
  logo: {
    create: {
      storageKey: 'src/infrastructure/storage/logo.png',
      name: 'logo.png',
      size: 1024,
      mimeType: 'image/png',
      hash: '5d42952de76176ca67f5e9d1414719a011adb32630a6a5c1773aaf82cdff0b66',
      status: 'ACTIVE',
    },
  },
  signature: {
    create: {
      storageKey: 'src/infrastructure/storage/signature.jpg',
      name: 'signature.jpg',
      size: 1024,
      mimeType: 'image/jpeg',
      hash: '22402f4966b85718b1bc6912214ebb704d242f6c17e646cfa6332da23d5599b1',
      status: 'ACTIVE',
    },
  },
})
