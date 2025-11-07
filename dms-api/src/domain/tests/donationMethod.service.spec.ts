import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { mockDeep, mockReset } from 'jest-mock-extended'

import { DonationMethodService } from '../services/donationMethod.service'
import { PrismaService } from '@/infrastructure'

import { buildMockDonationMethods } from '@shared/mocks'

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
    const mockDonationMethods = buildMockDonationMethods()
    prismaServiceMock.donationMethod.findMany.mockResolvedValueOnce(mockDonationMethods)

    const result = await donationMethodService.getAll()

    mockDonationMethods.forEach((mockDonationMethod, index) => {
      expect(result[index]).toMatchObject({
        name: mockDonationMethod.name,
        isDefault: mockDonationMethod.isDefault,
      })
    })
  })
})
