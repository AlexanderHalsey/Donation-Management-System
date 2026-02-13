import { Inject, Injectable, Logger } from '@nestjs/common'
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager'

import { PrismaService } from '@/infrastructure'

import type { DonationMethod } from '@shared/models'
import type { DonationMethodRequest } from '@/api/dtos'

@Injectable()
export class DonationMethodService {
  private readonly logger = new Logger(DonationMethodService.name)

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async getAll(): Promise<DonationMethod[]> {
    const donationMethods = await this.prisma.donationMethod.findMany()

    this.logger.log(`Retrieved ${donationMethods.length} donation methods`)

    return donationMethods
  }

  async getById(id: string): Promise<DonationMethod> {
    const donationMethod = await this.prisma.donationMethod.findUniqueOrThrow({
      where: { id },
    })

    this.logger.log(`Retrieved donation method with ID ${id} and name "${donationMethod.name}"`)

    return donationMethod
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

      this.logger.log(
        `Created donation method with ID ${donationMethod.id} and name "${donationMethod.name}"`,
      )
      await this.cacheManager.del('donation-methods')

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

      this.logger.log(
        `Updated donation method with ID ${donationMethod.id}. New name: "${donationMethod.name}", isDefault: ${donationMethod.isDefault}`,
      )
      await this.cacheManager.del('donation-methods')

      return donationMethod
    })
  }

  async disable(id: string): Promise<DonationMethod> {
    const donationMethod = await this.prisma.donationMethod.update({
      where: { id },
      data: { isDisabled: true },
    })

    this.logger.log(`Disabled donation method with ID ${donationMethod.id}`)
    await this.cacheManager.del('donation-methods')

    return donationMethod
  }

  async cleanupNonAttachedDisabled(): Promise<void> {
    await this.prisma.donationMethod.deleteMany({
      where: {
        isDisabled: true,
        donations: { none: {} },
      },
    })

    this.logger.log('Cleaned up non-attached disabled donation methods')
    await this.cacheManager.del('donation-methods')
  }
}
