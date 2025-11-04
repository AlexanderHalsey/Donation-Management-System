import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { mockDeep, mockReset } from 'jest-mock-extended'
import { v4 } from 'uuid'

import { DonationAssetTypeService } from '../services/donationAssetType.service'
import { PrismaService } from '@/infrastructure'

import { DonationAssetType } from '@shared/models'

describe('DonationAssetTypeService', () => {
  const prismaServiceMock = mockDeep<PrismaService>()
  let donationAssetTypeService: DonationAssetTypeService

  beforeEach(async () => {
    jest.resetAllMocks()
    mockReset(prismaServiceMock)

    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        DonationAssetTypeService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile()

    donationAssetTypeService = app.get<DonationAssetTypeService>(DonationAssetTypeService)
  })

  it('should get asset type list', async () => {
    const mockDonationAssetTypes = buildMockDonationAssetTypes()
    prismaServiceMock.donationAssetType.findMany.mockResolvedValueOnce(mockDonationAssetTypes)

    const result = await donationAssetTypeService.getAll()

    mockDonationAssetTypes.forEach((mockAssetType, index) => {
      expect(result[index]).toMatchObject({
        name: mockAssetType.name,
        isDefault: mockAssetType.isDefault,
      })
    })
  })
})

export function buildMockDonationAssetTypes(): DonationAssetType[] {
  return Array.from({ length: 4 }).map((_, index) => ({
    id: v4(),
    createdAt: new Date(2024, 0, index + 1),
    updatedAt: new Date(2024, 1, index + 1),
    name: `Donation Asset Type ${index + 1}`,
    isDefault: index === 0,
  }))
}
