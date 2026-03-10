import { Logger } from '@nestjs/common'
import { Processor, OnWorkerEvent, WorkerHost } from '@nestjs/bullmq'

import { TaxReceiptService } from '@/domain'

import { TAX_RECEIPT_QUEUE } from '@/infrastructure'

import type { TaxReceiptQueueJob } from '@/infrastructure/types'
import type { Job } from 'bullmq'

@Processor(TAX_RECEIPT_QUEUE)
export class TaxReceiptConsumer extends WorkerHost {
  private readonly logger = new Logger(TaxReceiptConsumer.name)

  constructor(private readonly taxReceiptService: TaxReceiptService) {
    super()
  }

  async process(job: TaxReceiptQueueJob) {
    switch (job.name) {
      case 'GENERATE':
        await this.taxReceiptService.processTaxReceiptGenerationJob({ ...job.data, jobId: job.id! })
        break
      case 'GENERATE_BATCH':
        for (const data of job.data) {
          await this.taxReceiptService.processTaxReceiptGenerationJob({ ...data, jobId: job.id! })
        }
        break
      case 'RETRY':
        await this.taxReceiptService.processTaxReceiptGenerationJob({ ...job.data, jobId: job.id! })
        break
      case 'CANCEL':
        await this.taxReceiptService.processTaxReceiptCancellationJob({
          ...job.data,
          jobId: job.id!,
        })
        break
    }
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job, error: Error) {
    this.logger.error(
      {
        code: 'TAX_RECEIPT_JOB_FAILED',
        jobId: job.id,
        jobData: job.data,
        errorStack: error.stack,
      },
      `Tax Receipt job ${job.id} failed with error: ${error.message}`,
    )

    await this.taxReceiptService.handleTaxReceiptGenerationFailure({
      jobId: job.id!,
      taxReceiptId: job.data.taxReceiptId,
    })
  }
}
