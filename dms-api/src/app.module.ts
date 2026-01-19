import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { ConfigModule, ConfigService } from '@nestjs/config'
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
  TaxReceiptConsumer,
  TaxReceiptGeneratorService,
  TaxReceiptService,
} from '@/domain'

import {
  BullMQService,
  DONOR_SYNC_QUEUE,
  EMAIL_QUEUE,
  FileStorageService,
  PrismaService,
  TAX_RECEIPT_QUEUE,
  TypedSqlService,
} from '@/infrastructure'

import {
  DonationAssetTypeCleanupTask,
  DonationMethodCleanupTask,
  DonationTypeCleanupTask,
  FileCleanupTask,
  OrganisationCleanupTask,
  PaymentModeCleanupTask,
} from '@/infrastructure/tasks'

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          retryDelayOnFailover: 1000,
        },
      }),
    }),
    BullModule.registerQueue({ name: DONOR_SYNC_QUEUE }),
    BullModule.registerQueue({ name: TAX_RECEIPT_QUEUE }),
    BullModule.registerQueue({ name: EMAIL_QUEUE }),
  ],
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
    BullMQService,
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
    TaxReceiptConsumer,
    TaxReceiptConverter,
    TaxReceiptGeneratorService,
    TaxReceiptService,
    TypedSqlService,
  ],
})
export class AppModule {}
