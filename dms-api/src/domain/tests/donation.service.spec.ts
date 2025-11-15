import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { mockDeep, mockReset } from 'jest-mock-extended'

import { DonationService } from '../services/donation.service'
import { PrismaService } from '@/infrastructure'

describe('DonationService', () => {
  const prismaServiceMock = mockDeep<PrismaService>()
  let donationService: DonationService

  beforeEach(async () => {
    jest.resetAllMocks()
    mockReset(prismaServiceMock)

    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        DonationService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile()

    donationService = app.get<DonationService>(DonationService)
  })

  it('should get donation list', async () => {
    prismaServiceMock.$transaction.mockResolvedValueOnce([[], 0])

    await donationService.getFilteredList(
      { page: 1, pageSize: 10, orderBy: { updatedAt: 'desc' } },
      { amount: { gte: 10 } },
    )

    expect(prismaServiceMock.$transaction).toHaveBeenCalledTimes(1)
  })

  it('should get donation by id', async () => {
    const donationId = 'donation-id-123'
    prismaServiceMock.donation.findUniqueOrThrow.mockResolvedValueOnce({
      id: donationId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    await donationService.getById(donationId)

    expect(prismaServiceMock.donation.findUniqueOrThrow).toHaveBeenCalledTimes(1)
  })
})
