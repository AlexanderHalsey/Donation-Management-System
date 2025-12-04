import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { mockDeep, mockReset } from 'jest-mock-extended'

import { OrganisationService } from '../services/organisation.service'
import { FileService } from '../services/file.service'
import { PrismaService } from '@/infrastructure'

import type { Organisation } from '@generated/prisma/client'

describe('OrganisationService', () => {
  const prismaServiceMock = mockDeep<PrismaService>()
  const fileServiceMock = mockDeep<FileService>()
  let organisationService: OrganisationService

  beforeEach(async () => {
    jest.resetAllMocks()
    mockReset(prismaServiceMock)
    mockReset(fileServiceMock)

    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        OrganisationService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
        {
          provide: FileService,
          useValue: fileServiceMock,
        },
      ],
    }).compile()

    organisationService = app.get<OrganisationService>(OrganisationService)
  })

  it('should get organisation list', async () => {
    prismaServiceMock.organisation.findMany.mockResolvedValueOnce([])

    await organisationService.getAllActive()

    expect(prismaServiceMock.organisation.findMany).toHaveBeenCalledWith({
      where: { isDisabled: false },
      include: { logo: true, signature: true },
      omit: { logoId: true, signatureId: true },
    })
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
    organisationService.transformToOrganisationModel = jest
      .fn()
      .mockReturnValueOnce(mockDeep<Organisation>())

    await organisationService.getById(id)

    expect(prismaServiceMock.organisation.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id },
      include: { logo: true, signature: true },
      omit: { logoId: true, signatureId: true },
    })
  })

  describe('create', () => {
    beforeEach(() => {
      prismaServiceMock.$transaction.mockImplementationOnce(async (cb) => {
        return cb(prismaServiceMock)
      })
      organisationService.transformToOrganisationModel = jest
        .fn()
        .mockReturnValueOnce(mockDeep<Organisation>())
    })
    it('should create organisation without files', async () => {
      const request = {
        name: 'New Organisation',
        title: 'Organisation Title',
        address: '123 Main St',
        locality: 'City',
        postCode: '12345',
      }
      prismaServiceMock.organisation.create.mockResolvedValueOnce(mockDeep<Organisation>())

      await organisationService.create(request)

      expect(prismaServiceMock.organisation.create).toHaveBeenCalledWith({
        data: request,
        include: { logo: true, signature: true },
        omit: { logoId: true, signatureId: true },
      })
      expect(fileServiceMock.finalizeFile).not.toHaveBeenCalled()
    })

    it('should create organisation and finalize files', async () => {
      const request = {
        name: 'New Organisation',
        title: 'Organisation Title',
        address: '123 Main St',
        locality: 'City',
        postCode: '12345',
        logoId: 'logo-file-id',
        signatureId: 'signature-file-id',
      }
      prismaServiceMock.organisation.create.mockResolvedValueOnce(mockDeep<Organisation>())

      await organisationService.create(request)

      expect(prismaServiceMock.organisation.create).toHaveBeenCalledWith({
        data: request,
        include: { logo: true, signature: true },
        omit: { logoId: true, signatureId: true },
      })
      expect(fileServiceMock.finalizeFile).toHaveBeenCalledTimes(2)
      expect(fileServiceMock.finalizeFile).toHaveBeenCalledWith('logo-file-id')
      expect(fileServiceMock.finalizeFile).toHaveBeenCalledWith('signature-file-id')
    })

    it('should create organisation and finalize only provided files', async () => {
      const request = {
        name: 'New Organisation',
        logoId: 'logo-file-id',
        // No signatureId
      }
      prismaServiceMock.organisation.create.mockResolvedValueOnce(mockDeep<Organisation>())

      await organisationService.create(request)

      expect(fileServiceMock.finalizeFile).toHaveBeenCalledTimes(1)
      expect(fileServiceMock.finalizeFile).toHaveBeenCalledWith('logo-file-id')
    })
  })

  describe('update', () => {
    beforeEach(() => {
      prismaServiceMock.$transaction.mockImplementationOnce(async (cb) => {
        return cb(prismaServiceMock)
      })
      organisationService.transformToOrganisationModel = jest
        .fn()
        .mockReturnValueOnce(mockDeep<Organisation>())
    })
    it('should update organisation without file changes', async () => {
      const id = 'organisation-id-123'
      const request = {
        name: 'Updated Organisation',
        title: 'Updated Title',
      }
      const existingFileIds = { logoId: null, signatureId: null }
      prismaServiceMock.organisation.findUniqueOrThrow.mockResolvedValueOnce(
        mockDeep<Organisation>(existingFileIds),
      )
      prismaServiceMock.organisation.update.mockResolvedValueOnce(mockDeep<Organisation>())

      await organisationService.update(id, request)

      expect(prismaServiceMock.organisation.update).toHaveBeenCalledWith({
        where: { id },
        data: request,
        include: { logo: true, signature: true },
        omit: { logoId: true, signatureId: true },
      })
      expect(fileServiceMock.finalizeFile).not.toHaveBeenCalled()
      expect(fileServiceMock.deleteFile).not.toHaveBeenCalled()
    })

    it('should update organisation and handle file changes', async () => {
      const id = 'organisation-id-123'
      const request = {
        name: 'Updated Organisation',
        logoId: 'new-logo-id',
        signatureId: 'new-signature-id',
      }
      const existingFileIds = { logoId: 'old-logo-id', signatureId: 'old-signature-id' }
      prismaServiceMock.organisation.findUniqueOrThrow.mockResolvedValueOnce(
        mockDeep<Organisation>(existingFileIds),
      )
      prismaServiceMock.organisation.update.mockResolvedValueOnce(mockDeep<Organisation>())

      await organisationService.update(id, request)

      expect(fileServiceMock.finalizeFile).toHaveBeenCalledTimes(2)
      expect(fileServiceMock.finalizeFile).toHaveBeenCalledWith('new-logo-id')
      expect(fileServiceMock.finalizeFile).toHaveBeenCalledWith('new-signature-id')
      expect(fileServiceMock.deleteFile).toHaveBeenCalledTimes(2)
      expect(fileServiceMock.deleteFile).toHaveBeenCalledWith('old-logo-id')
      expect(fileServiceMock.deleteFile).toHaveBeenCalledWith('old-signature-id')
    })

    it('should handle partial file updates', async () => {
      const id = 'organisation-id-123'
      const request = {
        name: 'Updated Organisation',
        logoId: 'new-logo-id',
        signatureId: 'old-signature-id', // Same as existing
      }
      const existingFileIds = { logoId: 'old-logo-id', signatureId: 'old-signature-id' }
      prismaServiceMock.organisation.findUniqueOrThrow.mockResolvedValueOnce(
        mockDeep<Organisation>(existingFileIds),
      )
      prismaServiceMock.organisation.update.mockResolvedValueOnce(mockDeep<Organisation>())

      await organisationService.update(id, request)

      expect(fileServiceMock.finalizeFile).toHaveBeenCalledTimes(1)
      expect(fileServiceMock.finalizeFile).toHaveBeenCalledWith('new-logo-id')
      expect(fileServiceMock.deleteFile).toHaveBeenCalledTimes(1)
      expect(fileServiceMock.deleteFile).toHaveBeenCalledWith('old-logo-id')
    })
  })

  it('should disable organisation', async () => {
    const id = 'organisation-id-123'
    prismaServiceMock.organisation.update.mockResolvedValueOnce(mockDeep<Organisation>())
    organisationService.transformToOrganisationModel = jest
      .fn()
      .mockReturnValueOnce(mockDeep<Organisation>())

    await organisationService.disable(id)

    expect(prismaServiceMock.organisation.update).toHaveBeenCalledWith({
      where: { id },
      data: { isDisabled: true },
      include: { logo: true, signature: true },
      omit: { logoId: true, signatureId: true },
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
