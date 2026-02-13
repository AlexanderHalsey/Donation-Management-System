import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { createTransport } from 'nodemailer'
import type { Options as MailOptions } from 'nodemailer/lib/mailer'

import { WorkerJobProcessException } from '@/domain/exceptions'

@Injectable()
export class SmtpService {
  private readonly logger = new Logger(SmtpService.name)

  constructor(private readonly configService: ConfigService) {}

  async sendMessage(
    jobId: string,
    { to, subject, html, attachments }: MailOptions,
  ): Promise<{
    messageId: string
  }> {
    const transport = createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    })

    try {
      const smtpSender = this.configService.get<string>('SMTP_SENDER')
      const smtpUser = this.configService.get<string>('SMTP_USER')

      if (!smtpSender || !smtpUser) {
        throw new WorkerJobProcessException({
          code: 'SMTP_CONFIG_MISSING',
          message: 'SMTP_SENDER or SMTP_USER environment variable is not set',
        })
      }

      const result = await transport.sendMail({
        from: `${smtpSender} <${smtpUser}>`,
        to,
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
