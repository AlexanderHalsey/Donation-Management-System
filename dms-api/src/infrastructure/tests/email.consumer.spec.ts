import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { mockDeep, mockReset } from 'jest-mock-extended'

import { EmailConsumer } from '../consumers/email.consumer'

import { FileService } from '../../domain/services/file.service'
import { FileStorageService } from '../services/fileStorage.service'
import { SmtpService } from '../services/smtp.service'

import type { EmailQueueJob } from '../types/queues.type'
import type { FileMetadata } from '@shared/models'
import type { Job } from 'bullmq'

describe('EmailConsumer', () => {
  const fileServiceMock = mockDeep<FileService>()
  const fileStorageServiceMock = mockDeep<FileStorageService>()
  const smtpServiceMock = mockDeep<SmtpService>()
  let emailConsumer: EmailConsumer

  beforeEach(async () => {
    jest.resetAllMocks()
    mockReset(fileServiceMock)
    mockReset(fileStorageServiceMock)
    mockReset(smtpServiceMock)

    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        EmailConsumer,
        { provide: FileService, useValue: fileServiceMock },
        { provide: FileStorageService, useValue: fileStorageServiceMock },
        { provide: SmtpService, useValue: smtpServiceMock },
      ],
    }).compile()

    emailConsumer = app.get<EmailConsumer>(EmailConsumer)
  })

  describe('process', () => {
    it('should send email with attachment when SEND_RECEIPT job is processed', async () => {
      process.env.EMAIL_TEMPLATE_STORAGE_KEY = 'demo'
      fileServiceMock.downloadFile.mockResolvedValue({
        buffer: Buffer.from('pdf'),
        metadata: mockDeep<FileMetadata>({ name: 'receipt.pdf', mimeType: 'application/pdf' }),
      })

      await emailConsumer.process(
        mockDeep<EmailQueueJob>({
          name: 'SEND_RECEIPT',
          data: {
            to: 'test@example.com',
            taxReceiptNumber: 12345,
            fileId: 'file-1',
          },
        }),
      )

      expect(smtpServiceMock.sendMessage).toHaveBeenCalledWith({
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
      process.env.EMAIL_TEMPLATE_STORAGE_KEY = 'some-storage-key'
      fileServiceMock.downloadFile.mockResolvedValue({
        buffer: Buffer.from('pdf'),
        metadata: mockDeep<FileMetadata>({ name: 'receipt2.pdf', mimeType: 'application/pdf' }),
      })
      fileStorageServiceMock.downloadFile.mockResolvedValue(Buffer.from('<html>FromStorage</html>'))

      await emailConsumer.process(
        mockDeep<EmailQueueJob>({
          name: 'SEND_RECEIPT',
          data: {
            to: 'test2@example.com',
            taxReceiptNumber: 54321,
            fileId: 'file-2',
          },
        }),
      )
      expect(smtpServiceMock.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test2@example.com',
          html: '<html>FromStorage</html>',
        }),
      )
    })
  })

  describe('onFailed', () => {
    it('should log error details', async () => {
      const error = new Error('fail')
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
      await emailConsumer.onFailed(mockDeep<Job>({ id: '1', data: { foo: 'bar' } }), error)
      expect(spy).toHaveBeenCalled()
      spy.mockRestore()
    })
  })
})
