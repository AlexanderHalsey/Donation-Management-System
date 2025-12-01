import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'

import {
  DonationAssetTypeController,
  DonationController,
  DonationMethodController,
  DonorController,
  FileController,
  PaymentModeController,
  RefsController,
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
} from '@/domain'

import { FileStorageService, PrismaService, TypedSqlService } from '@/infrastructure'

import { FileCleanupTask } from '@/infrastructure/tasks'

@Module({
  imports: [ConfigModule.forRoot(), ScheduleModule.forRoot()],
  controllers: [
    DonationAssetTypeController,
    DonationController,
    DonationMethodController,
    DonorController,
    FileController,
    PaymentModeController,
    RefsController,
  ],
  providers: [
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
    FileCleanupTask,
    FileConverter,
    FileService,
    FileStorageService,
    OrganisationConverter,
    OrganisationService,
    PaymentModeConverter,
    PaymentModeService,
    PrismaService,
    TypedSqlService,
  ],
})
export class AppModule {}
