import { Injectable } from '@nestjs/common'

import { PrismaService } from '@/infrastructure'

import type { DonationMethod } from '@shared/models'
import type { DonationMethodRequest } from '@/api/dtos'

@Injectable()
export class DonationMethodService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<DonationMethod[]> {
    return this.prisma.donationMethod.findMany()
  }

  async getById(id: string): Promise<DonationMethod> {
    return this.prisma.donationMethod.findUniqueOrThrow({ where: { id } })
  }

  async create(request: DonationMethodRequest): Promise<DonationMethod> {
    return this.prisma.$transaction(async (tx) => {
      const donationMethod = await tx.donationMethod.create({
        data: {
          name: request.name,
          isDefault: request.isDefault,
        },
      })
      if (request.isDefault) {
        await tx.donationMethod.updateMany({
          where: { id: { not: donationMethod.id } },
          data: { isDefault: false },
        })
      }
      return donationMethod
    })
  }

  async update(id: string, request: DonationMethodRequest): Promise<DonationMethod> {
    return this.prisma.$transaction(async (tx) => {
      const donationMethod = await tx.donationMethod.update({
        where: { id },
        data: {
          name: request.name,
          isDefault: request.isDefault,
        },
      })
      if (request.isDefault) {
        await tx.donationMethod.updateMany({
          where: { id: { not: id } },
          data: { isDefault: false },
        })
      }
      return donationMethod
    })
  }

  async disable(id: string): Promise<DonationMethod> {
    return this.prisma.donationMethod.update({
      where: { id },
      data: { isDisabled: true },
    })
  }

  async cleanupNonAttachedDisabled(): Promise<void> {
    await this.prisma.donationMethod.deleteMany({
      where: {
        isDisabled: true,
        donations: { none: {} },
      },
    })
  }
}
