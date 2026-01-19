import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'

import { DonationAssetTypeService } from '@/domain'

@Injectable()
export class DonationAssetTypeCleanupTask {
  constructor(private readonly donationAssetTypeService: DonationAssetTypeService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupNonAttachedDisabled() {
    await this.donationAssetTypeService.cleanupNonAttachedDisabled()
  }
}
