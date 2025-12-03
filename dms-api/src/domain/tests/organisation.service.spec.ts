import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { mockDeep, mockReset } from 'jest-mock-extended'

import { OrganisationService } from '../services/organisation.service'
import { PrismaService } from '@/infrastructure'

import type { Organisation } from '@generated/prisma/client'

describe('OrganisationService', () => {
  const prismaServiceMock = mockDeep<PrismaService>()
  let organisationService: OrganisationService

  beforeEach(async () => {
    jest.resetAllMocks()
    mockReset(prismaServiceMock)

    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        OrganisationService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile()

    organisationService = app.get<OrganisationService>(OrganisationService)
  })

  it('should get organisation list', async () => {
    prismaServiceMock.organisation.findMany.mockResolvedValueOnce([])

    await organisationService.getAll()

    expect(prismaServiceMock.organisation.findMany).toHaveBeenCalledTimes(1)
  })

  it('should get organisation refs', async () => {
    prismaServiceMock.organisation.findMany.mockResolvedValueOnce([])

    await organisationService.getAllRefs()

    expect(prismaServiceMock.organisation.findMany).toHaveBeenCalledTimes(1)
  })

  it('should get organisation by ID', async () => {
    const id = 'organisation-id-123'
    const mockOrganisation = mockDeep<Organisation>()
    prismaServiceMock.organisation.findUniqueOrThrow.mockResolvedValueOnce(mockOrganisation)

    await organisationService.getById(id)

    expect(prismaServiceMock.organisation.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id },
    })
  })

  it('should create organisation', async () => {
    const request = {
      name: 'New Organisation',
      title: 'Organisation Title',
      address: '123 Main St',
      locality: 'City',
      postCode: '12345',
    }
    const createdOrganisation = mockDeep<Organisation>({ id: 'new-organisation-id-123' })
    prismaServiceMock.organisation.create.mockResolvedValueOnce(createdOrganisation)

    await organisationService.create(request)

    expect(prismaServiceMock.organisation.create).toHaveBeenCalledWith({ data: request })
  })

  it('should update organisation', async () => {
    const id = 'organisation-id-123'
    const request = {
      name: 'Updated Organisation',
      title: 'Updated Title',
      address: '456 Updated St',
      locality: 'Updated City',
      postCode: '67890',
    }
    prismaServiceMock.organisation.update.mockResolvedValueOnce(mockDeep<Organisation>())

    await organisationService.update(id, request)

    expect(prismaServiceMock.organisation.update).toHaveBeenCalledWith({
      where: { id },
      data: request,
    })
  })

  it('should disable organisation', async () => {
    const id = 'organisation-id-123'
    prismaServiceMock.organisation.update.mockResolvedValueOnce(mockDeep<Organisation>())

    await organisationService.disable(id)

    expect(prismaServiceMock.organisation.update).toHaveBeenCalledWith({
      where: { id },
      data: { isDisabled: true },
    })
  })

  it('should delete non-attached disabled organisations', async () => {
    prismaServiceMock.organisation.deleteMany.mockResolvedValueOnce({ count: 2 })

    await organisationService.cleanupNonAttachedDisabled()

    expect(prismaServiceMock.organisation.deleteMany).toHaveBeenCalledWith({
      where: {
        isDisabled: true,
        donations: { none: {} },
      },
    })
  })
})
