import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { mockDeep, mockReset } from 'jest-mock-extended'

import { DonationAssetTypeService } from '../services/donationAssetType.service'
import { PrismaService } from '@/infrastructure'

import type { DonationAssetType } from '@generated/prisma/client'

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

  it('should get asset type by ID', async () => {
    const id = 'asset-type-id-123'
    prismaServiceMock.donationAssetType.findUniqueOrThrow.mockResolvedValueOnce(
      mockDeep<DonationAssetType>(),
    )
    await donationAssetTypeService.getById(id)

    expect(prismaServiceMock.donationAssetType.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id },
    })
  })

  describe('should create asset type', () => {
    it('should create asset type and unset previous default', async () => {
      const request = {
        name: 'New Default Asset Type',
        isDefault: true,
      }
      const createdAssetType = mockDeep<DonationAssetType>({ id: 'new-asset-type-id-123' })
      prismaServiceMock.$transaction.mockImplementationOnce(async (cb) => {
        return cb(prismaServiceMock)
      })
      prismaServiceMock.donationAssetType.create.mockResolvedValueOnce(createdAssetType)

      await donationAssetTypeService.create(request)

      expect(prismaServiceMock.donationAssetType.create).toHaveBeenCalledWith({ data: request })
      expect(prismaServiceMock.donationAssetType.updateMany).toHaveBeenCalledWith({
        where: { id: { not: createdAssetType.id } },
        data: { isDefault: false },
      })
    })

    it('should create asset type without unsetting previous default', async () => {
      const request = {
        name: 'New Non-Default Asset Type',
        isDefault: false,
      }
      prismaServiceMock.$transaction.mockImplementationOnce(async (cb) => {
        return cb(prismaServiceMock)
      })
      prismaServiceMock.donationAssetType.create.mockResolvedValueOnce(
        mockDeep<DonationAssetType>(),
      )

      await donationAssetTypeService.create(request)

      expect(prismaServiceMock.donationAssetType.create).toHaveBeenCalledWith({ data: request })
      expect(prismaServiceMock.donationAssetType.updateMany).not.toHaveBeenCalled()
    })
  })

  describe('should update asset type', () => {
    it('should update asset type and unset previous default', async () => {
      const id = 'asset-type-id-123'
      const request = {
        name: 'Updated Asset Type',
        isDefault: true,
      }
      prismaServiceMock.$transaction.mockImplementationOnce(async (cb) => {
        return cb(prismaServiceMock)
      })
      prismaServiceMock.donationAssetType.update.mockResolvedValueOnce(
        mockDeep<DonationAssetType>(),
      )

      await donationAssetTypeService.update(id, request)

      expect(prismaServiceMock.donationAssetType.update).toHaveBeenCalledWith({
        where: { id },
        data: request,
      })
      expect(prismaServiceMock.donationAssetType.updateMany).toHaveBeenCalledWith({
        where: { id: { not: id } },
        data: { isDefault: false },
      })
    })

    it('should update asset type without unsetting previous default', async () => {
      const id = 'asset-type-id-123'
      const request = {
        name: 'Updated Asset Type',
        isDefault: false,
      }
      prismaServiceMock.$transaction.mockImplementationOnce(async (cb) => {
        return cb(prismaServiceMock)
      })
      prismaServiceMock.donationAssetType.update.mockResolvedValueOnce(
        mockDeep<DonationAssetType>(),
      )

      await donationAssetTypeService.update(id, request)

      expect(prismaServiceMock.donationAssetType.update).toHaveBeenCalledWith({
        where: { id },
        data: request,
      })
      expect(prismaServiceMock.donationAssetType.updateMany).not.toHaveBeenCalled()
    })
  })

  it('should disable asset type', async () => {
    const id = 'asset-type-id-123'
    prismaServiceMock.donationAssetType.update.mockResolvedValueOnce(mockDeep<DonationAssetType>())

    await donationAssetTypeService.disable(id)

    expect(prismaServiceMock.donationAssetType.update).toHaveBeenCalledWith({
      where: { id },
      data: { isDisabled: true },
    })
  })
})
