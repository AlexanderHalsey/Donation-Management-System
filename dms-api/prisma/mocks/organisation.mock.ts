import { OrganisationCreateManyInput } from '../generated/prisma/models'

const ORGANISATION_NAMES = ['Helping Hands', 'Global Aid', 'Community Care'] as const

export const buildMockOrganisationCreateManyInput = (
  index: number,
): OrganisationCreateManyInput => ({
  name: ORGANISATION_NAMES[index],
  title: `Organisation Title ${index}`,
  address: `1234 Mock St, Mock City, MC 12345`,
  locality: `Mock City`,
  postCode: `MC12345`,
  logoUrl: `https://example.com/logo${index}.png`,
  object: `Organisation ${index} Object`,
  objectDescription: `Description for Organisation ${index}`,
  signatoryName: `Signatory ${index}`,
  signatoryPosition: `Signatory Title ${index}`,
  signatureUrl: `https://example.com/signature${index}.png`,
})
