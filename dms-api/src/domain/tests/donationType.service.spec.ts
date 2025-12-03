import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { mockDeep, mockReset } from 'jest-mock-extended'

import { DonationTypeService } from '../services/donationType.service'
import { PrismaService } from '@/infrastructure'

import type { DonationType } from '@shared/models'

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

  it('should get donation type by ID', async () => {
    const id = 'donation-type-id-123'
    const mockDonationType = mockDeep<DonationType>()
    prismaServiceMock.donationType.findUniqueOrThrow.mockResolvedValueOnce(mockDonationType)

    await donationTypeService.getById(id)

    expect(prismaServiceMock.donationType.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id },
    })
  })

  it('should create donation type', async () => {
    const request = {
      name: 'New Donation Type',
      organisationId: 'organisation-id-123',
    }
    const createdDonationType = mockDeep<DonationType>({ id: 'new-donation-type-id-123' })
    prismaServiceMock.donationType.create.mockResolvedValueOnce(createdDonationType)

    await donationTypeService.create(request)

    expect(prismaServiceMock.donationType.create).toHaveBeenCalledWith({ data: request })
  })

  it('should update donation type', async () => {
    const id = 'donation-type-id-123'
    const request = {
      name: 'Updated Donation Type',
      organisationId: 'organisation-id-456',
    }
    prismaServiceMock.donationType.update.mockResolvedValueOnce(mockDeep<DonationType>())

    await donationTypeService.update(id, request)

    expect(prismaServiceMock.donationType.update).toHaveBeenCalledWith({
      where: { id },
      data: request,
    })
  })

  it('should disable donation type', async () => {
    const id = 'donation-type-id-123'
    prismaServiceMock.donationType.update.mockResolvedValueOnce(mockDeep<DonationType>())

    await donationTypeService.disable(id)

    expect(prismaServiceMock.donationType.update).toHaveBeenCalledWith({
      where: { id },
      data: { isDisabled: true },
    })
  })

  it('should delete non-attached disabled donation types', async () => {
    prismaServiceMock.donationType.deleteMany.mockResolvedValueOnce({ count: 2 })

    await donationTypeService.cleanupNonAttachedDisabled()

    expect(prismaServiceMock.donationType.deleteMany).toHaveBeenCalledWith({
      where: {
        isDisabled: true,
        donations: { none: {} },
      },
    })
  })
})
