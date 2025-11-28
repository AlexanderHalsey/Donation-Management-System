import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import {
  DonationController,
  DonorController,
  FileController,
  RefsController,
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

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [DonationController, DonorController, FileController, RefsController],
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
