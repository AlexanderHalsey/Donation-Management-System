import { Injectable } from '@nestjs/common'

import { nullsToUndefined } from '@shared/utils'

import { PrismaService } from '@/infrastructure'

import { DonorListItem, DonorRef } from '@shared/models'
import { omit } from 'es-toolkit'

@Injectable()
export class DonorService {
  constructor(private readonly prisma: PrismaService) {}

  async getFilteredList(): Promise<DonorListItem[]> {
    const donors = await this.prisma.donor.findMany({
      select: {
        id: true,
        externalId: true,
        firstName: true,
        lastName: true,
        updatedAt: true,
        email: true,
        donations: {
          select: {
            amount: true,
          },
        },
      },
    })
    return nullsToUndefined(donors.map((donor) => this.getAdditionalProperties(donor)))
  }

  async getAllRefs(): Promise<DonorRef[]> {
    return nullsToUndefined(
      await this.prisma.donor.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      }),
    )
  }

  private getAdditionalProperties<T extends { donations: { amount: number }[] }>(
    donor: T,
  ): Omit<T, 'donations'> & { donationCount: number; donationTotalAmount: number } {
    return {
      ...omit(donor, ['donations']),
      donationCount: donor.donations.length,
      donationTotalAmount: donor.donations.reduce((sum, donation) => sum + donation.amount, 0),
    }
  }
}
