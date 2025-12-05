import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'

import {
  DonationAssetTypeController,
  DonationController,
  DonationMethodController,
  DonationTypeController,
  DonorController,
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
  FileService,
  OrganisationService,
  PaymentModeService,
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
    PrismaService,
    TaxReceiptConverter,
    TaxReceiptService,
    TypedSqlService,
  ],
})
export class AppModule {}
