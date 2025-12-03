import { Injectable } from '@nestjs/common'

import { nullsToUndefined } from '@shared/utils'

import { PrismaService } from '@/infrastructure'

import { Organisation, OrganisationRef } from '@shared/models'
import type { OrganisationRequest } from '@/api/dtos'

@Injectable()
export class OrganisationService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<Organisation[]> {
    return (
      await this.prisma.organisation.findMany({
        where: {
          isDisabled: false,
        },
      })
    ).map(nullsToUndefined)
  }

  async getAllRefs(): Promise<OrganisationRef[]> {
    return this.prisma.organisation.findMany({
      select: {
        id: true,
        name: true,
        isDisabled: true,
      },
    })
  }

  async getById(id: string): Promise<Organisation> {
    const organisation = await this.prisma.organisation.findUniqueOrThrow({ where: { id } })
    return nullsToUndefined(organisation)
  }

  async create(request: OrganisationRequest): Promise<Organisation> {
    const organisation = await this.prisma.organisation.create({
      data: {
        name: request.name,
        title: request.title,
        address: request.address,
        locality: request.locality,
        postCode: request.postCode,
        logoUrl: request.logoUrl,
        object: request.object,
        objectDescription: request.objectDescription,
        signatoryName: request.signatoryName,
        signatoryPosition: request.signatoryPosition,
        signatureUrl: request.signatureUrl,
      },
    })
    return nullsToUndefined(organisation)
  }

  async update(id: string, request: OrganisationRequest): Promise<Organisation> {
    const organisation = await this.prisma.organisation.update({
      where: { id },
      data: {
        name: request.name,
        title: request.title,
        address: request.address,
        locality: request.locality,
        postCode: request.postCode,
        logoUrl: request.logoUrl,
        object: request.object,
        objectDescription: request.objectDescription,
        signatoryName: request.signatoryName,
        signatoryPosition: request.signatoryPosition,
        signatureUrl: request.signatureUrl,
      },
    })
    return nullsToUndefined(organisation)
  }

  async disable(id: string): Promise<Organisation> {
    const organisation = await this.prisma.organisation.update({
      where: { id },
      data: { isDisabled: true },
    })
    return nullsToUndefined(organisation)
  }

  async cleanupNonAttachedDisabled(): Promise<void> {
    await this.prisma.organisation.deleteMany({
      where: {
        isDisabled: true,
        donations: { none: {} },
      },
    })
  }
}
