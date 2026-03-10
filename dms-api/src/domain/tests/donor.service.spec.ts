import { ConfigModule } from '@nestjs/config'
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager'
import { Test, TestingModule } from '@nestjs/testing'

import { mockDeep, mockReset } from 'jest-mock-extended'

import { DonorService } from '../services/donor.service'
import { GetDonorListItemResult, PrismaService, TypedSqlService } from '@/infrastructure'
import { TypedSql } from '@prisma/client/runtime/client'
import { Donor } from '@generated/prisma/client'
import { DonorSyncProfile } from '../types'

describe('DonorService', () => {
  const prismaServiceMock = mockDeep<PrismaService>()
  const typedSqlServiceMock = mockDeep<TypedSqlService>()
  const cacheManagerMock = mockDeep<Cache>()
  let donorService: DonorService

  beforeEach(async () => {
    jest.resetAllMocks()
    mockReset(prismaServiceMock)
    mockReset(typedSqlServiceMock)
    mockReset(cacheManagerMock)

    prismaServiceMock.$transaction.mockImplementation(async (cb) => {
      return await cb(prismaServiceMock)
    })

    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        DonorService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
        {
          provide: TypedSqlService,
          useValue: typedSqlServiceMock,
        },
        {
          provide: CACHE_MANAGER,
          useValue: cacheManagerMock,
        },
      ],
    }).compile()

    app.useLogger(false)

    donorService = app.get<DonorService>(DonorService)
  })

  it('should get donor list', async () => {
    prismaServiceMock.$queryRawTyped.mockResolvedValueOnce([])
    typedSqlServiceMock.getDonorListItem.mockResolvedValueOnce(
      mockDeep<TypedSql<unknown[], GetDonorListItemResult>>(),
    )
    await donorService.getFilteredList(
      { page: 1, pageSize: 10, orderBy: { updatedAt: 'desc' } },
      { totalAmount: { gte: 10 } },
    )

    expect(prismaServiceMock.$queryRawTyped).toHaveBeenCalledTimes(1)
    expect(typedSqlServiceMock.getDonorListItem).toHaveBeenCalledWith(
      null,
      null,
      null,
      null,
      10,
      null,
      'updatedAt',
      'desc',
      10,
      0,
    )
  })

  it('should get donor ref items', async () => {
    prismaServiceMock.donor.findMany.mockResolvedValueOnce([])

    await donorService.getAllRefs()

    expect(prismaServiceMock.donor.findMany).toHaveBeenCalledTimes(1)
  })

  it('should get donor by id', async () => {
    prismaServiceMock.donor.findUniqueOrThrow.mockResolvedValueOnce(
      mockDeep<Donor & { donations: unknown[] }>({
        id: 'donor-id-123',
        donations: [],
      }),
    )

    await donorService.getById('donor-id-123')

    expect(prismaServiceMock.donor.findUniqueOrThrow).toHaveBeenCalledTimes(1)
  })

  it('should get donor export list', async () => {
    prismaServiceMock.$queryRawTyped.mockResolvedValueOnce([])
    typedSqlServiceMock.getDonorListItem.mockResolvedValueOnce(
      mockDeep<TypedSql<unknown[], GetDonorListItemResult>>(),
    )

    await donorService.getExportList({ updatedAt: 'desc' }, { totalAmount: { gte: 10 } })

    expect(prismaServiceMock.$queryRawTyped).toHaveBeenCalledTimes(1)
  })

  it('should synchronize donors', async () => {
    const mockDonors = [
      mockDeep<DonorSyncProfile>({
        externalId: 123,
        civility: 'Mr',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        isDisabled: false,
      }),
      mockDeep<DonorSyncProfile>({
        externalId: 456,
        civility: 'Ms',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        isDisabled: false,
      }),
    ]
    const mockForeignTablesToUpdate = [
      {
        oldDonorExternalId: 123,
        newDonorExternalId: 456,
      },
    ]

    prismaServiceMock.donor.upsert.mockResolvedValue(mockDeep())
    prismaServiceMock.donor.findUniqueOrThrow.mockResolvedValue(
      mockDeep<Donor>({ id: 'donor-id-456' }),
    )

    await donorService.synchronizeDonors({
      toUpsert: mockDonors,
      foreignTablesToUpdate: mockForeignTablesToUpdate,
    })

    expect(prismaServiceMock.$transaction).toHaveBeenCalledTimes(1)
    expect(prismaServiceMock.donor.upsert).toHaveBeenCalledTimes(2)
    expect(prismaServiceMock.donor.upsert).toHaveBeenNthCalledWith(1, {
      where: { externalId: 123 },
      create: mockDonors[0],
      update: mockDonors[0],
    })
    expect(prismaServiceMock.donor.upsert).toHaveBeenNthCalledWith(2, {
      where: { externalId: 456 },
      create: mockDonors[1],
      update: mockDonors[1],
    })
    expect(prismaServiceMock.donation.updateMany).toHaveBeenCalledWith({
      where: { donor: { externalId: 123 } },
      data: { donorId: 'donor-id-456' },
    })
    expect(prismaServiceMock.taxReceipt.updateMany).toHaveBeenCalledWith({
      where: { donor: { externalId: 123 } },
      data: { donorId: 'donor-id-456' },
    })
  })

  it('should cleanup non-attached disabled donors', async () => {
    prismaServiceMock.donor.deleteMany.mockResolvedValue({ count: 5 })

    await donorService.cleanupNonAttachedDisabled()

    expect(prismaServiceMock.donor.deleteMany).toHaveBeenCalledWith({
      where: {
        isDisabled: true,
        donations: { none: {} },
      },
    })
  })
})
