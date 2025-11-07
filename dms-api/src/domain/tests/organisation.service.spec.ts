import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { mockDeep, mockReset } from 'jest-mock-extended'

import { OrganisationService } from '../services/organisation.service'
import { PrismaService } from '@/infrastructure'

import { buildMockOrganisations } from '@shared/mocks'

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
