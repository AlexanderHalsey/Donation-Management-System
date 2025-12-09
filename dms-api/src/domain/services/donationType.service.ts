import { BadRequestException, Injectable } from '@nestjs/common'

import { PrismaService } from '@/infrastructure'

import type { DonationType } from '@shared/models'
import type { DonationTypeRequest } from '@/api/dtos'

@Injectable()
export class DonationTypeService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<DonationType[]> {
    return this.prisma.donationType.findMany()
  }

  async getById(id: string): Promise<DonationType> {
    return this.prisma.donationType.findUniqueOrThrow({ where: { id } })
  }

  async create(request: DonationTypeRequest): Promise<DonationType> {
    const organisation = await this.prisma.organisation.findUniqueOrThrow({
      where: { id: request.organisationId },
    })

    if (!organisation.isTaxReceiptEnabled && request.isTaxReceiptEnabled) {
      throw new BadRequestException(
        'Cannot enable tax receipts for a donation type when the parent organisation has tax receipts disabled',
      )
    }

    return this.prisma.donationType.create({
      data: {
        name: request.name,
        organisationId: request.organisationId,
        isTaxReceiptEnabled: request.isTaxReceiptEnabled,
      },
    })
  }

  async update(id: string, request: DonationTypeRequest): Promise<DonationType> {
    const organisation = await this.prisma.organisation.findUniqueOrThrow({
      where: { id: request.organisationId },
    })

    if (!organisation.isTaxReceiptEnabled && request.isTaxReceiptEnabled) {
      throw new BadRequestException(
        'Cannot enable tax receipts for a donation type when the parent organisation has tax receipts disabled',
      )
    }

    return this.prisma.donationType.update({
      where: { id },
      data: {
        name: request.name,
        organisationId: request.organisationId,
        isTaxReceiptEnabled: request.isTaxReceiptEnabled,
      },
    })
  }

  async disable(id: string): Promise<DonationType> {
    return this.prisma.donationType.update({
      where: { id },
      data: { isDisabled: true },
    })
  }

  async cleanupNonAttachedDisabled(): Promise<void> {
    await this.prisma.donationType.deleteMany({
      where: {
        isDisabled: true,
        donations: { none: {} },
      },
    })
  }
}
