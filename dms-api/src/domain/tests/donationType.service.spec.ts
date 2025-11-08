import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { mockDeep, mockReset } from 'jest-mock-extended'

import { DonationTypeService } from '../services/donationType.service'
import { PrismaService } from '@/infrastructure'

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
    prismaServiceMock.donationType.findMany.mockResolvedValueOnce([])

    await donationTypeService.getAll()

    expect(prismaServiceMock.donationType.findMany).toHaveBeenCalledTimes(1)
  })
})
