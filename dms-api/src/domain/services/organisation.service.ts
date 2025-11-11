import { Injectable } from '@nestjs/common'

import { nullsToUndefined } from '@shared/utils'

import { PrismaService } from '@/infrastructure'

import { Organisation, OrganisationSummary } from '@shared/models'

@Injectable()
export class OrganisationService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<Organisation[]> {
    return (await this.prisma.organisation.findMany()).map(nullsToUndefined)
  }

  async getAllSummaries(): Promise<OrganisationSummary[]> {
    return await this.prisma.organisation.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }
}
