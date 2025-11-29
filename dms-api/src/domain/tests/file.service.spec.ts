import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { Readable } from 'stream'

import { mockDeep, mockReset } from 'jest-mock-extended'

import { FileService } from '../services/file.service'
import { FileStorageService, PrismaService } from '@/infrastructure'

import type { FileMetadata } from '@generated/prisma/client'

describe('FileService', () => {
  const prismaServiceMock = mockDeep<PrismaService>()
  const fileStorageServiceMock = mockDeep<FileStorageService>()
  let fileService: FileService

  beforeEach(async () => {
    jest.resetAllMocks()
    mockReset(prismaServiceMock)

    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        FileService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
        {
          provide: FileStorageService,
          useValue: fileStorageServiceMock,
        },
      ],
    }).compile()

    fileService = app.get<FileService>(FileService)
  })

  const mockFile: Express.Multer.File = {
    originalname: 'test-file.txt',
    buffer: Buffer.from('This is a test file'),
    size: 1024,
    mimetype: 'multipart/form-data',
    fieldname: 'file',
    encoding: '7bit',
    destination: '',
    filename: 'test-file.txt',
    path: '',
    stream: new Readable(),
  }

  describe('uploadDraftFile', () => {
    it('should upload a draft file and return its ID', async () => {
      prismaServiceMock.$transaction.mockImplementationOnce(async (cb) => {
        return cb(prismaServiceMock)
      })
      prismaServiceMock.fileMetadata.create.mockResolvedValueOnce(mockDeep<FileMetadata>())
      prismaServiceMock.fileMetadata.findFirst.mockResolvedValueOnce(null)
      fileStorageServiceMock.uploadFile.mockResolvedValueOnce('storage-key-123')
      prismaServiceMock.fileMetadata.update.mockResolvedValueOnce(mockDeep<FileMetadata>())

      const fileId = await fileService.uploadDraftFile(mockFile)

      expect(fileId).toBeDefined()
      expect(prismaServiceMock.fileMetadata.create).toHaveBeenCalledTimes(1)
      expect(fileStorageServiceMock.uploadFile).toHaveBeenCalledTimes(1)
      expect(prismaServiceMock.fileMetadata.update).toHaveBeenCalledTimes(1)
    })

    it('should reuse existing file for duplicate uploads', async () => {
      prismaServiceMock.$transaction.mockImplementationOnce(async (cb) => {
        return cb(prismaServiceMock)
      })
      prismaServiceMock.fileMetadata.create.mockResolvedValueOnce(mockDeep<FileMetadata>())
      prismaServiceMock.fileMetadata.findFirst.mockResolvedValueOnce({
        storageKey: 'existing-storage-key-456',
      } as FileMetadata)
      prismaServiceMock.fileMetadata.update.mockResolvedValueOnce(mockDeep<FileMetadata>())

      const fileId = await fileService.uploadDraftFile(mockFile)

      expect(fileId).toBeDefined()
      expect(prismaServiceMock.fileMetadata.create).toHaveBeenCalledTimes(1)
      expect(fileStorageServiceMock.uploadFile).not.toHaveBeenCalled()
      expect(prismaServiceMock.fileMetadata.update).toHaveBeenCalledTimes(1)
    })
  })

  it('should update a file status', async () => {
    prismaServiceMock.fileMetadata.update.mockResolvedValueOnce(mockDeep<FileMetadata>())

    const _ = await fileService.finalizeFile('file-id-123')
    expect(prismaServiceMock.fileMetadata.update).toHaveBeenCalledTimes(1)
  })

  describe('downloadFile', () => {
    const fileMetadata: FileMetadata = {
      id: 'file-id-123',
      storageKey: 'storage-key-123',
      status: 'ACTIVE',
      uploadedAt: new Date(),
      expiresAt: null,
      name: 'test-file.txt',
      size: 1024,
      mimeType: 'text/plain',
      hash: 'valid-hash',
    }
    it('should download a file by its ID', async () => {
      prismaServiceMock.fileMetadata.findUniqueOrThrow.mockResolvedValueOnce(fileMetadata)
      fileStorageServiceMock.downloadFile.mockResolvedValueOnce(Buffer.from('This is a test file'))
      fileService.computeHash = jest.fn().mockReturnValue('valid-hash')
      const result = await fileService.downloadFile('file-id-123')

      expect(result).toBeDefined()
      expect(result.buffer).toBeInstanceOf(Buffer)
      expect(prismaServiceMock.fileMetadata.findUniqueOrThrow).toHaveBeenCalledTimes(1)
      expect(fileStorageServiceMock.downloadFile).toHaveBeenCalledTimes(1)
    })
    it('should throw an error if file storageKey is missing', async () => {
      prismaServiceMock.fileMetadata.findUniqueOrThrow.mockResolvedValueOnce({
        ...fileMetadata,
        storageKey: null,
      })

      await expect(fileService.downloadFile('file-id-123')).rejects.toThrow(
        'File storage key not found',
      )

      expect(prismaServiceMock.fileMetadata.findUniqueOrThrow).toHaveBeenCalledTimes(1)
    })
    it('should throw an error if the file is not active', async () => {
      prismaServiceMock.fileMetadata.findUniqueOrThrow.mockResolvedValueOnce({
        ...fileMetadata,
        status: 'DRAFT',
      })

      await expect(fileService.downloadFile('file-id-123')).rejects.toThrow('File is not active')

      expect(prismaServiceMock.fileMetadata.findUniqueOrThrow).toHaveBeenCalledTimes(1)
    })
    it('should throw an error if the file integrity check fails', async () => {
      prismaServiceMock.fileMetadata.findUniqueOrThrow.mockResolvedValueOnce(fileMetadata)
      fileStorageServiceMock.downloadFile.mockResolvedValueOnce(
        Buffer.from('Corrupted file content'),
      )
      fileService.computeHash = jest.fn().mockReturnValue('invalid-hash')

      await expect(fileService.downloadFile('file-id-123')).rejects.toThrow(
        'File integrity check failed',
      )

      expect(prismaServiceMock.fileMetadata.findUniqueOrThrow).toHaveBeenCalledTimes(1)
      expect(fileStorageServiceMock.downloadFile).toHaveBeenCalledTimes(1)
    })
  })

  describe('deleteFile', () => {
    it('should delete a file by its ID', async () => {
      prismaServiceMock.$transaction.mockImplementationOnce(async (cb) => {
        return cb(prismaServiceMock)
      })
      prismaServiceMock.fileMetadata.findUniqueOrThrow.mockResolvedValueOnce({
        storageKey: 'storage-key-to-delete',
      } as FileMetadata)
      fileStorageServiceMock.deleteFile.mockResolvedValueOnce()
      prismaServiceMock.fileMetadata.delete.mockResolvedValueOnce(mockDeep<FileMetadata>())

      await fileService.deleteFile('file-id-123')

      expect(prismaServiceMock.fileMetadata.findUniqueOrThrow).toHaveBeenCalledTimes(1)
      expect(fileStorageServiceMock.deleteFile).toHaveBeenCalledTimes(1)
      expect(prismaServiceMock.fileMetadata.delete).toHaveBeenCalledTimes(1)
    })
    it('should throw an error if the file storage key is not found', async () => {
      prismaServiceMock.$transaction.mockImplementationOnce(async (cb) => {
        return cb(prismaServiceMock)
      })
      prismaServiceMock.fileMetadata.findUniqueOrThrow.mockResolvedValueOnce({
        storageKey: null,
      } as FileMetadata)

      await expect(fileService.deleteFile('file-id-123')).rejects.toThrow(
        'File storage key not found',
      )

      expect(prismaServiceMock.fileMetadata.findUniqueOrThrow).toHaveBeenCalledTimes(1)
    })
  })

  describe('cleanupExpiredDrafts', () => {
    it('should delete expired draft files', async () => {
      const expiredDrafts: FileMetadata[] = [
        {
          id: 'expired-file-1',
          storageKey: 'storage-key-1',
          status: 'DRAFT',
          uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          expiresAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
          name: 'expired-file-1.txt',
          size: 2048,
          mimeType: 'text/plain',
          hash: 'hash-1',
        },
        {
          id: 'expired-file-2',
          storageKey: 'storage-key-2',
          status: 'DRAFT',
          uploadedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
          expiresAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          name: 'expired-file-2.txt',
          size: 4096,
          mimeType: 'text/plain',
          hash: 'hash-2',
        },
      ]

      prismaServiceMock.fileMetadata.findMany.mockResolvedValueOnce(expiredDrafts)
      fileService.deleteFile = jest.fn().mockResolvedValueOnce(undefined)
      fileService.deleteFile = jest.fn().mockResolvedValueOnce(undefined)
      await fileService.cleanupExpiredDrafts()

      expect(prismaServiceMock.fileMetadata.findMany).toHaveBeenCalledTimes(1)
      expect(fileService.deleteFile).toHaveBeenCalledTimes(expiredDrafts.length)
    })
  })
})
