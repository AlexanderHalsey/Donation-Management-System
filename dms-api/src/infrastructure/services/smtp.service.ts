import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { createTransport } from 'nodemailer'
import type { Options as MailOptions } from 'nodemailer/lib/mailer'

import { WorkerJobProcessException } from '@/domain/exceptions'

@Injectable()
export class SmtpService {
  private readonly logger = new Logger(SmtpService.name)
  private readonly transport: ReturnType<typeof createTransport> | null = null

  constructor(private readonly configService: ConfigService) {
    if (this.configService.get('EMAIL_ENABLED') === 'true') {
      this.transport = createTransport({
        service: 'gmail',
        auth: {
          user: this.configService.getOrThrow<string>('SMTP_USER'),
          pass: this.configService.getOrThrow<string>('SMTP_PASS'),
        },
      })
    }
  }

  async sendMessage(
    jobId: string,
    { to, subject, html, attachments }: MailOptions,
  ): Promise<{
    messageId: string
  }> {
    if (!this.transport) {
      throw new WorkerJobProcessException({
        code: 'EMAIL_SENDING_DISABLED',
        message: `Failed to send email for job ${jobId} because email sending is disabled`,
      })
    }
    const [sender, user, replyTo] = [
      this.configService.getOrThrow<string>('SMTP_SENDER'),
      this.configService.getOrThrow<string>('SMTP_USER'),
      this.configService.getOrThrow<string>('SMTP_REPLY_TO'),
    ]
    try {
      const result = await this.transport.sendMail({
        from: `${sender} <${user}>`,
        to: this.configService.getOrThrow<string>('EMAIL_TEST_MODE') === 'true' ? user : to,
        replyTo,
        subject,
        html,
        attachments,
      })

      this.logger.log(`Sent email for job ${jobId} with messageId ${result.messageId}`)

      return { messageId: result.messageId }
    } catch (err) {
      throw new WorkerJobProcessException({
        code: 'EMAIL_SENDING_FAILED',
        message: `Failed to send email for job ${jobId} to ${to}`,
        stack: err instanceof Error ? err.stack : undefined,
      })
    }
  }
}
