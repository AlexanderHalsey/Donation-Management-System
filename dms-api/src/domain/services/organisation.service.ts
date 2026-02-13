import { Inject, Injectable, Logger } from '@nestjs/common'
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager'

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
  private readonly logger = new Logger(OrganisationService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async getAllActive(): Promise<Organisation[]> {
    const organisations = (
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

    this.logger.log(`Retrieved ${organisations.length} active organisations`)

    return organisations
  }

  async getAllRefs(): Promise<OrganisationRef[]> {
    const organisationRefs = await this.prisma.organisation.findMany({
      select: {
        id: true,
        name: true,
        isDisabled: true,
        isTaxReceiptEnabled: true,
      },
    })

    this.logger.log(`Retrieved ${organisationRefs.length} organisation references`)

    return organisationRefs
  }

  async getById(id: string): Promise<Organisation> {
    const organisation = await this.prisma.organisation.findUniqueOrThrow({
      where: { id },
      include: { logo: true, signature: true },
      omit: { logoId: true, signatureId: true },
    })

    this.logger.log(`Retrieved organisation with id ${id}`)

    return this.transformToOrganisationModel(organisation)
  }

  async create(request: OrganisationRequest): Promise<Organisation> {
    return await this.prisma.$transaction(async (tx) => {
      const organisation = await tx.organisation.create({
        data: {
          name: request.name,
          isTaxReceiptEnabled: request.isTaxReceiptEnabled,
          title: request.title,
          streetAddress: request.streetAddress,
          city: request.city,
          postalCode: request.postalCode,
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
          .map((fileId) => this.fileService.activateFile(fileId)),
      )

      this.logger.log(`Created organisation with id ${organisation.id}`)
      await Promise.all([
        this.cacheManager.del('organisations'),
        this.cacheManager.del('organisation-refs'),
      ])

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
          await this.fileService.activateFile(newFileId)
        }
        if (existingFileId && existingFileId !== newFileId) {
          await this.fileService.deleteFile(existingFileId)
        }
      }

      const organisation = await tx.organisation.update({
        where: { id },
        data: {
          name: request.name,
          isTaxReceiptEnabled: request.isTaxReceiptEnabled,
          title: request.title,
          streetAddress: request.streetAddress,
          city: request.city,
          postalCode: request.postalCode,
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

      this.logger.log(`Updated organisation with id ${id}`)
      await Promise.all([
        this.cacheManager.del('organisations'),
        this.cacheManager.del('organisation-refs'),
      ])

      if (!request.isTaxReceiptEnabled) {
        await tx.donationType.updateMany({
          where: { organisationId: id, isTaxReceiptEnabled: true },
          data: { isTaxReceiptEnabled: false },
        })
        this.logger.log(
          `Disabled tax receipt for all donation types of organisation with id ${id} as tax receipt is disabled for the organisation`,
        )
        await this.cacheManager.del('donation-types')
      }

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

    this.logger.log(`Disabled organisation with id ${id}`)
    await Promise.all([
      this.cacheManager.del('organisations'),
      this.cacheManager.del('organisation-refs'),
    ])

    return this.transformToOrganisationModel(organisation)
  }

  async cleanupNonAttachedDisabled(): Promise<void> {
    await this.prisma.organisation.deleteMany({
      where: {
        isDisabled: true,
        donations: { none: {} },
      },
    })

    this.logger.log(`Cleaned up non-attached disabled organisations`)
    await Promise.all([
      this.cacheManager.del('organisations'),
      this.cacheManager.del('organisation-refs'),
    ])
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
