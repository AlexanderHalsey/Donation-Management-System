import { Test, TestingModule } from '@nestjs/testing'
import { mockDeep, mockReset } from 'jest-mock-extended'

import { EmailConsumer } from '../consumers/email.consumer'

import { FileService } from '../../domain/services/file.service'
import { ConfigService } from '@nestjs/config'
import { GCSService } from '../services/gcs.service'
import { SmtpService } from '../services/smtp.service'

import type { EmailQueueJob } from '../types/queues.type'
import type { FileMetadata } from '@shared/models'

describe('EmailConsumer', () => {
  const fileServiceMock = mockDeep<FileService>()
  const gcsServiceMock = mockDeep<GCSService>()
  const smtpServiceMock = mockDeep<SmtpService>()
  const configServiceMock = mockDeep<ConfigService>()
  let emailConsumer: EmailConsumer

  beforeEach(async () => {
    jest.resetAllMocks()
    mockReset(fileServiceMock)
    mockReset(gcsServiceMock)
    mockReset(smtpServiceMock)
    mockReset(configServiceMock)

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        EmailConsumer,
        { provide: FileService, useValue: fileServiceMock },
        { provide: GCSService, useValue: gcsServiceMock },
        { provide: SmtpService, useValue: smtpServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile()

    app.useLogger(false)

    emailConsumer = app.get<EmailConsumer>(EmailConsumer)
  })

  it('should send email with attachment when SEND_RECEIPT job is processed', async () => {
    configServiceMock.getOrThrow.mockReturnValueOnce('true')
    configServiceMock.getOrThrow.mockReturnValueOnce('demo')
    gcsServiceMock.downloadFile.mockResolvedValue(Buffer.from('<html>FromStorage</html>'))
    await emailConsumer.onModuleInit()
    fileServiceMock.downloadFile.mockResolvedValue({
      buffer: Buffer.from('pdf'),
      metadata: mockDeep<FileMetadata>({ name: 'receipt.pdf', mimeType: 'application/pdf' }),
    })

    await emailConsumer.process(
      mockDeep<EmailQueueJob>({
        id: 'job-1',
        name: 'SEND_RECEIPT',
        data: {
          to: 'test@example.com',
          taxReceiptNumber: 12345,
          fileId: 'file-1',
        },
      }),
    )

    expect(smtpServiceMock.sendMessage).toHaveBeenCalledWith('job-1', {
      to: 'test@example.com',
      subject: expect.any(String),
      html: '<html>FromStorage</html>',
      attachments: [
        {
          filename: 'receipt.pdf',
          contentType: 'application/pdf',
          content: Buffer.from('pdf'),
        },
      ],
    })
  })
})
