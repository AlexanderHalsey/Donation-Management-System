import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { mockDeep, mockReset } from 'jest-mock-extended'

import { DonorService } from '../services/donor.service'
import { PrismaService } from '@/infrastructure'

describe('DonorService', () => {
  const prismaServiceMock = mockDeep<PrismaService>()
  let donorService: DonorService

  beforeEach(async () => {
    jest.resetAllMocks()
    mockReset(prismaServiceMock)

    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        DonorService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile()

    donorService = app.get<DonorService>(DonorService)
  })

  it('should get donor list', async () => {
    prismaServiceMock.$queryRawTyped.mockResolvedValueOnce([])
    await donorService.getFilteredList(
      { page: 1, pageSize: 10, orderBy: { updatedAt: 'desc' } },
      { amount: { gte: 10 } },
    )

    expect(prismaServiceMock.$queryRawTyped).toHaveBeenCalledTimes(1)
  })

  it('should get donor ref items', async () => {
    prismaServiceMock.donor.findMany.mockResolvedValueOnce([])

    await donorService.getAllRefs()

    expect(prismaServiceMock.donor.findMany).toHaveBeenCalledTimes(1)
  })

  it('should get donor by id', async () => {
    prismaServiceMock.donor.findUniqueOrThrow.mockResolvedValueOnce({
      id: 'donor-id-123',
      donations: [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    await donorService.getById('donor-id-123')

    expect(prismaServiceMock.donor.findUniqueOrThrow).toHaveBeenCalledTimes(1)
  })
})
