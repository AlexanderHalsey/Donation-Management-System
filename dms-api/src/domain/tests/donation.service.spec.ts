import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { mockDeep, mockReset } from 'jest-mock-extended'

import { DonationService } from '../services/donation.service'
import { PrismaService } from '@/infrastructure'

import { buildMockDonations } from '@shared/mocks'

import type { Donation } from '@shared/models'
import type { DonationOrderByWithRelationInput } from '@generated/prisma/models'

describe('DonationService', () => {
  const prismaServiceMock = mockDeep<PrismaService>()
  let donationService: DonationService

  beforeEach(async () => {
    jest.resetAllMocks()
    mockReset(prismaServiceMock)

    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        DonationService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile()

    donationService = app.get<DonationService>(DonationService)
  })

  describe('donation list', () => {
    const donations: Donation[] = buildMockDonations()

    it.each([
      [1, 10],
      [3, 10],
      [3, 15],
    ] satisfies [page: number, pageSize: number][])(
      'should return a list of paginated donations for page %i and pageSize %i',
      async (page, pageSize) => {
        prismaServiceMock.donation.findMany.mockResolvedValueOnce(
          // @ts-expect-error findMany args changes type
          donations.slice((page - 1) * pageSize, page * pageSize),
        )

        const result = await donationService.getFilteredList({
          page,
          pageSize,
          orderBy: { createdAt: 'desc' },
        })

        expect(result).toMatchObject(
          donations.slice((page - 1) * pageSize, page * pageSize).map(getDonationSubsetObject),
        )
      },
    )

    it.each([
      [{ amount: 'asc' }, (a, b) => a.amount - b.amount],
      [
        { organisation: { name: 'desc' } },
        (a, b) => b.organisation.name.localeCompare(a.organisation.name),
      ],
      [
        { donationType: { name: 'asc' } },
        (a, b) => a.donationType.name.localeCompare(b.donationType.name),
      ],
    ] as const satisfies [
      DonationOrderByWithRelationInput,
      (a: Donation, b: Donation) => number,
    ][])('should order the list of donations, test %#', async (orderBy, compareFn) => {
      const page = 1
      const pageSize = 20

      prismaServiceMock.donation.findMany.mockResolvedValueOnce(
        // @ts-expect-error findMany args changes type
        donations.sort(compareFn).slice((page - 1) * pageSize, page * pageSize),
      )

      const result = await donationService.getFilteredList({
        page,
        pageSize,
        orderBy,
      })

      expect(result).toMatchObject(
        donations
          .sort(compareFn)
          .slice(page - 1, pageSize)
          .map(getDonationSubsetObject),
      )
    })
  })
})

function getDonationSubsetObject(donation: Donation) {
  return {
    createdAt: donation.createdAt,
    donatedAt: donation.donatedAt,
    amount: donation.amount,
    organisation: {
      name: donation.organisation.name,
    },
    donationType: {
      name: donation.donationType.name,
    },
    donationMethod: {
      name: donation.donationMethod.name,
    },
    donationAssetType: {
      name: donation.donationAssetType.name,
    },
    isDisabled: donation.isDisabled,
  }
}
