import { Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Processor, OnWorkerEvent, WorkerHost } from '@nestjs/bullmq'

import { EMAIL_QUEUE, GCSService, SmtpService } from '@/infrastructure'
import { FileService } from '@/domain'

import type { EmailQueueJob } from '@/infrastructure/types'
import type { Job } from 'bullmq'

@Processor(EMAIL_QUEUE)
export class EmailConsumer extends WorkerHost implements OnModuleInit {
  private readonly logger = new Logger(EmailConsumer.name)
  private htmlTemplate: string | null = null

  constructor(
    private readonly fileService: FileService,
    private readonly gcsService: GCSService,
    private readonly smtpService: SmtpService,
    private readonly configService: ConfigService,
  ) {
    super()
  }

  async onModuleInit() {
    if (this.htmlTemplate) return

    if (this.configService.getOrThrow<string>('EMAIL_ENABLED') === 'true') {
      const templateStorageKey = this.configService.getOrThrow<string>('EMAIL_TEMPLATE_STORAGE_KEY')
      this.htmlTemplate = await this.gcsService
        .downloadFile(templateStorageKey)
        .then((buffer) => buffer.toString('utf-8'))
    }
  }

  async process({ id, name, data }: EmailQueueJob) {
    switch (name) {
      case 'SEND_RECEIPT': {
        const { buffer: taxReceipt, metadata } = await this.fileService.downloadFile(data.fileId)
        await this.smtpService.sendMessage(id!, {
          to: data.to,
          subject:
            this.configService.get<string>('EMAIL_TEMPLATE_STORAGE_KEY') === 'demo'
              ? 'Demo Email'
              : `Reçu fiscal numéro ${data.taxReceiptNumber}`,
          html: this.htmlTemplate!,
          attachments: [
            {
              filename: metadata.name,
              contentType: metadata.mimeType,
              content: taxReceipt,
            },
          ],
        })
        break
      }
    }
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job, error: Error) {
    this.logger.error(
      {
        code: 'EMAIL_JOB_FAILED',
        jobId: job.id,
        jobData: job.data,
        errorStack: error.stack,
      },
      `Email job ${job.id} failed with error: ${error.message}`,
    )
  }
}
