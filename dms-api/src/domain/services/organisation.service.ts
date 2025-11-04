import { Injectable } from '@nestjs/common'

import { nullsToUndefined } from '@shared/utils'

import { PrismaService } from '@/infrastructure'

import { Organisation } from '@shared/models'

@Injectable()
export class OrganisationService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<Organisation[]> {
    return (await this.prisma.organisation.findMany()).map(nullsToUndefined)
  }
}
