import { Injectable } from '@nestjs/common'

import { nullsToUndefined } from '@shared/utils'

import { PrismaService } from '@/infrastructure'

import { Organisation, OrganisationRef } from '@shared/models'

@Injectable()
export class OrganisationService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<Organisation[]> {
    return (await this.prisma.organisation.findMany()).map(nullsToUndefined)
  }

  async getAllRefs(): Promise<OrganisationRef[]> {
    return this.prisma.organisation.findMany({
      select: {
        id: true,
        name: true,
      },
    })
  }
}
