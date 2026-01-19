import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'

import { DonationMethodService } from '@/domain'

@Injectable()
export class DonationMethodCleanupTask {
  constructor(private readonly donationMethodService: DonationMethodService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupNonAttachedDisabled() {
    await this.donationMethodService.cleanupNonAttachedDisabled()
  }
}
