import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createTransport } from 'nodemailer'
import type { Options as MailOptions } from 'nodemailer/lib/mailer'

@Injectable()
export class SmtpService {
  constructor(private readonly configService: ConfigService) {}

  async sendMessage({ to, subject, html, attachments }: MailOptions): Promise<{
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
        throw new Error('SMTP_SENDER or SMTP_USER environment variable is not set')
      }
      const result = await transport.sendMail({
        from: `${smtpSender} <${smtpUser}>`,
        to,
        subject,
        html,
        attachments,
      })
      return { messageId: result.messageId }
    } catch (err) {
      console.warn('Error while sending SMTP email', { err })
      throw err
    }
  }
}
