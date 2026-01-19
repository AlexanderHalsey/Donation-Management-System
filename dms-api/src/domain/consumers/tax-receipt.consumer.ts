import { Processor, OnWorkerEvent, WorkerHost } from '@nestjs/bullmq'

import { TaxReceiptService } from '../services/tax-receipt.service'

import { TAX_RECEIPT_QUEUE } from '@/infrastructure'

import type { TaxReceiptQueueJob } from '@/infrastructure/types'
import type { Job } from 'bullmq'

@Processor(TAX_RECEIPT_QUEUE)
export class TaxReceiptConsumer extends WorkerHost {
  constructor(private readonly taxReceiptService: TaxReceiptService) {
    super()
  }

  async process(job: TaxReceiptQueueJob) {
    switch (job.name) {
      case 'GENERATE':
        await this.taxReceiptService.processTaxReceiptGeneration(job.data)
        break
      case 'GENERATE_BATCH':
        break
      case 'RETRY':
        await this.taxReceiptService.processTaxReceiptGeneration(job.data)
        break
      case 'CANCEL':
        await this.taxReceiptService.processTaxReceiptCancellation(job.data)
        break
    }
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job, error: Error) {
    console.error(`Job ${job.id} failed with error:`, error.message)
    console.error('Job data:', JSON.stringify(job.data, null, 2))
    console.error('Error stack:', error.stack)

    await this.taxReceiptService.handleTaxReceiptGenerationFailure(job.data.taxReceiptId, error)
  }
}
