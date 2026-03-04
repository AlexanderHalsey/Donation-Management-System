import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common'

import { chunk } from 'es-toolkit'
import { subDays } from 'date-fns'

import { BullMQService, PrismaService } from '@/infrastructure'

import { DonorSyncEventRequestSchema } from '../schemas'

import { DonorSyncEventCreateManyInput } from '@generated/prisma/models'

@Injectable()
export class DonorSyncEventService {
  private readonly logger = new Logger(DonorSyncEventService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly bullMQService: BullMQService,
  ) {}

  async addDonorSyncEvents(body: unknown): Promise<void> {
    const request = DonorSyncEventRequestSchema.safeParse(body)

    if (!request.success) {
      throw new InternalServerErrorException({
        code: 'INVALID_DONOR_SYNC_EVENT_REQUEST',
        message: `Invalid Donor Sync Event request: ${request.error.message}`,
      })
    }

    const notifications: DonorSyncEventCreateManyInput[] = request.data.notifications.map(
      (notification) => {
        let externalId: number
        if (notification.action === 'MERGE') {
          externalId =
            notification.payload[0].mergeStatus === 'MERGED'
              ? notification.payload[0].externalId
              : notification.payload[1].externalId
        } else {
          externalId = notification.payload.externalId
        }

        return {
          requestId: request.data.id,
          attempt: request.data.attempt,
          eventType: notification.action,
          externalId: externalId,
          payload: notification.payload,
          status: 'PENDING' as const,
        }
      },
    )

    const donorSyncEventIds: string[] = []

    const batchSize = 1000
    for (const chunkedNotifications of chunk(notifications, batchSize)) {
      const createdChunk = await this.prisma.donorSyncEvent.createManyAndReturn({
        select: { id: true },
        data: chunkedNotifications,
        skipDuplicates: true,
      })
      donorSyncEventIds.push(...createdChunk.map((event) => event.id))
    }

    this.logger.log(
      `Created ${donorSyncEventIds.length} donor sync events for request ${request.data.id}`,
    )

    this.logger.log(`Scheduling sync job for ${donorSyncEventIds.length} donor sync events`)

    if (donorSyncEventIds.length > 0) {
      try {
        await this.bullMQService.addDonorSyncJob({ donorSyncEventIds })
      } catch (error) {
        await this.markAsFailedJob({
          donorSyncEventIds,
          errorMessage: `Failed to schedule sync job: ${error.message}`,
        })
        throw new InternalServerErrorException({
          code: 'DONOR_SYNC_JOB_SCHEDULING_FAILED',
          message: `Failed to schedule donor sync job for ${donorSyncEventIds.length}`,
          stack: error.stack,
        })
      }
    }

    // a send all event can also indicate donors in our system that need disabling
    if (request.data.notifications.length > 1) {
      this.prisma.donor.updateMany({
        where: {
          externalId: {
            notIn: request.data.notifications.map((notification) => {
              if (notification.action === 'MERGE') {
                return notification.payload.find((p) => p.mergeStatus === 'MERGED')!.externalId
              } else {
                return notification.payload.externalId
              }
            }),
          },
        },
        data: { isDisabled: true },
      })
    }
  }

  async markAsProcessingJob({
    jobId,
    donorSyncEventIds,
  }: {
    jobId: string
    donorSyncEventIds: string[]
  }): Promise<void> {
    await this.prisma.donorSyncEvent.updateMany({
      where: { id: { in: donorSyncEventIds } },
      data: { status: 'PROCESSING' },
    })

    this.logger.log(
      `Marked ${donorSyncEventIds.length} donor sync events as PROCESSING for job ${jobId}`,
    )
  }

  async markAsCompletedJob({
    jobId,
    donorSyncEventIds,
  }: {
    jobId: string
    donorSyncEventIds: string[]
  }): Promise<void> {
    await this.prisma.donorSyncEvent.updateMany({
      where: { id: { in: donorSyncEventIds } },
      data: { status: 'COMPLETED', processedAt: new Date(), errorMessage: null },
    })

    this.logger.log(
      `Marked ${donorSyncEventIds.length} donor sync events as COMPLETED for job ${jobId}`,
    )
  }

  async markAsFailedJob({
    jobId,
    donorSyncEventIds,
    errorMessage,
  }: {
    jobId?: string
    donorSyncEventIds: string[]
    errorMessage: string
  }): Promise<void> {
    await this.prisma.donorSyncEvent.updateMany({
      where: { id: { in: donorSyncEventIds } },
      data: {
        status: 'FAILED',
        errorMessage,
        processedAt: new Date(),
        retryCount: { increment: 1 },
      },
    })

    this.logger.warn(
      `Marked ${donorSyncEventIds.length} donor sync events as FAILED${jobId ? ` for job ${jobId}` : ''} with error: ${errorMessage}`,
    )
  }

  async cleanupOldEvents(): Promise<void> {
    const retentionPeriodDaysCompletedEvents = 30
    const retentionPeriodDaysFailedEvents = 90
    const now = new Date()

    await this.prisma.donorSyncEvent.deleteMany({
      where: {
        OR: [
          {
            status: 'COMPLETED',
            processedAt: { lt: subDays(now, retentionPeriodDaysCompletedEvents) },
          },
          {
            status: 'FAILED',
            processedAt: { lt: subDays(now, retentionPeriodDaysFailedEvents) },
          },
        ],
      },
    })

    this.logger.log('Cleaned up old donor sync events')
  }
}
