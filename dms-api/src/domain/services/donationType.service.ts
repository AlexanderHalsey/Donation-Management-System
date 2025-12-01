import { Injectable } from '@nestjs/common'

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
    return this.prisma.donationType.create({ data: request })
  }

  async update(id: string, request: DonationTypeRequest): Promise<DonationType> {
    return this.prisma.donationType.update({
      where: { id },
      data: request,
    })
  }

  async disable(id: string): Promise<DonationType> {
    return this.prisma.donationType.update({
      where: { id },
      data: { isDisabled: true },
    })
  }
}
