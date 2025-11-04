import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { mockDeep, mockReset } from 'jest-mock-extended'
import { v4 } from 'uuid'

import { OrganisationService } from '../services/organisation.service'
import { PrismaService } from '@/infrastructure'

import { Organisation, OrganisationSummary } from '@shared/models'

describe('OrganisationService', () => {
  const prismaServiceMock = mockDeep<PrismaService>()
  let organisationService: OrganisationService

  beforeEach(async () => {
    jest.resetAllMocks()
    mockReset(prismaServiceMock)

    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        OrganisationService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile()

    organisationService = app.get<OrganisationService>(OrganisationService)
  })

  it('should get organisation list', async () => {
    const mockOrganisations = buildMockOrganisations()
    prismaServiceMock.organisation.findMany.mockResolvedValueOnce(
      // @ts-expect-error ignore null fields in test
      mockOrganisations,
    )

    const result = await organisationService.getAll()

    mockOrganisations.forEach((mockOrganisation, index) => {
      expect(result[index]).toMatchObject({
        name: mockOrganisation.name,
        title: mockOrganisation.title,
        address: mockOrganisation.address,
        locality: mockOrganisation.locality,
        postCode: mockOrganisation.postCode,
        logoUrl: mockOrganisation.logoUrl,
      })
    })
  })
})

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
