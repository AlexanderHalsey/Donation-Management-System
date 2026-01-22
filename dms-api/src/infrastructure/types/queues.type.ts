import type { Queue as BullMQQueue, Job as BullMQJob } from 'bullmq'
import type { TaxReceiptType } from '@shared/models'

export type TaxReceiptGenerationQueueData = {
  taxReceiptId: string
  taxReceiptNumber: number
  donationIds: string[]
  taxReceiptType: TaxReceiptType
}
export type TaxReceiptCancellationQueueData = {
  fileId: string
  storageKey: string
}

// Discriminated union types for each queue's jobs
export type DonorSyncQueueJob = BullMQJob<{ donorSyncEventIds: string[] }, void, 'PROCESS'>

export type TaxReceiptQueueJob =
  | BullMQJob<TaxReceiptGenerationQueueData, void, 'GENERATE'>
  | BullMQJob<TaxReceiptGenerationQueueData[], void, 'GENERATE_BATCH'>
  | BullMQJob<TaxReceiptGenerationQueueData, void, 'RETRY'>
  | BullMQJob<TaxReceiptCancellationQueueData, void, 'CANCEL'>

export type EmailQueueJob = BullMQJob<string, void, 'SEND_RECEIPT'>

// Queue name mapping
export type QueueJobMapping = {
  DONOR_SYNC: DonorSyncQueueJob
  TAX_RECEIPT: TaxReceiptQueueJob
  EMAIL: EmailQueueJob
}

export type QueueName = keyof QueueJobMapping
type QueueJob<T extends QueueName> = QueueJobMapping[T]
type QueueJobName<T extends QueueName> = QueueJobMapping[T]['name']
type QueueJobData<T extends QueueName, J extends QueueJobName<T>> = Extract<
  QueueJobMapping[T],
  { name: J }
>['data']
type Queue<T extends QueueName> = BullMQQueue<QueueJob<T>['data'], void, QueueJob<T>['name']>

export type DonorSyncQueue = Queue<'DONOR_SYNC'>
export type TaxReceiptQueue = Queue<'TAX_RECEIPT'>
export type EmailQueue = Queue<'EMAIL'>

export type TaxReceiptQueueJobName = QueueJobName<'TAX_RECEIPT'>
export type TaxReceiptQueueJobData<T extends TaxReceiptQueueJobName> = QueueJobData<
  'TAX_RECEIPT',
  T
>
