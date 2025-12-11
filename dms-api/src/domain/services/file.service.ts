import { BadRequestException, Injectable } from '@nestjs/common'

import { createHash } from 'crypto'
import { nullsToUndefined } from '@shared/utils'
import { omit } from 'es-toolkit'

import { FileStorageService, PrismaService } from '@/infrastructure'

import type { FileMetadata as PrismaFileMetadata } from '@generated/prisma/client'
import type { FileMetadata } from '@shared/models'

@Injectable()
export class FileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileStorageService: FileStorageService,
  ) {}

  async uploadDraftFile(file: Express.Multer.File): Promise<string> {
    return await this._createFile({
      name: file.originalname,
      mimeType: file.mimetype,
      buffer: file.buffer,
      status: 'DRAFT',
    })
  }

  async activateFile(fileId: string): Promise<void> {
    await this.prisma.fileMetadata.update({
      where: { id: fileId },
      data: {
        status: 'ACTIVE',
        expiresAt: null,
      },
    })
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
    return await this._createFile({ name, mimeType, buffer, status: 'ACTIVE' })
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

          const storageKey =
            duplicateFile?.storageKey ||
            (await this.fileStorageService.uploadFile({ name, buffer }))
          if (!duplicateFile) uploadedStorageKey = storageKey

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

          uploadedStorageKey = undefined
          return fileId.id
        },
        { timeout: 60 * 1000 },
      )
    } catch (error) {
      if (uploadedStorageKey) {
        try {
          await this.fileStorageService.deleteFile(uploadedStorageKey)
        } catch (cleanupError) {
          console.error(
            'Failed to cleanup uploaded file after transaction failure: ',
            uploadedStorageKey,
            cleanupError,
          )
        }
      }
      throw new BadRequestException(
        `Failed to create file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  async downloadFile(fileId: string): Promise<{ buffer: Buffer; metadata: FileMetadata }> {
    const fileMetadata = await this.prisma.fileMetadata.findUniqueOrThrow({
      where: { id: fileId },
    })

    if (fileMetadata.status !== 'ACTIVE') throw new BadRequestException('File is not active')

    const buffer = await this.fileStorageService.downloadFile(fileMetadata.storageKey)

    const downloadedHash = this.computeHash(buffer)
    if (downloadedHash !== fileMetadata.hash) {
      throw new BadRequestException(
        'File integrity check failed - file may be corrupted or tampered with',
      )
    }

    return {
      buffer,
      metadata: this.transformToFileMetadataModel(fileMetadata),
    }
  }

  async updateFileContent(
    file: PrismaFileMetadata,

    newBuffer: Buffer,
  ): Promise<void> {
    const hash = this.computeHash(newBuffer)
    await this.prisma.$transaction(
      async (tx) => {
        await tx.fileMetadata.update({
          where: { id: file.id },
          data: {
            hash,
            size: newBuffer.length,
          },
        })
        await this.fileStorageService.updateFile({ filePath: file.storageKey, buffer: newBuffer })
      },
      { timeout: 60 * 1000 },
    )
  }

  async deleteFile(fileId: string): Promise<void> {
    return await this.prisma.$transaction(
      async (tx) => {
        const fileMetadata = await tx.fileMetadata.findUniqueOrThrow({
          where: { id: fileId },
          select: { storageKey: true },
        })

        await tx.fileMetadata.delete({ where: { id: fileId } })

        await this.fileStorageService.deleteFile(fileMetadata.storageKey)
      },
      { timeout: 60 * 1000 },
    )
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

    return expiredDrafts.length
  }
}
