import { Injectable } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'

import type { JobsOptions } from 'bullmq'
import type {
  DonorSyncQueue,
  EmailQueue,
  QueueJobMapping,
  QueueName,
  TaxReceiptQueue,
  TaxReceiptQueueJobData,
  TaxReceiptQueueJobName,
} from '../types'

export const DONOR_SYNC_QUEUE = 'DONOR' satisfies QueueName
export const TAX_RECEIPT_QUEUE = 'TAX_RECEIPT' satisfies QueueName
export const EMAIL_QUEUE = 'EMAIL' satisfies QueueName

/**
 * BULLMQ JOB CONFIGURATIONS FOR DMS IVY v2
 */
export const QUEUE_CONFIGS = {
  /**
   * Donor Sync Queue Configuration
   *
   * Background sync with external user source that updates donor database.
   * Characteristics: Background process, external API, can handle delays
   * Error patterns: Network timeouts, API rate limits, external service downtime
   *
   * Strategy: High attempts (5) with exponential backoff for API rate limits,
   * low priority as it's a background process, moderate history for monitoring.
   */
  DONOR: {
    SYNC: {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 10000,
      },
      delay: 5000,
      removeOnComplete: 20,
      removeOnFail: 100,
      priority: 1,
    },
  },

  /**
   * Tax Receipt Queue Configurations
   *
   * Generate individual/batch tax receipts - user-facing and business-critical.
   * Characteristics: User-initiated, business-critical, CPU/memory intensive
   * Error patterns: PDF generation failures, database locks, file system issues
   *
   * Strategy: Moderate attempts (3) with fixed backoff for predictable failures,
   * high priority for user-facing operations, extensive history for audit/compliance.
   */
  TAX_RECEIPT: {
    /**
     * Individual receipt generation - highest priority user-facing operation
     */
    GENERATE: {
      attempts: 3,
      backoff: {
        type: 'fixed',
        delay: 3000,
      },
      removeOnComplete: 100,
      removeOnFail: 200,
      priority: 10,
    },

    /**
     * Batch receipt generation - slightly lower priority than individual
     */
    GENERATE_BATCH: {
      attempts: 3,
      backoff: {
        type: 'fixed',
        delay: 5000,
      },
      removeOnComplete: 50,
      removeOnFail: 100,
      priority: 8,
    },

    /**
     * Receipt cancellation - high priority user action, should be quick
     */
    CANCEL: {
      attempts: 2,
      backoff: {
        type: 'fixed',
        delay: 1000,
      },
      removeOnComplete: 25,
      removeOnFail: 50,
      priority: 9,
    },

    /**
     * Manual retry from UI - already failed once, highest priority for user satisfaction
     */
    RETRY: {
      attempts: 1,
      priority: 15,
      removeOnComplete: 100,
      removeOnFail: 200,
    },
  },

  /**
   * Email Queue Configurations
   *
   * Send receipt emails - user-facing but can tolerate delays.
   * Characteristics: User-facing, depends on receipt generation, external SMTP
   * Error patterns: SMTP failures, email provider limits, bounce handling
   *
   * Strategy: High attempts (5) with exponential backoff for SMTP rate limits,
   * medium priority as users expect emails but can tolerate delays,
   * minimal history as emails are less critical for audit.
   */
  EMAIL: {
    /**
     * Send receipt email - medium priority, robust retry strategy for SMTP reliability
     */
    SEND_RECEIPT: {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: 10,
      removeOnFail: 100,
      priority: 5,
    },
  },
} as const satisfies {
  [K in keyof QueueJobMapping]: {
    [J in QueueJobMapping[K]['name']]: JobsOptions
  }
}

@Injectable()
export class BullMQService {
  constructor(
    @InjectQueue(DONOR_SYNC_QUEUE) private readonly donorSyncQueue: DonorSyncQueue,
    @InjectQueue(TAX_RECEIPT_QUEUE) private readonly taxReceiptQueue: TaxReceiptQueue,
    @InjectQueue(EMAIL_QUEUE) private readonly emailQueue: EmailQueue,
  ) {}

  async addDonorSyncJob(data: string) {
    return await this.donorSyncQueue.add('SYNC', data, QUEUE_CONFIGS.DONOR.SYNC)
  }

  async addTaxReceiptJob<T extends TaxReceiptQueueJobName>(
    jobName: T,
    data: TaxReceiptQueueJobData<T>,
  ) {
    return await this.taxReceiptQueue.add(jobName, data, QUEUE_CONFIGS.TAX_RECEIPT[jobName])
  }

  async addEmailJob(data: string) {
    return await this.emailQueue.add('SEND_RECEIPT', data, QUEUE_CONFIGS.EMAIL.SEND_RECEIPT)
  }

  async getStatus() {
    const issues: string[] = []
    let stats: {
      DONOR: Record<string, number>
      TAX_RECEIPT: Record<string, number>
      EMAIL: Record<string, number>
    } | null = null

    try {
      const [donorSyncCounts, taxReceiptCounts, emailCounts] = await Promise.all([
        this.donorSyncQueue.getJobCounts(),
        this.taxReceiptQueue.getJobCounts(),
        this.emailQueue.getJobCounts(),
      ])

      stats = {
        DONOR: donorSyncCounts,
        TAX_RECEIPT: taxReceiptCounts,
        EMAIL: emailCounts,
      }
    } catch (error: unknown) {
      issues.push(
        `Queue connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }

    return {
      healthy: issues.length === 0,
      issues,
      stats,
    }
  }
}
