import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { mockDeep, mockReset } from 'jest-mock-extended'

import { DonationService } from '../services/donation.service'
import { PrismaService } from '@/infrastructure'

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
    prismaServiceMock.donation.findUniqueOrThrow.mockResolvedValueOnce({
      id: donationId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

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
    prismaServiceMock.donationType.findUniqueOrThrow.mockResolvedValueOnce({
      id: 'donation-type-id',
      organisationId: 'org-id',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    prismaServiceMock.donation.create.mockResolvedValueOnce({
      id: 'new-donation-id',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

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

  it('should update a donation', async () => {
    prismaServiceMock.donationType.findUniqueOrThrow.mockResolvedValueOnce({
      id: 'donation-type-id',
      organisationId: 'org-id',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    prismaServiceMock.donation.update.mockResolvedValueOnce({
      id: 'existing-donation-id',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

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

  it('should delete a donation', async () => {
    const donationId = 'donation-id-to-delete'

    prismaServiceMock.donation.delete.mockResolvedValueOnce({
      id: donationId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    await donationService.deleteDonation(donationId)

    expect(prismaServiceMock.donation.delete).toHaveBeenCalledTimes(1)
  })
})
