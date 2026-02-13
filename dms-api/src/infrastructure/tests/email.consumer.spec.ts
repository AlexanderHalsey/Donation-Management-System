import { Test, TestingModule } from '@nestjs/testing'
import { mockDeep, mockReset } from 'jest-mock-extended'

import { EmailConsumer } from '../consumers/email.consumer'

import { FileService } from '../../domain/services/file.service'
import { ConfigService } from '@nestjs/config'
import { FileStorageService } from '../services/fileStorage.service'
import { SmtpService } from '../services/smtp.service'

import type { EmailQueueJob } from '../types/queues.type'
import type { FileMetadata } from '@shared/models'

describe('EmailConsumer', () => {
  const fileServiceMock = mockDeep<FileService>()
  const fileStorageServiceMock = mockDeep<FileStorageService>()
  const smtpServiceMock = mockDeep<SmtpService>()
  const configServiceMock = mockDeep<ConfigService>({
    get: jest.fn((key: string) => {
      if (key === 'EMAIL_TEMPLATE_STORAGE_KEY') return 'demo'
      return undefined
    }),
  })
  let emailConsumer: EmailConsumer

  beforeEach(async () => {
    jest.resetAllMocks()
    mockReset(fileServiceMock)
    mockReset(fileStorageServiceMock)
    mockReset(smtpServiceMock)
    mockReset(configServiceMock)

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        EmailConsumer,
        { provide: FileService, useValue: fileServiceMock },
        { provide: FileStorageService, useValue: fileStorageServiceMock },
        { provide: SmtpService, useValue: smtpServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile()

    app.useLogger(false)

    emailConsumer = app.get<EmailConsumer>(EmailConsumer)
  })
  describe('process', () => {
    it('should send email with attachment when SEND_RECEIPT job is processed', async () => {
      configServiceMock.get.mockReturnValueOnce('demo')
      emailConsumer.onModuleInit()
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
        html: expect.any(String),
        attachments: [
          {
            filename: 'receipt.pdf',
            contentType: 'application/pdf',
            content: Buffer.from('pdf'),
          },
        ],
      })
    })

    it('should not throw if SEND_RECEIPT job is processed and template is loaded from storage', async () => {
      configServiceMock.get.mockReturnValueOnce('some-storage-key')
      fileServiceMock.downloadFile.mockResolvedValue({
        buffer: Buffer.from('pdf'),
        metadata: mockDeep<FileMetadata>({ name: 'receipt2.pdf', mimeType: 'application/pdf' }),
      })
      fileStorageServiceMock.downloadFile.mockResolvedValue(Buffer.from('<html>FromStorage</html>'))
      await emailConsumer.onModuleInit()

      await emailConsumer.process(
        mockDeep<EmailQueueJob>({
          id: 'job-1',
          name: 'SEND_RECEIPT',
          data: {
            to: 'test2@example.com',
            taxReceiptNumber: 54321,
            fileId: 'file-2',
          },
        }),
      )
      expect(smtpServiceMock.sendMessage).toHaveBeenCalledWith(
        'job-1',
        expect.objectContaining({
          to: 'test2@example.com',
          html: '<html>FromStorage</html>',
        }),
      )
    })
  })
})
