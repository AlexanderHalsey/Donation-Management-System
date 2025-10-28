import { Injectable } from '@nestjs/common'

import { PrismaService } from '@/infrastructure'

@Injectable()
export class DonationService {
  constructor(private readonly prisma: PrismaService) {}
}
