import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { mockDeep, mockReset } from 'jest-mock-extended'

import { DonorSyncConsumer } from '../consumers/donorSync.consumer'
import { DonorService } from '../../domain/services/donor.service'
import { DonorSyncEventService } from '../../domain/services/donorSyncEvent.service'
import { PrismaService } from '@/infrastructure'

import type { DonorSyncQueueJob } from '@/infrastructure/types'
import type { DonorSyncEvent } from '@generated/prisma/client'

describe('DonorSyncConsumer', () => {
  const prismaServiceMock = mockDeep<PrismaService>()
  const donorServiceMock = mockDeep<DonorService>()
  const donorSyncEventServiceMock = mockDeep<DonorSyncEventService>()
  let donorSyncConsumer: DonorSyncConsumer

  beforeEach(async () => {
    jest.resetAllMocks()
    mockReset(prismaServiceMock)
    mockReset(donorServiceMock)
    mockReset(donorSyncEventServiceMock)

    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        DonorSyncConsumer,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
        {
          provide: DonorService,
          useValue: donorServiceMock,
        },
        {
          provide: DonorSyncEventService,
          useValue: donorSyncEventServiceMock,
        },
      ],
    }).compile()

    app.useLogger(false)

    donorSyncConsumer = app.get<DonorSyncConsumer>(DonorSyncConsumer)
  })

  describe('process', () => {
    it('should process CREATE event successfully', async () => {
      const donorSyncEventIds = ['event-1', 'event-2']
      const mockJob = {
        data: { donorSyncEventIds },
      } as DonorSyncQueueJob

      const mockEvents = [
        {
          ...mockDeep<DonorSyncEvent>(),
          id: 'event-1',
          eventType: 'CREATE' as const,
          externalId: 123,
          payload: {
            externalId: 123,
            civility: 'Mr',
            lastName: 'Doe',
            firstName: 'John',
            email: 'john.doe@example.com',
            isFacilitator: false,
          },
        },
        {
          ...mockDeep<DonorSyncEvent>(),
          id: 'event-2',
          eventType: 'CREATE' as const,
          externalId: 456,
          payload: {
            externalId: 456,
            civility: 'Ms',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            isFacilitator: false,
          },
        },
      ]

      donorSyncEventServiceMock.markAsProcessingJob.mockResolvedValueOnce()
      prismaServiceMock.donorSyncEvent.findMany.mockResolvedValueOnce(mockEvents)
      donorServiceMock.synchronizeDonors.mockResolvedValueOnce()
      donorSyncEventServiceMock.markAsCompletedJob.mockResolvedValueOnce()

      await donorSyncConsumer.process(mockJob)

      expect(donorSyncEventServiceMock.markAsProcessingJob).toHaveBeenCalledWith({
        donorSyncEventIds,
      })
      expect(prismaServiceMock.donorSyncEvent.findMany).toHaveBeenCalledWith({
        where: { id: { in: donorSyncEventIds } },
      })
      expect(donorServiceMock.synchronizeDonors).toHaveBeenCalledWith({
        toUpsert: [
          {
            externalId: 123,
            civility: 'Mr',
            lastName: 'Doe',
            firstName: 'John',
            email: 'john.doe@example.com',
            isDisabled: false,
            isFacilitator: false,
          },
          {
            externalId: 456,
            civility: 'Ms',
            lastName: 'Smith',
            firstName: 'Jane',
            email: 'jane.smith@example.com',
            isDisabled: false,
            isFacilitator: false,
          },
        ],
      })
      expect(donorSyncEventServiceMock.markAsCompletedJob).toHaveBeenCalledWith({
        donorSyncEventIds,
      })
    })

    it('should process DELETE event with isDisabled set to true', async () => {
      const donorSyncEventIds = ['event-1']
      const mockJob = {
        data: { donorSyncEventIds },
      } as DonorSyncQueueJob

      const mockEvents = [
        {
          ...mockDeep<DonorSyncEvent>(),
          id: 'event-1',
          eventType: 'DELETE' as const,
          externalId: 123,
          payload: {
            externalId: 123,
            civility: 'Mr',
            name: 'Doe',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            isFacilitator: false,
          },
        },
      ]

      donorSyncEventServiceMock.markAsProcessingJob.mockResolvedValueOnce()
      prismaServiceMock.donorSyncEvent.findMany.mockResolvedValueOnce(mockEvents)
      donorServiceMock.synchronizeDonors.mockResolvedValueOnce()
      donorSyncEventServiceMock.markAsCompletedJob.mockResolvedValueOnce()

      await donorSyncConsumer.process(mockJob)

      expect(donorServiceMock.synchronizeDonors).toHaveBeenCalledWith({
        toUpsert: [
          {
            externalId: 123,
            civility: 'Mr',
            lastName: 'Doe',
            firstName: 'John',
            email: 'john.doe@example.com',
            isDisabled: true,
            isFacilitator: false,
          },
        ],
      })
    })

    it('should process MERGE event correctly', async () => {
      const donorSyncEventIds = ['event-1']
      const mockJob = {
        data: { donorSyncEventIds },
      } as DonorSyncQueueJob

      const mockEvents = [
        {
          ...mockDeep<DonorSyncEvent>(),
          id: 'event-1',
          eventType: 'MERGE' as const,
          externalId: 123,
          payload: [
            {
              objectType: 'PERSON' as const,
              externalId: 123,
              civility: 'Mr',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john.doe@example.com',
              mergeStatus: 'MERGED' as const,
              isFacilitator: false,
            },
            {
              objectType: 'PERSON' as const,
              externalId: 456,
              civility: 'Mr',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john.doe.old@example.com',
              mergeStatus: 'DELETED' as const,
              isFacilitator: false,
            },
          ],
        },
      ]

      donorSyncEventServiceMock.markAsProcessingJob.mockResolvedValueOnce()
      prismaServiceMock.donorSyncEvent.findMany.mockResolvedValueOnce(mockEvents)
      donorServiceMock.synchronizeDonors.mockResolvedValueOnce()
      donorSyncEventServiceMock.markAsCompletedJob.mockResolvedValueOnce()

      await donorSyncConsumer.process(mockJob)

      expect(donorServiceMock.synchronizeDonors).toHaveBeenCalledWith({
        toUpsert: [
          {
            externalId: 123,
            civility: 'Mr',
            lastName: 'Doe',
            firstName: 'John',
            email: 'john.doe@example.com',
            isDisabled: false, // merged
            isFacilitator: false,
          },
          {
            externalId: 456,
            civility: 'Mr',
            lastName: 'Doe',
            firstName: 'John',
            email: 'john.doe.old@example.com',
            isDisabled: true, // deleted
            isFacilitator: false,
          },
        ],
      })
    })

    it('should throw BadRequestException when donor sync events are not found', async () => {
      const donorSyncEventIds = ['event-1', 'event-2']
      const mockJob = {
        data: { donorSyncEventIds },
      } as DonorSyncQueueJob

      const mockEvents = [
        {
          ...mockDeep<DonorSyncEvent>(),
          id: 'event-1',
        },
      ] // Only one event found instead of two

      prismaServiceMock.donorSyncEvent.findMany.mockResolvedValue(mockEvents)

      await expect(donorSyncConsumer.process(mockJob)).rejects.toThrow(
        'Some donor sync events not found, cannot process job. Ids to process: event-1, event-2. Ids found: event-1',
      )

      expect(donorSyncEventServiceMock.markAsProcessingJob).toHaveBeenCalledWith({
        donorSyncEventIds,
      })
      expect(prismaServiceMock.donorSyncEvent.findMany).toHaveBeenCalledWith({
        where: { id: { in: donorSyncEventIds } },
      })
      expect(donorServiceMock.synchronizeDonors).not.toHaveBeenCalled()
      expect(donorSyncEventServiceMock.markAsCompletedJob).not.toHaveBeenCalled()
    })
  })

  describe('onFailed', () => {
    it('should handle job failure correctly', async () => {
      const mockJob = {
        id: 'job-123',
        data: { donorSyncEventIds: ['event-1', 'event-2'] },
      } as DonorSyncQueueJob

      const mockError = new Error('Test error message')

      donorSyncEventServiceMock.markAsFailedJob.mockResolvedValueOnce()

      await donorSyncConsumer.onFailed(mockJob, mockError)

      expect(donorSyncEventServiceMock.markAsFailedJob).toHaveBeenCalledWith({
        jobId: 'job-123',
        donorSyncEventIds: ['event-1', 'event-2'],
        errorMessage: 'Test error message',
      })
    })
  })
})
