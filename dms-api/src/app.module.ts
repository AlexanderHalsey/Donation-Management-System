import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'

import {
  DonationAssetTypeController,
  DonationController,
  DonationMethodController,
  DonationTypeController,
  DonorController,
  ExportController,
  FileController,
  OrganisationController,
  PaymentModeController,
  TaxReceiptController,
} from './api/controllers'

import {
  DonationAssetTypeConverter,
  DonationConverter,
  DonationMethodConverter,
  DonationTypeConverter,
  DonorConverter,
  FileConverter,
  OrganisationConverter,
  PaymentModeConverter,
  TaxReceiptConverter,
} from '@/api/converters'

import {
  DonationAssetTypeService,
  DonationMethodService,
  DonationService,
  DonationTypeService,
  DonorService,
  ExportService,
  FileService,
  OrganisationService,
  PaymentModeService,
  PDFRendererService,
  TaxReceiptGeneratorService,
  TaxReceiptService,
} from '@/domain'

import { FileStorageService, PrismaService, TypedSqlService } from '@/infrastructure'

import {
  DonationAssetTypeCleanupTask,
  DonationMethodCleanupTask,
  DonationTypeCleanupTask,
  FileCleanupTask,
  OrganisationCleanupTask,
  PaymentModeCleanupTask,
} from '@/infrastructure/tasks'

@Module({
  imports: [ConfigModule.forRoot(), ScheduleModule.forRoot()],
  controllers: [
    DonationAssetTypeController,
    DonationController,
    DonationMethodController,
    DonationTypeController,
    DonorController,
    ExportController,
    FileController,
    OrganisationController,
    PaymentModeController,
    TaxReceiptController,
  ],
  providers: [
    DonationAssetTypeCleanupTask,
    DonationAssetTypeConverter,
    DonationAssetTypeService,
    DonationConverter,
    DonationMethodCleanupTask,
    DonationMethodConverter,
    DonationMethodService,
    DonationService,
    DonationTypeCleanupTask,
    DonationTypeConverter,
    DonationTypeService,
    DonorConverter,
    DonorService,
    ExportService,
    FileCleanupTask,
    FileConverter,
    FileService,
    FileStorageService,
    OrganisationCleanupTask,
    OrganisationConverter,
    OrganisationService,
    PaymentModeCleanupTask,
    PaymentModeConverter,
    PaymentModeService,
    PDFRendererService,
    PrismaService,
    TaxReceiptConverter,
    TaxReceiptGeneratorService,
    TaxReceiptService,
    TypedSqlService,
  ],
})
export class AppModule {}
