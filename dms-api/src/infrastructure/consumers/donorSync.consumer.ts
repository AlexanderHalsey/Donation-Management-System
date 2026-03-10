import { Logger } from '@nestjs/common'
import { Processor, OnWorkerEvent, WorkerHost } from '@nestjs/bullmq'

import { omit } from 'es-toolkit'

import { DONOR_SYNC_QUEUE, PrismaService } from '@/infrastructure'

import { DonorService, DonorSyncEventService } from '@/domain'

import { TransformedMergedProfileSchema, TransformedProfileSchema } from '@/domain/schemas'

import type { DonorSyncQueueJob } from '@/infrastructure/types'
import type { DonorSyncProfile } from '@/domain/types'

@Processor(DONOR_SYNC_QUEUE)
export class DonorSyncConsumer extends WorkerHost {
  private readonly logger = new Logger(DonorSyncConsumer.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly donorService: DonorService,
    private readonly donorSyncEventService: DonorSyncEventService,
  ) {
    super()
  }

  async process({ id, data: { donorSyncEventIds } }: DonorSyncQueueJob) {
    await this.donorSyncEventService.markAsProcessingJob({ jobId: id!, donorSyncEventIds })

    const donorSyncEvents = await this.prisma.donorSyncEvent.findMany({
      where: { id: { in: donorSyncEventIds } },
    })

    if (donorSyncEvents.length !== donorSyncEventIds.length) {
      throw new Error(
        `DONOR_SYNC_EVENTS_NOT_FOUND: Some donor sync events not found, cannot process job. Ids to process: ${donorSyncEventIds.join(', ')}. Ids found: ${donorSyncEvents.map((e) => e.id).join(', ')}`,
      )
    }

    const toUpsert: DonorSyncProfile[] = []
    const foreignTablesToUpdate: { oldDonorExternalId: number; newDonorExternalId: number }[] = []
    for (const donorSyncEvent of donorSyncEvents) {
      if (donorSyncEvent.eventType === 'MERGE') {
        const payload = TransformedMergedProfileSchema.parse(donorSyncEvent.payload)

        const mergedProfile = payload.find((p) => p.mergeStatus === 'MERGED')!
        const deletedProfile = payload.find((p) => p.mergeStatus === 'DELETED')!

        toUpsert.push({ ...omit(mergedProfile, ['mergeStatus']) })
        toUpsert.push({ ...omit(deletedProfile, ['mergeStatus']), isDisabled: true })

        foreignTablesToUpdate.push({
          oldDonorExternalId: deletedProfile.externalId,
          newDonorExternalId: mergedProfile.externalId,
        })
      } else {
        toUpsert.push({
          ...TransformedProfileSchema.parse(donorSyncEvent.payload),
          isDisabled: donorSyncEvent.eventType === 'DELETE',
        })
      }
    }

    await this.donorService.synchronizeDonors({ toUpsert, foreignTablesToUpdate })
    await this.donorSyncEventService.markAsCompletedJob({ jobId: id!, donorSyncEventIds })
  }

  @OnWorkerEvent('failed')
  async onFailed(job: DonorSyncQueueJob, error: Error) {
    this.logger.error(
      {
        code: 'DONOR_SYNC_JOB_FAILED',
        jobId: job.id,
        jobData: job.data,
        errorStack: error.stack,
      },
      `Donor Sync job ${job.id} failed with error: ${error.message}`,
    )

    await this.donorSyncEventService.markAsFailedJob({
      jobId: job.id!,
      donorSyncEventIds: job.data.donorSyncEventIds,
      errorMessage: error.message,
    })
  }
}
