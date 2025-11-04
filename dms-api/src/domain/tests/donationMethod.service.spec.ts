import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { mockDeep, mockReset } from 'jest-mock-extended'
import { v4 } from 'uuid'

import { DonationMethodService } from '../services/donationMethod.service'
import { PrismaService } from '@/infrastructure'

import { DonationMethod } from '@shared/models'

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

export function buildMockDonationMethods(): DonationMethod[] {
  return Array.from({ length: 4 }).map((_, index) => ({
    id: v4(),
    createdAt: new Date(2024, 0, index + 1),
    updatedAt: new Date(2024, 1, index + 1),
    name: `Donation Method ${index + 1}`,
    isDefault: index === 0,
  }))
}
