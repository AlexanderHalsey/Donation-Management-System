import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { mockDeep, mockReset } from 'jest-mock-extended'

import { DonationAssetTypeService } from '../services/donationAssetType.service'
import { PrismaService } from '@/infrastructure'

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
    prismaServiceMock.donationAssetType.findMany.mockResolvedValueOnce([])

    await donationAssetTypeService.getAll()

    expect(prismaServiceMock.donationAssetType.findMany).toHaveBeenCalledTimes(1)
  })
})
