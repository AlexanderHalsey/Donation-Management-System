import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { DonationController, DonorController, RefsController } from '@/api/controllers'

import {
  DonationAssetTypeConverter,
  DonationConverter,
  DonationMethodConverter,
  DonationTypeConverter,
  DonorConverter,
  OrganisationConverter,
  PaymentModeConverter,
} from '@/api/converters'

import {
  DonationAssetTypeService,
  DonationMethodService,
  DonationService,
  DonationTypeService,
  DonorService,
  OrganisationService,
  PaymentModeService,
} from '@/domain'

import { PrismaService } from '@/infrastructure'

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [DonationController, DonorController, RefsController],
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
    OrganisationConverter,
    OrganisationService,
    PaymentModeConverter,
    PaymentModeService,
    PrismaService,
  ],
})
export class AppModule {}
