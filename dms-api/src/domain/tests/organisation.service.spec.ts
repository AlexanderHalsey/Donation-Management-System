import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { mockDeep, mockReset } from 'jest-mock-extended'

import { OrganisationService } from '../services/organisation.service'
import { PrismaService } from '@/infrastructure'

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
    prismaServiceMock.organisation.findMany.mockResolvedValueOnce([])

    await organisationService.getAll()

    expect(prismaServiceMock.organisation.findMany).toHaveBeenCalledTimes(1)
  })
})
