import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { mockDeep, mockReset } from 'jest-mock-extended'
import { v4 } from 'uuid'
import { buildMockOrganisations } from './organisation.service.spec'

import { DonationTypeService } from '../services/donationType.service'
import { PrismaService } from '@/infrastructure'

import { DonationType, Organisation } from '@shared/models'

describe('DonationTypeService', () => {
  const prismaServiceMock = mockDeep<PrismaService>()
  let donationTypeService: DonationTypeService

  beforeEach(async () => {
    jest.resetAllMocks()
    mockReset(prismaServiceMock)

    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        DonationTypeService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile()

    donationTypeService = app.get<DonationTypeService>(DonationTypeService)
  })

  it('should get donation type list', async () => {
    const mockDonationTypes = buildMockDonationTypes(buildMockOrganisations())
    prismaServiceMock.donationType.findMany.mockResolvedValueOnce(mockDonationTypes)

    const result = await donationTypeService.getAll()

    mockDonationTypes.forEach((mockDonationType, index) => {
      expect(result[index]).toMatchObject({
        name: mockDonationType.name,
        organisationId: mockDonationType.organisationId,
      })
    })
  })
})

export function buildMockDonationTypes(organisations: Organisation[]): DonationType[] {
  return Array.from({ length: 10 }).map((_, index) => ({
    id: v4(),
    createdAt: new Date(2024, 0, index + 1),
    updatedAt: new Date(2024, 1, index + 1),
    name: `Donation Type ${index + 1}`,
    organisationId: organisations[index % organisations.length].id,
  }))
}
