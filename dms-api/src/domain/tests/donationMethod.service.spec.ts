import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { mockDeep, mockReset } from 'jest-mock-extended'

import { DonationMethodService } from '../services/donationMethod.service'
import { PrismaService } from '@/infrastructure'

import type { DonationMethod } from '@shared/models'

describe('DonationMethodService', () => {
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

  it('should get method by ID', async () => {
    const id = 'method-id-123'
    const mockMethod = mockDeep<DonationMethod>()
    prismaServiceMock.donationMethod.findUniqueOrThrow.mockResolvedValueOnce(mockMethod)

    await donationMethodService.getById(id)

    expect(prismaServiceMock.donationMethod.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id },
    })
  })

  describe('should create method', () => {
    it('should create method and unset previous default', async () => {
      const request = {
        name: 'New Default Method',
        isDefault: true,
      }
      const createdMethod = mockDeep<DonationMethod>({ id: 'new-method-id-123' })
      prismaServiceMock.$transaction.mockImplementationOnce(async (cb) => {
        return cb(prismaServiceMock)
      })
      prismaServiceMock.donationMethod.create.mockResolvedValueOnce(createdMethod)

      await donationMethodService.create(request)

      expect(prismaServiceMock.donationMethod.create).toHaveBeenCalledWith({ data: request })
      expect(prismaServiceMock.donationMethod.updateMany).toHaveBeenCalledWith({
        where: { id: { not: createdMethod.id } },
        data: { isDefault: false },
      })
    })

    it('should create method without unsetting previous default', async () => {
      const request = {
        name: 'New Non-Default Method',
        isDefault: false,
      }
      prismaServiceMock.$transaction.mockImplementationOnce(async (cb) => {
        return cb(prismaServiceMock)
      })
      prismaServiceMock.donationMethod.create.mockResolvedValueOnce(mockDeep<DonationMethod>())

      await donationMethodService.create(request)

      expect(prismaServiceMock.donationMethod.create).toHaveBeenCalledWith({ data: request })
      expect(prismaServiceMock.donationMethod.updateMany).not.toHaveBeenCalled()
    })
  })

  describe('should update method', () => {
    it('should update method and unset previous default', async () => {
      const id = 'method-id-123'
      const request = {
        name: 'Updated Method',
        isDefault: true,
      }
      prismaServiceMock.$transaction.mockImplementationOnce(async (cb) => {
        return cb(prismaServiceMock)
      })
      prismaServiceMock.donationMethod.update.mockResolvedValueOnce(mockDeep<DonationMethod>())

      await donationMethodService.update(id, request)

      expect(prismaServiceMock.donationMethod.update).toHaveBeenCalledWith({
        where: { id },
        data: request,
      })
      expect(prismaServiceMock.donationMethod.updateMany).toHaveBeenCalledWith({
        where: { id: { not: id } },
        data: { isDefault: false },
      })
    })

    it('should update method without unsetting previous default', async () => {
      const id = 'method-id-123'
      const request = {
        name: 'Updated Method',
        isDefault: false,
      }
      prismaServiceMock.$transaction.mockImplementationOnce(async (cb) => {
        return cb(prismaServiceMock)
      })
      prismaServiceMock.donationMethod.update.mockResolvedValueOnce(mockDeep<DonationMethod>())

      await donationMethodService.update(id, request)

      expect(prismaServiceMock.donationMethod.update).toHaveBeenCalledWith({
        where: { id },
        data: request,
      })
      expect(prismaServiceMock.donationMethod.updateMany).not.toHaveBeenCalled()
    })
  })

  it('should disable method', async () => {
    const id = 'method-id-123'
    prismaServiceMock.donationMethod.update.mockResolvedValueOnce(mockDeep<DonationMethod>())

    await donationMethodService.disable(id)

    expect(prismaServiceMock.donationMethod.update).toHaveBeenCalledWith({
      where: { id },
      data: { isDisabled: true },
    })
  })
})
