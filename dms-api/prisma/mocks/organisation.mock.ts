import {
  FileMetadataCreateManyInput,
  OrganisationCreateManyInput,
} from '../generated/prisma/models'

const ORGANISATION_NAMES = ['Helping Hands', 'Global Aid', 'Community Care'] as const

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

export const buildMockOrganisationCreateManyInput = (
  index: number,
  logoId?: string,
  signatureId?: string,
): OrganisationCreateManyInput => ({
  name: ORGANISATION_NAMES[index],
  title: `Organisation Title ${index}`,
  address: `1234 Mock St, Mock City, MC 12345`,
  locality: `Mock City`,
  postCode: `MC12345`,
  logoId,
  object: `Organisation ${index} Object`,
  objectDescription: `Description for Organisation ${index}`,
  signatoryName: `Signatory ${index}`,
  signatoryPosition: `Signatory Title ${index}`,
  signatureId,
})
