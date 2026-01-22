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

    taxReceiptConsumer = app.get<TaxReceiptConsumer>(TaxReceiptConsumer)
  })

  describe('process', () => {
    it('should process GENERATE job successfully', async () => {
      const mockJob = mockDeep<TaxReceiptQueueJob>({
        name: 'GENERATE',
        data: {
          taxReceiptId: 'tax-receipt-123',
          taxReceiptNumber: 1001,
          donationIds: ['donation-1', 'donation-2'],
          taxReceiptType: 'INDIVIDUAL',
        },
      })

      taxReceiptServiceMock.processTaxReceiptGeneration.mockResolvedValueOnce()

      await taxReceiptConsumer.process(mockJob)

      expect(taxReceiptServiceMock.processTaxReceiptGeneration).toHaveBeenCalledWith(mockJob.data)
      expect(taxReceiptServiceMock.processTaxReceiptGeneration).toHaveBeenCalledTimes(1)
    })

    it('should process RETRY job successfully', async () => {
      const mockJob = mockDeep<TaxReceiptQueueJob>({
        name: 'RETRY',
        data: {
          taxReceiptId: 'tax-receipt-456',
          taxReceiptNumber: 1002,
          donationIds: ['donation-3'],
          taxReceiptType: 'ANNUAL',
        },
      })

      taxReceiptServiceMock.processTaxReceiptGeneration.mockResolvedValueOnce()

      await taxReceiptConsumer.process(mockJob)

      expect(taxReceiptServiceMock.processTaxReceiptGeneration).toHaveBeenCalledWith(mockJob.data)
      expect(taxReceiptServiceMock.processTaxReceiptGeneration).toHaveBeenCalledTimes(1)
    })

    it('should process CANCEL job successfully', async () => {
      const mockJob = mockDeep<TaxReceiptQueueJob>({
        name: 'CANCEL',
        data: {
          fileId: 'file-123',
          storageKey: 'tax-receipts/file-123.pdf',
        },
      })

      taxReceiptServiceMock.processTaxReceiptCancellation.mockResolvedValueOnce()

      await taxReceiptConsumer.process(mockJob)

      expect(taxReceiptServiceMock.processTaxReceiptCancellation).toHaveBeenCalledWith(mockJob.data)
      expect(taxReceiptServiceMock.processTaxReceiptCancellation).toHaveBeenCalledTimes(1)
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

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      taxReceiptServiceMock.handleTaxReceiptGenerationFailure.mockResolvedValueOnce()

      await taxReceiptConsumer.onFailed(mockJob, mockError)

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Job job-456 failed with error:',
        'Tax receipt generation failed',
      )
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Job data:',
        JSON.stringify(mockJob.data, null, 2),
      )
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error stack:', mockError.stack)
      expect(taxReceiptServiceMock.handleTaxReceiptGenerationFailure).toHaveBeenCalledWith(
        'tax-receipt-failed',
        mockError,
      )

      consoleErrorSpy.mockRestore()
    })
  })
})
