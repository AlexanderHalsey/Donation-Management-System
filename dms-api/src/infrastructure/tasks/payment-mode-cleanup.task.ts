import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'

import { PaymentModeService } from '@/domain'

@Injectable()
export class PaymentModeCleanupTask {
  constructor(private readonly paymentModeService: PaymentModeService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupNonAttachedDisabled() {
    await this.paymentModeService.cleanupNonAttachedDisabled()
  }
}
