import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { DonationController } from '@/api/controllers'

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
  DonationService,
  DonationTypeService,
  DonorService,
  OrganisationService,
  PaymentModeService,
} from '@/domain'

import { PrismaService } from '@/infrastructure'

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [DonationController],
  providers: [
    DonationAssetTypeConverter,
    DonationConverter,
    DonationMethodConverter,
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
