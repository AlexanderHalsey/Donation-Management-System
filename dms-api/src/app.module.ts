import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { BullModule } from '@nestjs/bullmq'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PassportModule } from '@nestjs/passport'
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino'
import { CacheModule } from '@nestjs/cache-manager'
import { TerminusModule } from '@nestjs/terminus'

import {
  AuthController,
  DonationAssetTypeController,
  DonationController,
  DonationMethodController,
  DonationTypeController,
  DonorController,
  DonorSyncEventController,
  ExportController,
  FileController,
  HealthController,
  OrganisationController,
  PaymentModeController,
  TaxReceiptController,
  UserController,
  SummaryController,
} from '@/api/controllers'

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

import { DemoWriteLockGuard, JwtRefreshStrategy, JwtStrategy, LocalStrategy } from '@/api/guards'

import {
  AuthService,
  DonationAssetTypeService,
  DonationMethodService,
  DonationService,
  DonationTypeService,
  DonorService,
  DonorSyncEventService,
  ExportService,
  FileService,
  OrganisationService,
  PaymentModeService,
  PDFRendererService,
  TaxReceiptGeneratorService,
  TaxReceiptService,
  UserService,
} from '@/domain'

import {
  BullMQService,
  DONOR_SYNC_QUEUE,
  EMAIL_QUEUE,
  GCSService,
  PrismaService,
  TAX_RECEIPT_QUEUE,
  TypedSqlService,
} from '@/infrastructure'

import {
  useBullMqFactory,
  useJwtRefreshServiceFactory,
  useJwtServiceFactory,
  usePinoLoggerFactory,
  useRedisCacheFactory,
} from '@/infrastructure/factories'

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
    PassportModule,
    PinoLoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService, GCSService],
      providers: [GCSService],
      useFactory: usePinoLoggerFactory,
    }),
    TerminusModule.forRoot(),
  ],
  controllers: [
    AuthController,
    DonationAssetTypeController,
    DonationController,
    DonationMethodController,
    DonationTypeController,
    DonorController,
    DonorSyncEventController,
    ExportController,
    FileController,
    HealthController,
    OrganisationController,
    PaymentModeController,
    TaxReceiptController,
    UserController,
    SummaryController,
  ],
  providers: [
    AuthService,
    BullMQService,
    {
      provide: APP_GUARD,
      useClass: DemoWriteLockGuard,
    },
    DonationAssetTypeConverter,
    DonationAssetTypeService,
    DonationConverter,
    DonationMethodConverter,
    DonationMethodService,
    DonationService,
    DonationTypeConverter,
    DonationTypeService,
    DonorConverter,
    DonorService,
    DonorSyncEventService,
    ExportService,
    FileConverter,
    FileService,
    GCSService,
    JwtStrategy,
    JwtRefreshStrategy,
    {
      provide: 'JWT_SERVICE',
      inject: [ConfigService],
      useFactory: useJwtServiceFactory,
    },
    {
      provide: 'JWT_REFRESH_SERVICE',
      inject: [ConfigService],
      useFactory: useJwtRefreshServiceFactory,
    },
    LocalStrategy,
    OrganisationConverter,
    OrganisationService,
    PaymentModeConverter,
    PaymentModeService,
    PDFRendererService,
    PrismaService,
    TaxReceiptConverter,
    TaxReceiptGeneratorService,
    TaxReceiptService,
    TypedSqlService,
    UserService,
  ],
})
export class AppModule {}
