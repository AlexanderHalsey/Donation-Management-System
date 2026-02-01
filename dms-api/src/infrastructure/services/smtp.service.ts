import { Injectable } from '@nestjs/common'
import { createTransport } from 'nodemailer'
import type { Options as MailOptions } from 'nodemailer/lib/mailer'

@Injectable()
export class SmtpService {
  constructor() {}

  async sendMessage({ to, subject, html, attachments }: MailOptions): Promise<{
    messageId: string
  }> {
    const transport = createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
    try {
      const result = await transport.sendMail({
        from: `${process.env.SMTP_SENDER} <${process.env.SMTP_USER}>`,
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
