import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'

import { createHash } from 'crypto'
import { nullsToUndefined } from '@shared/utils'
import { omit } from 'es-toolkit'

import { GCSService, PrismaService } from '@/infrastructure'

import type { FileMetadata as PrismaFileMetadata } from '@generated/prisma/client'
import type { FileMetadata } from '@shared/models'

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly gcsService: GCSService,
  ) {}

  async uploadDraftFile(file: Express.Multer.File): Promise<string> {
    const fileId = await this._createFile({
      name: file.originalname,
      mimeType: file.mimetype,
      buffer: file.buffer,
      status: 'DRAFT',
    })

    this.logger.log(`Uploaded draft file with id ${fileId} and name ${file.originalname}`)

    return fileId
  }

  async activateFile(fileId: string): Promise<void> {
    await this.prisma.fileMetadata.update({
      where: { id: fileId },
      data: {
        status: 'ACTIVE',
        expiresAt: null,
      },
    })

    this.logger.log(`Activated file with id ${fileId}`)
  }

  async createFile({
    name,
    mimeType,
    buffer,
  }: {
    name: string
    mimeType: string
    buffer: Buffer
  }): Promise<string> {
    const fileId = await this._createFile({ name, mimeType, buffer, status: 'ACTIVE' })

    this.logger.log(`Created file with id ${fileId} and name ${name}`)

    return fileId
  }

  private async _createFile({
    name,
    mimeType,
    buffer,
    status,
  }: {
    name: string
    mimeType: string
    buffer: Buffer
    status: 'ACTIVE' | 'DRAFT'
  }): Promise<string> {
    const hash = this.computeHash(buffer)
    let uploadedStorageKey: string | undefined
    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const duplicateFile = await tx.fileMetadata.findFirst({
            where: { hash, status: 'ACTIVE' },
            select: { storageKey: true },
          })

          let storageKey: string
          if (duplicateFile?.storageKey) {
            storageKey = duplicateFile.storageKey
          } else {
            try {
              storageKey = await this.gcsService.uploadFile({
                buffer,
                contentType: mimeType,
              })
            } catch {
              throw new InternalServerErrorException({
                code: 'FILE_UPLOAD_FAILED',
                message: 'Failed to upload file to storage service',
              })
            }
            // keep reference for rollback cleanup in case transaction fails after this point
            uploadedStorageKey = storageKey
          }

          const fileId = await tx.fileMetadata.create({
            data: {
              name,
              mimeType,
              storageKey,
              size: buffer.length,
              hash,
              status,
              expiresAt: status === 'DRAFT' ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null,
            },
            select: { id: true },
          })

          this.logger.log(`Created file metadata with id ${fileId.id} for file ${name}`)

          uploadedStorageKey = undefined
          return fileId.id
        },
        { timeout: 60 * 1000 },
      )
    } catch (error) {
      if (uploadedStorageKey) {
        try {
          await this.gcsService.deleteFile(uploadedStorageKey)
          this.logger.warn({
            code: 'FILE_UPLOAD_ROLLBACK',
            message: `Cleaned up uploaded file with key ${uploadedStorageKey} after transaction failure`,
          })
        } catch (cleanupError) {
          this.logger.error(
            {
              code: 'FILE_UPLOAD_ROLLBACK_FAILED',
              message: `Failed to cleanup uploaded file with key ${uploadedStorageKey} after transaction failure`,
              errorStack: cleanupError instanceof Error ? cleanupError.stack : null,
            },
            `Failed to cleanup uploaded file with key ${uploadedStorageKey} after transaction failure`,
          )
        }
      }
      throw new InternalServerErrorException({
        code: 'FILE_CREATION_FAILED',
        message: `Failed to create file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
    }
  }

  async downloadFile(fileId: string): Promise<{ buffer: Buffer; metadata: FileMetadata }> {
    const fileMetadata = await this.prisma.fileMetadata.findUniqueOrThrow({
      where: { id: fileId },
    })

    if (fileMetadata.status !== 'ACTIVE')
      throw new BadRequestException({
        code: 'FILE_NOT_ACTIVE',
        message: 'File is not active',
      })

    let buffer: Buffer
    try {
      buffer = await this.gcsService.downloadFile(fileMetadata.storageKey)
    } catch {
      throw new InternalServerErrorException({
        code: 'FILE_DOWNLOAD_FAILED',
        message: 'Failed to download file from storage service',
      })
    }

    const downloadedHash = this.computeHash(buffer)
    if (downloadedHash !== fileMetadata.hash) {
      throw new InternalServerErrorException({
        code: 'FILE_INTEGRITY_CHECK_FAILED',
        message: 'File integrity check failed - file may be corrupted or tampered with',
      })
    }

    this.logger.log(`Downloaded file with id ${fileId} and name ${fileMetadata.name}`)

    return {
      buffer,
      metadata: this.transformToFileMetadataModel(fileMetadata),
    }
  }

  async updateFileContent({
    id,
    storageKey,
    mimeType,
    buffer,
  }: {
    id: string
    storageKey: string
    mimeType: string
    buffer: Buffer
  }): Promise<void> {
    const hash = this.computeHash(buffer)
    await this.prisma.$transaction(
      async (tx) => {
        await tx.fileMetadata.update({
          where: { id },
          data: {
            hash,
            size: buffer.length,
            mimeType,
          },
        })
        try {
          await this.gcsService.updateFile({
            storageKey,
            buffer,
            contentType: mimeType,
          })
        } catch (err) {
          throw new InternalServerErrorException({
            code: 'FILE_UPDATE_FAILED',
            message: 'Failed to update file in storage service',
            stack: err instanceof Error ? err.stack : null,
          })
        }
      },
      { timeout: 60 * 1000 },
    )
    this.logger.log(`Updated content for file with id ${id} and storage key ${storageKey}`)
  }

  async deleteFile(fileId: string): Promise<void> {
    await this.prisma.$transaction(
      async (tx) => {
        const { storageKey } = await tx.fileMetadata.findUniqueOrThrow({
          where: { id: fileId },
          select: { storageKey: true },
        })

        await tx.fileMetadata.delete({ where: { id: fileId } })
        try {
          await this.gcsService.deleteFile(storageKey)
        } catch (err) {
          throw new InternalServerErrorException({
            code: 'FILE_DELETE_FAILED',
            message: 'Failed to delete file from storage service',
            stack: err instanceof Error ? err.stack : null,
          })
        }
      },
      { timeout: 60 * 1000 },
    )
    this.logger.log(`Deleted file with id ${fileId}`)
  }

  async cleanupExpiredDrafts(): Promise<number> {
    const expiredDrafts = await this.prisma.fileMetadata.findMany({
      where: {
        status: 'DRAFT',
        expiresAt: { lt: new Date() },
      },
      select: { id: true },
    })

    for (const draft of expiredDrafts) {
      await this.deleteFile(draft.id)
    }

    this.logger.log(`Cleaned up ${expiredDrafts.length} expired draft files`)

    return expiredDrafts.length
  }

  computeHash(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex')
  }

  transformToFileMetadataModel(fileMetadata: PrismaFileMetadata): FileMetadata {
    return nullsToUndefined({
      ...omit(fileMetadata, ['status']),
      status: fileMetadata.status.toLowerCase() as FileMetadata['status'],
    })
  }
}
