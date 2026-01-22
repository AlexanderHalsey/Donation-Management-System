import { BadRequestException } from '@nestjs/common'
import { Processor, OnWorkerEvent, WorkerHost } from '@nestjs/bullmq'

import { omit } from 'es-toolkit'

import { DONOR_SYNC_QUEUE, PrismaService } from '@/infrastructure'

import { DonorService, DonorSyncEventService } from '@/domain'

import { TransformedMergedProfileSchema, TransformedProfileSchema } from '@/domain/schemas'

import type { DonorSyncQueueJob } from '@/infrastructure/types'
import type { DonorCreateManyInput } from '@generated/prisma/models'

@Processor(DONOR_SYNC_QUEUE)
export class DonorSyncConsumer extends WorkerHost {
  constructor(
    private readonly prisma: PrismaService,
    private readonly donorService: DonorService,
    private readonly donorSyncEventService: DonorSyncEventService,
  ) {
    super()
  }

  async process({ data: { donorSyncEventIds } }: DonorSyncQueueJob) {
    await this.donorSyncEventService.markAsProcessing(donorSyncEventIds)

    const donorSyncEvents = await this.prisma.donorSyncEvent.findMany({
      where: { id: { in: donorSyncEventIds } },
    })

    if (donorSyncEvents.length !== donorSyncEventIds.length) {
      throw new BadRequestException(
        `Some donor sync events not found, cannot process job. Ids to process: ${donorSyncEventIds.join(', ')}. Ids found: ${donorSyncEvents.map((e) => e.id).join(', ')}`,
      )
    }

    const toUpsert: DonorCreateManyInput[] = []
    for (const donorSyncEvent of donorSyncEvents) {
      if (donorSyncEvent.eventType === 'MERGE') {
        const payload = TransformedMergedProfileSchema.parse(donorSyncEvent.payload)
        for (const profile of payload) {
          toUpsert.push({
            ...omit(profile, ['mergeStatus']),
            isDisabled: profile.mergeStatus !== 'MERGED',
          })
        }
      } else {
        toUpsert.push({
          ...TransformedProfileSchema.parse(donorSyncEvent.payload),
          isDisabled: donorSyncEvent.eventType === 'DELETE',
        })
      }
    }

    await this.donorService.synchronizeDonors({ toUpsert })
    await this.donorSyncEventService.markAsCompleted(donorSyncEventIds)
  }

  @OnWorkerEvent('failed')
  async onFailed(job: DonorSyncQueueJob, error: Error) {
    console.error(`Job ${job.id} failed with error:`, error.message)
    console.error('Job data:', JSON.stringify(job.data, null, 2))
    console.error('Error stack:', error.stack)

    await this.donorSyncEventService.markAsFailed(job.data.donorSyncEventIds, error.message)
  }
}
