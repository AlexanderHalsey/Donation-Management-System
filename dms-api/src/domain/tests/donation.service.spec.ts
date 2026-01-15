import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { mockDeep, mockReset } from 'jest-mock-extended'

import { DonationService } from '../services/donation.service'
import { PrismaService } from '@/infrastructure'

import { Prisma } from '@generated/prisma/client'

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

    await donationService.getExportList({ updatedAt: 'desc' }, { amount: { gte: 10 } })

    expect(prismaServiceMock.donation.findMany).toHaveBeenCalledTimes(1)
  })
})
