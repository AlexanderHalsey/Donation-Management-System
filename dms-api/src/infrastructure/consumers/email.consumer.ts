import { BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Processor, OnWorkerEvent, WorkerHost } from '@nestjs/bullmq'

import * as fs from 'fs'
import * as path from 'path'

import { EMAIL_QUEUE, FileStorageService, SmtpService } from '@/infrastructure'
import { FileService } from '@/domain'

import type { EmailQueueJob } from '@/infrastructure/types'
import type { Job } from 'bullmq'

@Processor(EMAIL_QUEUE)
export class EmailConsumer extends WorkerHost {
  private htmlTemplate: string | null = null

  constructor(
    private readonly fileService: FileService,
    private readonly fileStorageService: FileStorageService,
    private readonly smtpService: SmtpService,
    private readonly configService: ConfigService,
  ) {
    super()
  }

  private async selectHtmlTemplateForEnvironment() {
    if (this.htmlTemplate) return

    const templateKey = this.configService.get<string>('EMAIL_TEMPLATE_STORAGE_KEY')
    if (!templateKey) {
      throw new BadRequestException('EMAIL_TEMPLATE_STORAGE_KEY environment variable is not set.')
    }
    if (templateKey === 'demo') {
      const emailTemplatePath = path.join(process.cwd(), 'src/assets/demoEmailTemplate.html')
      this.htmlTemplate = fs.readFileSync(emailTemplatePath).toString('utf-8')
    } else {
      this.htmlTemplate = await this.fileStorageService
        .downloadFile(templateKey)
        .then((buffer) => buffer.toString('utf-8'))
    }
  }

  async process({ name, data }: EmailQueueJob) {
    switch (name) {
      case 'SEND_RECEIPT': {
        await this.selectHtmlTemplateForEnvironment()
        const { buffer: taxReceipt, metadata } = await this.fileService.downloadFile(data.fileId)
        await this.smtpService.sendMessage({
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
    console.error(`Job ${job.id} failed with error:`, error.message)
    console.error('Job data:', JSON.stringify(job.data, null, 2))
    console.error('Error stack:', error.stack)
  }
}
