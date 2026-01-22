import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'

import { DonorSyncEventService } from '@/domain'

@Injectable()
export class DonorSyncCleanupTask {
  constructor(private readonly donorSyncEventService: DonorSyncEventService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldEvents() {
    await this.donorSyncEventService.cleanupOldEvents()
  }
}
