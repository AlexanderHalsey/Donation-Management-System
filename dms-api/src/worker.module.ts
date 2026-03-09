import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino'
import { CacheModule } from '@nestjs/cache-manager'

import {
  DonationAssetTypeService,
  DonationMethodService,
  DonationTypeService,
  DonorService,
  DonorSyncEventService,
  FileService,
  OrganisationService,
  PaymentModeService,
  PDFRendererService,
  TaxReceiptGeneratorService,
  TaxReceiptService,
} from '@/domain'

import {
  BullMQService,
  DONOR_SYNC_QUEUE,
  EMAIL_QUEUE,
  GCSService,
  PrismaService,
  SmtpService,
  TAX_RECEIPT_QUEUE,
  TypedSqlService,
} from '@/infrastructure'

import {
  useBullMqFactory,
  usePinoLoggerFactory,
  useRedisCacheFactory,
} from '@/infrastructure/factories'

import { DonorSyncConsumer, EmailConsumer, TaxReceiptConsumer } from '@/infrastructure/consumers'

import {
  DbBackupTask,
  DonationAssetTypeCleanupTask,
  DonationMethodCleanupTask,
  DonationTypeCleanupTask,
  DonorCleanupTask,
  DonorSyncCleanupTask,
  FileCleanupTask,
  OrganisationCleanupTask,
  PaymentModeCleanupTask,
} from '@/infrastructure/tasks'

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: useBullMqFactory,
    }),
    BullModule.registerQueue({ name: DONOR_SYNC_QUEUE }),
    BullModule.registerQueue({ name: TAX_RECEIPT_QUEUE }),
    BullModule.registerQueue({ name: EMAIL_QUEUE }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: useRedisCacheFactory,
    }),
    ConfigModule.forRoot(),
    PinoLoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService, GCSService],
      providers: [GCSService],
      useFactory: usePinoLoggerFactory,
    }),
    ScheduleModule.forRoot(),
  ],
  providers: [
    BullMQService,
    DbBackupTask,
    DonationAssetTypeCleanupTask,
    DonationAssetTypeService,
    DonationMethodCleanupTask,
    DonationMethodService,
    DonationTypeCleanupTask,
    DonationTypeService,
    DonorCleanupTask,
    DonorService,
    DonorSyncCleanupTask,
    DonorSyncConsumer,
    DonorSyncEventService,
    EmailConsumer,
    FileCleanupTask,
    FileService,
    GCSService,
    OrganisationCleanupTask,
    OrganisationService,
    PaymentModeCleanupTask,
    PaymentModeService,
    PDFRendererService,
    PrismaService,
    SmtpService,
    TaxReceiptConsumer,
    TaxReceiptGeneratorService,
    TaxReceiptService,
    TypedSqlService,
  ],
})
export class WorkerModule {}
