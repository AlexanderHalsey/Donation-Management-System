import { v4 } from 'uuid'

import { buildMockFile } from './file'

import type { Organisation } from '@shared/models'

export type OrganisationFormDataMock = {
  name: string
  title?: string
  address?: string
  locality?: string
  postCode?: string
  logoId?: string
  object?: string
  objectDescription?: string
  signatoryName?: string
  signatoryPosition?: string
  signatureId?: string
}

export function buildMockOrganisations(): Organisation[] {
  return Array.from({ length: 2 }).map((_, index) => ({
    id: v4(),
    createdAt: new Date(2024, 0, index + 1),
    updatedAt: new Date(2024, 1, index + 1),
    name: `Organisation ${index + 1}`,
    title: `Title ${index + 1}`,
    address: `Address ${index + 1}`,
    locality: `Locality ${index + 1}`,
    postCode: `PostCode ${index + 1}`,
    logo: index === 0 ? buildMockFile({ name: 'logo.png' }) : undefined,
    object: `Object ${index + 1}`,
    objectDescription: `Object Description ${index + 1}`,
    signatoryName: `Signatory Name ${index + 1}`,
    signatoryPosition: `Signatory Position ${index + 1}`,
    signature: index === 0 ? buildMockFile({ name: 'signature.webp' }) : undefined,
    isDisabled: false,
  }))
}
