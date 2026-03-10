import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { mockDeep, mockReset } from 'jest-mock-extended'

import { DonationService } from '../services/donation.service'
import { PrismaService } from '@/infrastructure'

import { Donation, DonationType, Donor, Organisation, Prisma } from '@generated/prisma/client'

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

    app.useLogger(false)

    donationService = app.get<DonationService>(DonationService)
  })

  it('should get donation list', async () => {
    prismaServiceMock.$transaction.mockResolvedValueOnce([[], 0])

    await donationService.getFilteredList(
      { page: 1, pageSize: 10, orderBy: { updatedAt: 'desc' } },
      { amount: { gte: 10 } },
    )

    expect(prismaServiceMock.$transaction).toHaveBeenCalledTimes(1)
  })

  it('should get donation by id', async () => {
    const donationId = 'donation-id-123'
    prismaServiceMock.donation.findUniqueOrThrow.mockResolvedValueOnce(
      mockDeep<
        Prisma.DonationGetPayload<{
          include: {
            organisation: { select: { isTaxReceiptEnabled: true } }
            donationType: { select: { isTaxReceiptEnabled: true } }
          }
        }>
      >({
        id: donationId,
        organisation: { isTaxReceiptEnabled: false },
        donationType: { isTaxReceiptEnabled: false },
      }),
    )

    await donationService.getById(donationId)

    expect(prismaServiceMock.donation.findUniqueOrThrow).toHaveBeenCalledTimes(1)
  })

  describe('getEligibleTaxReceiptYearOrganisations', () => {
    it('should return unique year-organisation pairs for eligible donations', async () => {
      prismaServiceMock.donation.findMany.mockResolvedValueOnce(
        mockDeep<(Donation & { organisation: Organisation })[]>([
          {
            donatedAt: new Date('2024-01-01T00:00:00.000Z'),
            organisation: { id: 'org-1', name: 'Org 1' },
          },
          {
            donatedAt: new Date('2023-01-01T00:00:00.000Z'),
            organisation: { id: 'org-2', name: 'Org 2' },
          },
          {
            donatedAt: new Date('2023-01-01T00:00:00.000Z'),
            organisation: { id: 'org-2', name: 'Org 2' },
          },
        ]),
      )

      const result = await donationService.getEligibleTaxReceiptYearOrganisations()
      expect(result).toEqual([
        { year: 2024, organisationId: 'org-1' },
        { year: 2023, organisationId: 'org-2' },
      ])
      expect(prismaServiceMock.donation.findMany).toHaveBeenCalledTimes(1)
      expect(prismaServiceMock.donation.findMany).toHaveBeenCalledWith({
        select: { donatedAt: true, organisation: { select: { id: true } } },
        where: expect.objectContaining({
          taxReceiptId: null,
          organisation: { isTaxReceiptEnabled: true },
          donationType: { isTaxReceiptEnabled: true },
          donatedAt: expect.any(Object),
        }),
      })
    })
  })

  describe('getEligibleTaxReceiptDonations', () => {
    it('should return eligible donations grouped by donor', async () => {
      prismaServiceMock.donation.findMany.mockResolvedValueOnce(
        mockDeep<
          (Donation & { organisation: Organisation; donor: Donor; donationType: DonationType })[]
        >([
          {
            id: 'donation-1',
            amount: 100,
            donatedAt: new Date('2024-01-01T00:00:00.000Z'),
            donor: { id: 'donor-1', firstName: 'John', lastName: 'Doe', isDisabled: false },
            organisation: { isTaxReceiptEnabled: true },
            donationType: { isTaxReceiptEnabled: true },
          },
          {
            id: 'donation-2',
            amount: 200,
            donatedAt: new Date('2024-02-01T00:00:00.000Z'),
            donor: { id: 'donor-1', firstName: 'John', lastName: 'Doe', isDisabled: false },
            organisation: { isTaxReceiptEnabled: true },
            donationType: { isTaxReceiptEnabled: true },
          },
          {
            id: 'donation-3',
            amount: 300,
            donatedAt: new Date('2024-03-01T00:00:00.000Z'),
            donor: { id: 'donor-2', firstName: 'Jane', lastName: 'Smith', isDisabled: false },
            organisation: { isTaxReceiptEnabled: true },
            donationType: { isTaxReceiptEnabled: true },
          },
        ]),
      )

      const year = 2024
      const organisationId = 'org-1'
      const result = await donationService.getEligibleTaxReceiptDonations({
        year,
        organisationId,
      })
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(3)
      expect(prismaServiceMock.donation.findMany).toHaveBeenCalledTimes(1)
      expect(prismaServiceMock.donation.findMany).toHaveBeenCalledWith({
        include: expect.objectContaining({
          donationType: true,
          organisation: expect.any(Object),
          paymentMode: true,
          donor: true,
        }),
        omit: expect.any(Object),
        where: expect.objectContaining({
          taxReceiptId: null,
          organisation: { isTaxReceiptEnabled: true },
          donationType: { isTaxReceiptEnabled: true },
          organisationId,
          donatedAt: expect.any(Object),
        }),
        orderBy: { updatedAt: 'desc' },
      })
    })

    it('should throw error if no eligible donations found', async () => {
      prismaServiceMock.donation.findMany.mockResolvedValueOnce([])
      await expect(
        donationService.getEligibleTaxReceiptDonations({ year: 2024, organisationId: 'org-1' }),
      ).rejects.toThrow('No eligible donations found for organisation ID: org-1 in year: 2024')
    })
  })

  it('should validate donation type on create and update', async () => {
    prismaServiceMock.donationType.findUniqueOrThrow.mockRejectedValueOnce(new Error('Not found'))

    await expect(
      donationService.createDonation({
        donorId: 'donor-id',
        donatedAt: new Date(),
        amount: 100,
        organisationId: 'org-id',
        donationTypeId: 'incompatible-donation-type-id',
        paymentModeId: 'payment-mode-id',
        donationMethodId: 'donation-method-id',
        donationAssetTypeId: 'donation-asset-type-id',
      }),
    ).rejects.toThrow()

    expect(prismaServiceMock.donationType.findUniqueOrThrow).toHaveBeenCalledTimes(1)
    expect(prismaServiceMock.donation.create).toHaveBeenCalledTimes(0)
  })

  it('should create a donation', async () => {
    prismaServiceMock.donationType.findUniqueOrThrow.mockResolvedValueOnce(
      mockDeep<Prisma.DonationTypeGetPayload<null>>({
        id: 'donation-type-id',
        organisationId: 'org-id',
      }),
    )

    prismaServiceMock.donation.create.mockResolvedValueOnce(
      mockDeep<
        Prisma.DonationGetPayload<{
          include: {
            organisation: { select: { isTaxReceiptEnabled: true } }
            donationType: { select: { isTaxReceiptEnabled: true } }
          }
        }>
      >({
        id: 'new-donation-id',
        organisation: { isTaxReceiptEnabled: false },
        donationType: { isTaxReceiptEnabled: false },
      }),
    )

    await donationService.createDonation({
      donorId: 'donor-id',
      donatedAt: new Date(),
      amount: 100,
      organisationId: 'org-id',
      donationTypeId: 'donation-type-id',
      paymentModeId: 'payment-mode-id',
      donationMethodId: 'donation-method-id',
      donationAssetTypeId: 'donation-asset-type-id',
    })

    expect(prismaServiceMock.donationType.findUniqueOrThrow).toHaveBeenCalledTimes(1)
    expect(prismaServiceMock.donation.create).toHaveBeenCalledTimes(1)
  })

  describe('update', () => {
    it('should throw error if donation has tax receipt', async () => {
      prismaServiceMock.donation.findUniqueOrThrow.mockResolvedValueOnce(
        mockDeep<Prisma.DonationGetPayload<null>>({
          id: 'existing-donation-id',
          taxReceiptId: 'tax-receipt-id-123',
        }),
      )

      await expect(
        donationService.updateDonation('existing-donation-id', {
          donorId: 'donor-id',
          donatedAt: new Date(),
          amount: 150,
          organisationId: 'org-id',
          donationTypeId: 'donation-type-id',
          paymentModeId: 'payment-mode-id',
          donationMethodId: 'donation-method-id',
          donationAssetTypeId: 'donation-asset-type-id',
        }),
      ).rejects.toThrow('Donation already has a tax receipt associated with it :tax-receipt-id-123')

      expect(prismaServiceMock.donation.findUniqueOrThrow).toHaveBeenCalledTimes(1)
    })

    it('should update a donation', async () => {
      prismaServiceMock.donation.findUniqueOrThrow.mockResolvedValueOnce(
        mockDeep<
          Prisma.DonationGetPayload<{
            include: {
              organisation: { select: { isTaxReceiptEnabled: false } }
              donationType: { select: { isTaxReceiptEnabled: false } }
            }
          }>
        >({
          id: 'existing-donation-id',
          taxReceiptId: null,
          organisation: { isTaxReceiptEnabled: false },
          donationType: { isTaxReceiptEnabled: false },
        }),
      )

      prismaServiceMock.donationType.findUniqueOrThrow.mockResolvedValueOnce(
        mockDeep<Prisma.DonationTypeGetPayload<null>>({
          id: 'donation-type-id',
          organisationId: 'org-id',
        }),
      )

      prismaServiceMock.donation.update.mockResolvedValueOnce(
        mockDeep<
          Prisma.DonationGetPayload<{
            include: {
              organisation: { select: { isTaxReceiptEnabled: false } }
              donationType: { select: { isTaxReceiptEnabled: false } }
            }
          }>
        >({
          id: 'existing-donation-id',
          organisation: { isTaxReceiptEnabled: false },
          donationType: { isTaxReceiptEnabled: false },
        }),
      )

      await donationService.updateDonation('existing-donation-id', {
        donorId: 'donor-id',
        donatedAt: new Date(),
        amount: 150,
        organisationId: 'org-id',
        donationTypeId: 'donation-type-id',
        paymentModeId: 'payment-mode-id',
        donationMethodId: 'donation-method-id',
        donationAssetTypeId: 'donation-asset-type-id',
      })

      expect(prismaServiceMock.donationType.findUniqueOrThrow).toHaveBeenCalledTimes(1)
      expect(prismaServiceMock.donation.update).toHaveBeenCalledTimes(1)
    })
  })

  describe('deleteDonation', () => {
    it('should throw error if donation has tax receipt', async () => {
      prismaServiceMock.donation.findUniqueOrThrow.mockResolvedValueOnce(
        mockDeep<Prisma.DonationGetPayload<null>>({
          id: 'donation-id-to-delete',
          taxReceiptId: 'tax-receipt-id-123',
        }),
      )

      await expect(donationService.deleteDonation('donation-id-to-delete')).rejects.toThrow(
        'Donation already has a tax receipt associated with it :tax-receipt-id-123',
      )

      expect(prismaServiceMock.donation.findUniqueOrThrow).toHaveBeenCalledTimes(1)
    })

    it('should delete a donation', async () => {
      const donationId = 'donation-id-to-delete'

      prismaServiceMock.donation.findUniqueOrThrow.mockResolvedValueOnce(
        mockDeep<Prisma.DonationGetPayload<null>>({
          id: 'existing-donation-id',
          taxReceiptId: null,
        }),
      )

      await donationService.deleteDonation(donationId)

      expect(prismaServiceMock.donation.delete).toHaveBeenCalledTimes(1)
    })
  })

  it('should get donation export list', async () => {
    prismaServiceMock.donation.findMany.mockResolvedValueOnce([])

    await donationService.getExportList({ updatedAt: 'desc' }, 'fr', { amount: { gte: 10 } })

    expect(prismaServiceMock.donation.findMany).toHaveBeenCalledTimes(1)
  })

  describe('getDonationStats', () => {
    it('should return donation stats', async () => {
      const mockAggregateResult = mockDeep<
        Prisma.GetDonationAggregateType<{
          where: { donatedAt: { gte: Date } } | undefined
          _sum: { amount: true }
          _count: { id: true }
          _avg: undefined
          _max: undefined
          _min: undefined
        }>
      >({
        _sum: { amount: 1000 },
        _count: { id: 10 },
      })
      prismaServiceMock.donation.aggregate.mockResolvedValueOnce(mockAggregateResult)

      const result = await donationService.getDonationStats()

      expect(result).toEqual({ count: 10, amount: 1000 })
      expect(prismaServiceMock.donation.aggregate).toHaveBeenCalledTimes(1)
    })

    it('should return donation stats with a minDate', async () => {
      const mockAggregateResult = mockDeep<
        Prisma.GetDonationAggregateType<{
          where: { donatedAt: { gte: Date } } | undefined
          _sum: { amount: true }
          _count: { id: true }
          _avg: undefined
          _max: undefined
          _min: undefined
        }>
      >({
        _sum: { amount: 500 },
        _count: { id: 5 },
      })
      prismaServiceMock.donation.aggregate.mockResolvedValueOnce(mockAggregateResult)
      const minDate = new Date()

      const result = await donationService.getDonationStats(minDate)

      expect(result).toEqual({ count: 5, amount: 500 })
      expect(prismaServiceMock.donation.aggregate).toHaveBeenCalledWith({
        where: { donatedAt: { gte: minDate } },
        _sum: { amount: true },
        _count: { id: true },
      })
    })
  })

  it('should return donation distribution by paymentModeId', async () => {
    const groupBy = 'paymentModeId'
    const mockGroupByResult = mockDeep<
      (Donation & {
        _sum: { amount: number }
        _count: { id: number }
        _avg: undefined
        _max: undefined
        _min: undefined
      })[]
    >([
      {
        paymentModeId: 'pm1',
        _sum: { amount: 1000 },
        _count: { id: 10 },
      },
      {
        paymentModeId: 'pm2',
        _sum: { amount: 2000 },
        _count: { id: 20 },
      },
    ])
    prismaServiceMock.donation.groupBy.mockResolvedValueOnce(mockGroupByResult)

    const result = await donationService.getDonationDistribution(groupBy)

    expect(result).toEqual([
      { id: 'pm1', count: 10, amount: 1000 },
      { id: 'pm2', count: 20, amount: 2000 },
    ])
    expect(prismaServiceMock.donation.groupBy).toHaveBeenCalledWith({
      by: [groupBy],
      _sum: { amount: true },
      _count: { id: true },
    })
  })
})
