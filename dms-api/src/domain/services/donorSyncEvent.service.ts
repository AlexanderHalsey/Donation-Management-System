import { BadRequestException, Injectable } from '@nestjs/common'

import { chunk } from 'es-toolkit'
import { subDays } from 'date-fns'

import { BullMQService, PrismaService } from '@/infrastructure'

import { DonorSyncEventRequestSchema } from '../schemas'

import { DonorSyncEventCreateManyInput } from '@generated/prisma/models'

@Injectable()
export class DonorSyncEventService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bullMQService: BullMQService,
  ) {}

  async addDonorSyncEvents(body: unknown): Promise<void> {
    const request = DonorSyncEventRequestSchema.safeParse(body)

    if (!request.success) {
      throw new BadRequestException(`Invalid Donor Sync Event request: ${request.error.message}`)
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

    if (donorSyncEventIds.length > 0) {
      try {
        await this.bullMQService.addDonorSyncJob({ donorSyncEventIds })
      } catch (error) {
        await this.markAsFailed(donorSyncEventIds, `Failed to schedule sync job: ${error.message}`)
        throw error
      }
    }
  }

  async markAsProcessing(donorSyncEventIds: string[]): Promise<void> {
    await this.prisma.donorSyncEvent.updateMany({
      where: { id: { in: donorSyncEventIds } },
      data: { status: 'PROCESSING' },
    })
  }

  async markAsCompleted(donorSyncEventIds: string[]): Promise<void> {
    await this.prisma.donorSyncEvent.updateMany({
      where: { id: { in: donorSyncEventIds } },
      data: { status: 'COMPLETED', processedAt: new Date(), errorMessage: null },
    })
  }

  async markAsFailed(donorSyncEventIds: string[], errorMessage: string): Promise<void> {
    await this.prisma.donorSyncEvent.updateMany({
      where: { id: { in: donorSyncEventIds } },
      data: {
        status: 'FAILED',
        errorMessage,
        processedAt: new Date(),
        retryCount: { increment: 1 },
      },
    })
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
  }
}
