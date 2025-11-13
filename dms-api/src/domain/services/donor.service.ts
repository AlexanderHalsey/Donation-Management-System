import { Injectable } from '@nestjs/common'

import { nullsToUndefined } from '@shared/utils'

import { PrismaService } from '@/infrastructure'

import { Donor, DonorSummary } from '@shared/models'
import { omit } from 'es-toolkit'

@Injectable()
export class DonorService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<Donor[]> {
    const donors = await this.prisma.donor.findMany({
      include: {
        donations: {
          select: {
            amount: true,
          },
        },
      },
    })
    return nullsToUndefined(
      donors.map((donor) => ({
        ...omit(donor, ['donations']),
        donationCount: donor.donations.length,
        donationTotalAmount: donor.donations.reduce((sum, donation) => sum + donation.amount, 0),
      })),
    )
  }

  async getAllSummaries(): Promise<DonorSummary[]> {
    return nullsToUndefined(
      await this.prisma.donor.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    )
  }
}
