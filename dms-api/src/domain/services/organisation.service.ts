import { Injectable } from '@nestjs/common'

import { omit } from 'es-toolkit'
import { nullsToUndefined } from '@shared/utils'

import { PrismaService } from '@/infrastructure'
import { FileService } from './file.service'

import type {
  FileMetadata as PrismaFileMetadata,
  Organisation as PrismaOrganisation,
} from '@generated/prisma/client'

import type { Organisation, OrganisationRef } from '@shared/models'
import type { OrganisationRequest } from '@/api/dtos'

@Injectable()
export class OrganisationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
  ) {}

  async getAllActive(): Promise<Organisation[]> {
    return (
      await this.prisma.organisation.findMany({
        where: {
          isDisabled: false,
        },
        include: {
          logo: true,
          signature: true,
        },
        omit: { logoId: true, signatureId: true },
      })
    ).map((organisation) => this.transformToOrganisationModel(organisation))
  }

  async getAllRefs(): Promise<OrganisationRef[]> {
    return this.prisma.organisation.findMany({
      select: {
        id: true,
        name: true,
        isDisabled: true,
      },
    })
  }

  async getById(id: string): Promise<Organisation> {
    const organisation = await this.prisma.organisation.findUniqueOrThrow({
      where: { id },
      include: { logo: true, signature: true },
      omit: { logoId: true, signatureId: true },
    })
    return this.transformToOrganisationModel(organisation)
  }

  async create(request: OrganisationRequest): Promise<Organisation> {
    return await this.prisma.$transaction(async (tx) => {
      const organisation = await tx.organisation.create({
        data: {
          name: request.name,
          title: request.title,
          address: request.address,
          locality: request.locality,
          postCode: request.postCode,
          logoId: request.logoId,
          object: request.object,
          objectDescription: request.objectDescription,
          signatoryName: request.signatoryName,
          signatoryPosition: request.signatoryPosition,
          signatureId: request.signatureId,
        },
        include: { logo: true, signature: true },
        omit: { logoId: true, signatureId: true },
      })

      await Promise.all(
        [request.logoId, request.signatureId]
          .filter((fileId): fileId is string => !!fileId)
          .map((fileId) => this.fileService.finalizeFile(fileId)),
      )

      return this.transformToOrganisationModel(organisation)
    })
  }

  async update(id: string, request: OrganisationRequest): Promise<Organisation> {
    return await this.prisma.$transaction(async (tx) => {
      const existingFileIds = await tx.organisation.findUniqueOrThrow({
        where: { id },
        select: { logoId: true, signatureId: true },
      })

      const filesToUpdate = [
        { newFileId: request.logoId, existingFileId: existingFileIds.logoId },
        { newFileId: request.signatureId, existingFileId: existingFileIds.signatureId },
      ]

      for (const { newFileId, existingFileId } of filesToUpdate) {
        if (newFileId && newFileId !== existingFileId) {
          await this.fileService.finalizeFile(newFileId)
        }
        if (existingFileId && existingFileId !== newFileId) {
          await this.fileService.deleteFile(existingFileId)
        }
      }

      const organisation = await tx.organisation.update({
        where: { id },
        data: {
          name: request.name,
          title: request.title,
          address: request.address,
          locality: request.locality,
          postCode: request.postCode,
          logoId: request.logoId,
          object: request.object,
          objectDescription: request.objectDescription,
          signatoryName: request.signatoryName,
          signatoryPosition: request.signatoryPosition,
          signatureId: request.signatureId,
        },
        include: { logo: true, signature: true },
        omit: { logoId: true, signatureId: true },
      })

      return this.transformToOrganisationModel(organisation)
    })
  }

  async disable(id: string): Promise<Organisation> {
    const organisation = await this.prisma.organisation.update({
      where: { id },
      data: { isDisabled: true },
      include: { logo: true, signature: true },
      omit: { logoId: true, signatureId: true },
    })
    return this.transformToOrganisationModel(organisation)
  }

  async cleanupNonAttachedDisabled(): Promise<void> {
    await this.prisma.organisation.deleteMany({
      where: {
        isDisabled: true,
        donations: { none: {} },
      },
    })
  }

  transformToOrganisationModel(
    organisation: Omit<PrismaOrganisation, 'logoId' | 'signatureId'> & {
      logo: PrismaFileMetadata | null
      signature: PrismaFileMetadata | null
    },
  ): Organisation {
    return nullsToUndefined({
      ...omit(organisation, ['logo', 'signature']),
      logo: organisation.logo && this.fileService.transformToFileMetadataModel(organisation.logo),
      signature:
        organisation.signature &&
        this.fileService.transformToFileMetadataModel(organisation.signature),
    })
  }
}
