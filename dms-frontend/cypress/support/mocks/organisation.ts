import { v4 } from 'uuid'

import type { Organisation, OrganisationSummary } from '@shared/models'

export function buildMockOrganisations(): Organisation[] {
  const summaries = buildMockOrganisationSummaries()
  return Array.from({ length: 2 }).map((_, index) => ({
    ...summaries[index],
    title: `Title ${index + 1}`,
    address: `Address ${index + 1}`,
    locality: `Locality ${index + 1}`,
    postCode: `PostCode ${index + 1}`,
    logoUrl: `http://example.com/logo${index + 1}.png`,
    object: `Object ${index + 1}`,
    objectDescription: `Object Description ${index + 1}`,
    signatoryName: `Signatory Name ${index + 1}`,
    signatoryPosition: `Signatory Position ${index + 1}`,
    signatureUrl: `http://example.com/signature${index + 1}.png`,
  }))
}

export function buildMockOrganisationSummaries(): OrganisationSummary[] {
  return Array.from({ length: 2 }).map((_, index) => ({
    id: v4(),
    createdAt: new Date(2024, 0, index + 1),
    updatedAt: new Date(2024, 1, index + 1),
    name: `Organisation ${index + 1}`,
  }))
}
