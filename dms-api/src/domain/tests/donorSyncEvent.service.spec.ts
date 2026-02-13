import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { mockDeep, mockReset } from 'jest-mock-extended'

import { DonorSyncEventService } from '../services/donorSyncEvent.service'
import { BullMQService, PrismaService } from '@/infrastructure'
import { DonorSyncEvent } from '@generated/prisma/client'

describe('DonorSyncEventService', () => {
  const prismaServiceMock = mockDeep<PrismaService>()
  const bullMQServiceMock = mockDeep<BullMQService>()
  let donorSyncEventService: DonorSyncEventService

  beforeEach(async () => {
    jest.resetAllMocks()
    mockReset(prismaServiceMock)
    mockReset(bullMQServiceMock)

    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        DonorSyncEventService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
        {
          provide: BullMQService,
          useValue: bullMQServiceMock,
        },
      ],
    }).compile()

    app.useLogger(false)

    donorSyncEventService = app.get<DonorSyncEventService>(DonorSyncEventService)
  })

  describe('addDonorSyncEvents', () => {
    it('should create events and queue job for valid request', async () => {
      const mockRequest = {
        id: 'request-123',
        attempt: 1,
        notifications: [
          {
            action: 'profile.create',
            payload: {
              objectType: 'PERSON',
              id: 123,
              salutation: 'Mr',
              name: 'Doe',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john.doe@example.com',
              preferredEmail: 'PRIVATE',
              preferredPhoneNumber: 'PRIVATE',
              privatePhoneNumber: '',
              alternativePhoneNumber: '',
            },
          },
          {
            action: 'profile.delete',
            payload: {
              objectType: 'PERSON',
              id: 456,
              salutation: 'Ms',
              name: 'Smith',
              firstName: 'Jane',
              lastName: 'Smith',
              email: 'jane.smith@example.com',
              preferredEmail: 'PRIVATE',
              preferredPhoneNumber: 'PRIVATE',
              privatePhoneNumber: '',
              alternativePhoneNumber: '',
            },
          },
        ],
      }

      const mockCreatedEvents = [
        mockDeep<DonorSyncEvent>({ id: 'event-1', eventType: 'CREATE' }),
        mockDeep<DonorSyncEvent>({ id: 'event-2', eventType: 'DELETE' }),
      ]

      prismaServiceMock.donorSyncEvent.createManyAndReturn.mockResolvedValueOnce(mockCreatedEvents)
      bullMQServiceMock.addDonorSyncJob.mockResolvedValueOnce()

      await donorSyncEventService.addDonorSyncEvents(mockRequest)

      expect(prismaServiceMock.donorSyncEvent.createManyAndReturn).toHaveBeenCalledWith({
        select: { id: true },
        data: [
          {
            requestId: 'request-123',
            attempt: 1,
            eventType: 'CREATE',
            externalId: 123,
            payload: {
              externalId: 123,
              civility: 'Mr',
              lastName: 'Doe',
              email: 'john.doe@example.com',
              firstName: 'John',
              phoneNumber: undefined,
              isFacilitator: false,
              careOf: undefined,
              streetAddress1: undefined,
              streetAddress2: undefined,
              postalCode: undefined,
              city: undefined,
              state: undefined,
              country: undefined,
            },
            status: 'PENDING',
          },
          {
            requestId: 'request-123',
            attempt: 1,
            eventType: 'DELETE',
            externalId: 456,
            payload: {
              externalId: 456,
              civility: 'Ms',
              lastName: 'Smith',
              email: 'jane.smith@example.com',
              firstName: 'Jane',
              phoneNumber: undefined,
              isFacilitator: false,
              careOf: undefined,
              streetAddress1: undefined,
              streetAddress2: undefined,
              postalCode: undefined,
              city: undefined,
              state: undefined,
              country: undefined,
            },
            status: 'PENDING',
          },
        ],
        skipDuplicates: true,
      })

      expect(bullMQServiceMock.addDonorSyncJob).toHaveBeenCalledWith({
        donorSyncEventIds: ['event-1', 'event-2'],
      })
    })

    it('should handle MERGE events correctly', async () => {
      const mockRequest = {
        id: 'request-456',
        attempt: 1,
        notifications: [
          {
            action: 'profile.merge',
            payload: [
              {
                objectType: 'PERSON',
                id: 123,
                salutation: 'Mr',
                name: 'Doe',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                preferredEmail: 'PRIVATE',
                preferredPhoneNumber: 'PRIVATE',
                mergeStatus: 'MERGED',
                privatePhoneNumber: '',
                alternativePhoneNumber: '',
              },
              {
                objectType: 'PERSON',
                id: 456,
                salutation: 'Mr',
                name: 'Doe',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe.old@example.com',
                preferredEmail: 'PRIVATE',
                preferredPhoneNumber: 'PRIVATE',
                mergeStatus: 'DELETED',
                privatePhoneNumber: '',
                alternativePhoneNumber: '',
              },
            ],
          },
        ],
      }

      const mockCreatedEvents = [
        mockDeep<DonorSyncEvent>({ id: 'merge-event-1', eventType: 'MERGE' }),
      ]

      prismaServiceMock.donorSyncEvent.createManyAndReturn.mockResolvedValueOnce(mockCreatedEvents)
      bullMQServiceMock.addDonorSyncJob.mockResolvedValueOnce()

      await donorSyncEventService.addDonorSyncEvents(mockRequest)

      expect(prismaServiceMock.donorSyncEvent.createManyAndReturn).toHaveBeenCalledWith({
        select: { id: true },
        data: [
          {
            requestId: 'request-456',
            attempt: 1,
            eventType: 'MERGE',
            externalId: 123, // Should use MERGED profile's externalId
            payload: [
              {
                externalId: 123,
                civility: 'Mr',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                firstName: 'John',
                phoneNumber: undefined,
                isFacilitator: false,
                careOf: undefined,
                streetAddress1: undefined,
                streetAddress2: undefined,
                postalCode: undefined,
                city: undefined,
                state: undefined,
                country: undefined,
                mergeStatus: 'MERGED',
              },
              {
                externalId: 456,
                civility: 'Mr',
                lastName: 'Doe',
                email: 'john.doe.old@example.com',
                firstName: 'John',
                phoneNumber: undefined,
                isFacilitator: false,
                careOf: undefined,
                streetAddress1: undefined,
                streetAddress2: undefined,
                postalCode: undefined,
                city: undefined,
                state: undefined,
                country: undefined,
                mergeStatus: 'DELETED',
              },
            ],
            status: 'PENDING',
          },
        ],
        skipDuplicates: true,
      })
    })

    it('should not queue job when no events are created', async () => {
      const mockRequest = {
        id: 'request-789',
        attempt: 1,
        notifications: [
          {
            action: 'profile.create',
            payload: {
              objectType: 'PERSON',
              id: 123,
              salutation: 'Mr',
              name: 'Doe',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john.doe@example.com',
              preferredEmail: 'PRIVATE',
              preferredPhoneNumber: 'PRIVATE',
              privatePhoneNumber: '',
              alternativePhoneNumber: '',
            },
          },
        ],
      }

      prismaServiceMock.donorSyncEvent.createManyAndReturn.mockResolvedValueOnce([])

      await donorSyncEventService.addDonorSyncEvents(mockRequest)

      expect(bullMQServiceMock.addDonorSyncJob).not.toHaveBeenCalled()
    })
  })

  describe('markAsProcessing', () => {
    it('should update events status to PROCESSING', async () => {
      const donorSyncEventIds = ['event-1', 'event-2']

      prismaServiceMock.donorSyncEvent.updateMany.mockResolvedValueOnce(mockDeep())

      await donorSyncEventService.markAsProcessingJob({ jobId: 'job-1', donorSyncEventIds })

      expect(prismaServiceMock.donorSyncEvent.updateMany).toHaveBeenCalledWith({
        where: { id: { in: donorSyncEventIds } },
        data: { status: 'PROCESSING' },
      })
    })
  })

  describe('markAsCompleted', () => {
    it('should update events status to COMPLETED with processedAt date', async () => {
      const donorSyncEventIds = ['event-3', 'event-4']

      prismaServiceMock.donorSyncEvent.updateMany.mockResolvedValueOnce(mockDeep())

      await donorSyncEventService.markAsCompletedJob({ jobId: 'job-1', donorSyncEventIds })

      expect(prismaServiceMock.donorSyncEvent.updateMany).toHaveBeenCalledWith({
        where: { id: { in: donorSyncEventIds } },
        data: { status: 'COMPLETED', processedAt: expect.any(Date), errorMessage: null },
      })
    })
  })

  describe('markAsFailed', () => {
    it('should update events status to FAILED with error message and increment retry count', async () => {
      const donorSyncEventIds = ['event-5', 'event-6']
      const errorMessage = 'Processing failed due to validation error'

      prismaServiceMock.donorSyncEvent.updateMany.mockResolvedValueOnce(mockDeep())

      await donorSyncEventService.markAsFailedJob({
        jobId: 'job-1',
        donorSyncEventIds,
        errorMessage,
      })

      expect(prismaServiceMock.donorSyncEvent.updateMany).toHaveBeenCalledWith({
        where: { id: { in: donorSyncEventIds } },
        data: {
          status: 'FAILED',
          errorMessage,
          processedAt: expect.any(Date),
          retryCount: { increment: 1 },
        },
      })
    })
  })
})
