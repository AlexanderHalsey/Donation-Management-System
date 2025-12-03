import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'

import { DonationTypeService } from '@/domain'

@Injectable()
export class DonationTypeCleanupTask {
  constructor(private readonly donationTypeService: DonationTypeService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupNonAttachedDisabled() {
    await this.donationTypeService.cleanupNonAttachedDisabled()
  }
}
