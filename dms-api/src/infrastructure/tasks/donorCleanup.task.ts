import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'

import { DonorService } from '@/domain'

@Injectable()
export class DonorCleanupTask {
  constructor(private readonly donorService: DonorService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupNonAttachedDisabled() {
    await this.donorService.cleanupNonAttachedDisabled()
  }
}
