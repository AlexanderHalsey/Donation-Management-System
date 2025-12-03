import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'

import { FileService } from '@/domain'

@Injectable()
export class FileCleanupTask {
  constructor(private readonly fileService: FileService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredDrafts() {
    await this.fileService.cleanupExpiredDrafts()
  }
}
