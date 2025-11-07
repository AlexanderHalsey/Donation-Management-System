import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { mockDeep, mockReset } from 'jest-mock-extended'

import { DonationAssetTypeService } from '../services/donationAssetType.service'
import { PrismaService } from '@/infrastructure'

import { buildMockDonationAssetTypes } from '@shared/mocks'

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
