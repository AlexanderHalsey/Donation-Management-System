import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { mockDeep, mockReset } from 'jest-mock-extended'

import { TaxReceiptConsumer } from '../consumers/taxReceipt.consumer'
import { TaxReceiptService } from '../../domain/services/taxReceipt.service'

import type { TaxReceiptQueueJob } from '@/infrastructure/types'
import type { Job } from 'bullmq'

describe('TaxReceiptConsumer', () => {
  const taxReceiptServiceMock = mockDeep<TaxReceiptService>()
  let taxReceiptConsumer: TaxReceiptConsumer

  beforeEach(async () => {
    jest.resetAllMocks()
    mockReset(taxReceiptServiceMock)

    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        TaxReceiptConsumer,
        {
          provide: TaxReceiptService,
          useValue: taxReceiptServiceMock,
        },
      ],
    }).compile()

    app.useLogger(false)

    taxReceiptConsumer = app.get<TaxReceiptConsumer>(TaxReceiptConsumer)
  })

  describe('process', () => {
    it('should process GENERATE job successfully', async () => {
      const mockJob = mockDeep<TaxReceiptQueueJob>({
        id: 'job-123',
        name: 'GENERATE',
        data: {
          taxReceiptId: 'tax-receipt-123',
          taxReceiptNumber: 1001,
          donationIds: ['donation-1', 'donation-2'],
          taxReceiptType: 'INDIVIDUAL',
        },
      })

      taxReceiptServiceMock.processTaxReceiptGenerationJob.mockResolvedValueOnce()

      await taxReceiptConsumer.process(mockJob)

      expect(taxReceiptServiceMock.processTaxReceiptGenerationJob).toHaveBeenCalledWith({
        ...mockJob.data,
        jobId: mockJob.id,
      })
      expect(taxReceiptServiceMock.processTaxReceiptGenerationJob).toHaveBeenCalledTimes(1)
    })

    it('should process RETRY job successfully', async () => {
      const mockJob = mockDeep<TaxReceiptQueueJob>({
        id: 'job-123',
        name: 'RETRY',
        data: {
          taxReceiptId: 'tax-receipt-456',
          taxReceiptNumber: 1002,
          donationIds: ['donation-3'],
          taxReceiptType: 'ANNUAL',
        },
      })

      taxReceiptServiceMock.processTaxReceiptGenerationJob.mockResolvedValueOnce()

      await taxReceiptConsumer.process(mockJob)

      expect(taxReceiptServiceMock.processTaxReceiptGenerationJob).toHaveBeenCalledWith({
        ...mockJob.data,
        jobId: mockJob.id,
      })
      expect(taxReceiptServiceMock.processTaxReceiptGenerationJob).toHaveBeenCalledTimes(1)
    })

    it('should process CANCEL job successfully', async () => {
      const mockJob = mockDeep<TaxReceiptQueueJob>({
        id: 'job-123',
        name: 'CANCEL',
        data: {
          fileId: 'file-123',
          storageKey: 'tax-receipts/file-123.pdf',
        },
      })

      taxReceiptServiceMock.processTaxReceiptCancellationJob.mockResolvedValueOnce()

      await taxReceiptConsumer.process(mockJob)

      expect(taxReceiptServiceMock.processTaxReceiptCancellationJob).toHaveBeenCalledWith({
        ...mockJob.data,
        jobId: mockJob.id,
      })
      expect(taxReceiptServiceMock.processTaxReceiptCancellationJob).toHaveBeenCalledTimes(1)
    })

    it('should handle GENERATE_BATCH job without error', async () => {
      const mockJob = mockDeep<TaxReceiptQueueJob>({
        name: 'GENERATE_BATCH',
        data: [
          {
            taxReceiptId: 'tax-receipt-789',
            taxReceiptNumber: 1003,
            donationIds: ['donation-4'],
            taxReceiptType: 'INDIVIDUAL',
          },
        ],
      })

      await expect(taxReceiptConsumer.process(mockJob)).resolves.toBeUndefined()
    })
  })

  describe('onFailed', () => {
    it('should handle job failure correctly', async () => {
      const mockJob = {
        id: 'job-456',
        data: {
          taxReceiptId: 'tax-receipt-failed',
          taxReceiptNumber: 1004,
          donationIds: ['donation-5'],
          taxReceiptType: 'INDIVIDUAL',
        },
      } as Job

      const mockError = new Error('Tax receipt generation failed')

      taxReceiptServiceMock.handleTaxReceiptGenerationFailure.mockResolvedValueOnce()

      await taxReceiptConsumer.onFailed(mockJob, mockError)
      expect(taxReceiptServiceMock.handleTaxReceiptGenerationFailure).toHaveBeenCalledWith({
        jobId: 'job-456',
        taxReceiptId: 'tax-receipt-failed',
      })
    })
  })
})
