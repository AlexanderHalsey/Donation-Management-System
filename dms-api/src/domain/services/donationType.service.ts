import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common'
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager'

import { PrismaService } from '@/infrastructure'

import type { DonationType } from '@shared/models'
import type { DonationTypeRequest } from '@/api/dtos'

@Injectable()
export class DonationTypeService {
  private readonly logger = new Logger(DonationTypeService.name)

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async getAll(): Promise<DonationType[]> {
    const donationTypes = await this.prisma.donationType.findMany()

    this.logger.log(`Retrieved ${donationTypes.length} donation types`)

    return donationTypes
  }

  async getById(id: string): Promise<DonationType> {
    const donationType = await this.prisma.donationType.findUniqueOrThrow({
      where: { id },
    })

    this.logger.log(`Retrieved donation type with ID ${id} and name "${donationType.name}"`)

    return donationType
  }

  async create(request: DonationTypeRequest): Promise<DonationType> {
    const organisation = await this.prisma.organisation.findUniqueOrThrow({
      where: { id: request.organisationId },
    })

    if (!organisation.isTaxReceiptEnabled && request.isTaxReceiptEnabled) {
      throw new BadRequestException({
        code: 'TAX_RECEIPT_NOT_ENABLED_FOR_ORGANISATION',
        message:
          'Cannot enable tax receipts for a donation type when the parent organisation has tax receipts disabled',
      })
    }

    const donationType = await this.prisma.donationType.create({
      data: {
        name: request.name,
        organisationId: request.organisationId,
        isTaxReceiptEnabled: request.isTaxReceiptEnabled,
      },
    })

    this.logger.log(
      `Created donation type with ID ${donationType.id} and name "${donationType.name}" for organisation ID ${request.organisationId}`,
    )
    await this.cacheManager.del('donation-types')

    return donationType
  }

  async update(id: string, request: DonationTypeRequest): Promise<DonationType> {
    const organisation = await this.prisma.organisation.findUniqueOrThrow({
      where: { id: request.organisationId },
    })

    if (!organisation.isTaxReceiptEnabled && request.isTaxReceiptEnabled) {
      throw new BadRequestException({
        code: 'TAX_RECEIPT_NOT_ENABLED_FOR_ORGANISATION',
        message:
          'Cannot enable tax receipts for a donation type when the parent organisation has tax receipts disabled',
      })
    }

    const donationType = await this.prisma.donationType.update({
      where: { id },
      data: {
        name: request.name,
        organisationId: request.organisationId,
        isTaxReceiptEnabled: request.isTaxReceiptEnabled,
      },
    })

    this.logger.log(
      `Updated donation type with ID ${donationType.id}. New name: "${donationType.name}", isTaxReceiptEnabled: ${donationType.isTaxReceiptEnabled}`,
    )
    await this.cacheManager.del('donation-types')

    return donationType
  }

  async disable(id: string): Promise<DonationType> {
    const donationType = await this.prisma.donationType.update({
      where: { id },
      data: { isDisabled: true },
    })

    this.logger.log(`Disabled donation type with ID ${donationType.id}`)
    await this.cacheManager.del('donation-types')

    return donationType
  }

  async cleanupNonAttachedDisabled(): Promise<void> {
    await this.prisma.donationType.deleteMany({
      where: {
        isDisabled: true,
        donations: { none: {} },
      },
    })

    this.logger.log('Cleaned up non-attached disabled donation types')
    await this.cacheManager.del('donation-types')
  }
}
