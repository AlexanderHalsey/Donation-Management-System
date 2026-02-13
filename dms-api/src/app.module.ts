import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { PassportModule } from '@nestjs/passport'
import { JwtService } from '@nestjs/jwt'
import { LoggerModule } from 'nestjs-pino'

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

import { JwtRefreshStrategy, JwtStrategy, LocalStrategy } from '@/api/guards'

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
  FileStorageService,
  PrismaService,
  SmtpService,
  TAX_RECEIPT_QUEUE,
  TypedSqlService,
} from '@/infrastructure'

import { DonorSyncConsumer, EmailConsumer, TaxReceiptConsumer } from '@/infrastructure/consumers'

import {
  DonationAssetTypeCleanupTask,
  DonationMethodCleanupTask,
  DonationTypeCleanupTask,
  DonorSyncCleanupTask,
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
    PassportModule,
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        pinoHttp: {
          transport:
            configService.get<string>('NODE_ENV') === 'production'
              ? {
                  target: '@logtail/pino',
                  options: {
                    sourceToken: configService.get<string>('LOGTAIL_SOURCE_TOKEN'),
                    options: {
                      endpoint: `https://${configService.get<string>('LOGTAIL_INGESTING_HOST')}`,
                    },
                  },
                }
              : { target: 'pino-pretty' },
          redact: {
            paths: [
              'req.headers.authorization',
              'req.headers.cookie',
              'req.body.password',
              'res.headers["set-cookie"]',
            ],
            censor: '******',
          },
        },
      }),
    }),
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
    OrganisationController,
    PaymentModeController,
    TaxReceiptController,
    UserController,
    SummaryController,
  ],
  providers: [
    AuthService,
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
    DonorSyncCleanupTask,
    DonorSyncConsumer,
    DonorSyncEventService,
    EmailConsumer,
    ExportService,
    FileCleanupTask,
    FileConverter,
    FileService,
    FileStorageService,
    JwtStrategy,
    JwtRefreshStrategy,
    {
      provide: 'JWT_SERVICE',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        new JwtService({
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: { expiresIn: configService.get<number>('JWT_TOKEN_LIFETIME_MS') },
        }),
    },
    {
      provide: 'JWT_REFRESH_SERVICE',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        new JwtService({
          secret: configService.get<string>('JWT_REFRESH_SECRET'),
          signOptions: { expiresIn: configService.get<number>('JWT_REFRESH_TOKEN_LIFETIME_MS') },
        }),
    },
    LocalStrategy,
    OrganisationCleanupTask,
    OrganisationConverter,
    OrganisationService,
    PaymentModeCleanupTask,
    PaymentModeConverter,
    PaymentModeService,
    PDFRendererService,
    PrismaService,
    SmtpService,
    TaxReceiptConsumer,
    TaxReceiptConverter,
    TaxReceiptGeneratorService,
    TaxReceiptService,
    TypedSqlService,
    UserService,
  ],
})
export class AppModule {}
