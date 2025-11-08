import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { mockDeep, mockReset } from 'jest-mock-extended'

import { DonationMethodService } from '../services/donationMethod.service'
import { PrismaService } from '@/infrastructure'

describe('DonationMethod', () => {
  const prismaServiceMock = mockDeep<PrismaService>()
  let donationMethodService: DonationMethodService

  beforeEach(async () => {
    jest.resetAllMocks()
    mockReset(prismaServiceMock)

    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        DonationMethodService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile()

    donationMethodService = app.get<DonationMethodService>(DonationMethodService)
  })

  it('should get method list', async () => {
    prismaServiceMock.donationMethod.findMany.mockResolvedValueOnce([])

    await donationMethodService.getAll()

    expect(prismaServiceMock.donationMethod.findMany).toHaveBeenCalledTimes(1)
  })
})
