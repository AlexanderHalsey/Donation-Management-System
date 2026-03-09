import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ConfigService } from '@nestjs/config'

import { execSync } from 'child_process'
import * as fs from 'fs'

import { Bucket, Storage } from '@google-cloud/storage'

@Injectable()
export class DbBackupTask {
  private readonly logger = new Logger(DbBackupTask.name)
  private bucket: Bucket

  constructor(private readonly configService: ConfigService) {
    this.bucket = new Storage().bucket(
      this.configService.getOrThrow<string>('GCS_BACKUP_BUCKET_NAME'),
    )
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async backupDatabase() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupName = `db-backup-${timestamp}.dump`
    try {
      const dbUrl = this.configService.getOrThrow<string>('DATABASE_URL')

      const match = dbUrl.match(/^postgres:\/\/(.*?):(.*?)@(.*?):(.*?)\/(.*?)$/)
      if (!match) throw new Error('DATABASE_URL format invalid')

      const [_, user, password, host, port, dbname] = match

      execSync(
        `PGPASSWORD="${password}" pg_dump -h ${host} -p ${port} -U ${user} -d ${dbname} -F c -f "${backupName}"`,
      )

      await this.bucket.file(backupName).save(fs.readFileSync(backupName), {
        validation: 'md5',
        contentType: 'application/octet-stream',
      })

      this.logger.log(`File ${backupName} uploaded to GCS bucket ${this.bucket.name} successfully`)
    } catch (error) {
      this.logger.error(
        {
          code: 'DB_BACKUP_TASK_FAILED',
          errorStack: error.stack,
        },
        `Database backup task failed with error: ${error.message}`,
      )
    } finally {
      if (fs.existsSync(backupName)) {
        fs.unlinkSync(backupName)
      }
    }
  }
}
