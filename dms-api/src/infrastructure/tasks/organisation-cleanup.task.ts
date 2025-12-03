import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'

import { OrganisationService } from '@/domain'

@Injectable()
export class OrganisationCleanupTask {
  constructor(private readonly organisationService: OrganisationService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupNonAttachedDisabled() {
    await this.organisationService.cleanupNonAttachedDisabled()
  }
}
