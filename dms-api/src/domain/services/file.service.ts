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

  async uploadFile(file: Express.Multer.File, status: 'DRAFT' | 'ACTIVE'): Promise<string> {
    const hash = this.computeHash(file.buffer)

    return await this.prisma.$transaction(async (tx) => {
      const fileMetadata = await tx.fileMetadata.create({
        data: {
          expiresAt:
            status === 'DRAFT'
              ? new Date(Date.now() + 24 * 60 * 60 * 1000) // Expires in 24 hours if draft
              : null,
          name: file.originalname,
          size: file.size,
          mimeType: file.mimetype,
          status,
          hash,
        },
        select: { id: true },
      })

      const duplicateFile = await tx.fileMetadata.findFirst({
        where: { hash, status: 'ACTIVE' },
        select: { storageKey: true },
      })

      const storageKey =
        duplicateFile?.storageKey || (await this.fileStorageService.uploadFile(file))

      await tx.fileMetadata.update({
        where: { id: fileMetadata.id },
        data: { storageKey },
      })

      return fileMetadata.id
    })
  }

  async finalizeFile(fileId: string): Promise<void> {
    await this.prisma.fileMetadata.update({
      where: { id: fileId },
      data: {
        status: 'ACTIVE',
        expiresAt: null,
      },
    })
  }

  async downloadFile(fileId: string): Promise<{ buffer: Buffer; metadata: FileMetadata }> {
    const fileMetadata = await this.prisma.fileMetadata.findUniqueOrThrow({
      where: { id: fileId },
    })

    if (!fileMetadata.storageKey) throw new BadRequestException('File storage key not found')
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

  async deleteFile(fileId: string): Promise<void> {
    return await this.prisma.$transaction(async (tx) => {
      const fileMetadata = await tx.fileMetadata.findUniqueOrThrow({
        where: { id: fileId },
        select: { storageKey: true },
      })

      if (!fileMetadata.storageKey) throw new BadRequestException('File storage key not found')

      await this.fileStorageService.deleteFile(fileMetadata.storageKey)

      await tx.fileMetadata.delete({ where: { id: fileId } })
    })
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
