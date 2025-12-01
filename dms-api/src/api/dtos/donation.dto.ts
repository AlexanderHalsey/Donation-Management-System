import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsOptional, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

import { OrganisationRefDto, OrganisationRefSortOrder } from './organisation.dto'
import { DonationTypeRefDto, DonationTypeRefSortOrder } from './donation-type.dto'
import { DonationMethodDto, DonationMethodSortOrder } from './donation-method.dto'
import { DonationAssetTypeDto, DonationAssetTypeSortOrder } from './donation-asset-type.dto'
import { PaymentModeDto, PaymentModeSortOrder } from './payment-mode.dto'
import { DonorRefDto, DonorRefSortOrder } from './donor.dto'

import { SortOrderEnum, SortOrder } from './sort-order.dto'

export class DonationListItemDto {
  id: string
  updatedAt: string
  donatedAt: string
  amount: number
  paymentMode: PaymentModeDto
  organisation: OrganisationRefDto
  donationType: DonationTypeRefDto
  donor: DonorRefDto
  taxReceiptId?: string
}

export class DonationDto extends DonationListItemDto {
  createdAt: string
  donationMethod: DonationMethodDto
  donationAssetType: DonationAssetTypeDto
}

export class DonationListSortOrder {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(SortOrderEnum)
  updatedAt?: SortOrder

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(SortOrderEnum)
  donatedAt?: SortOrder

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(SortOrderEnum)
  amount?: SortOrder

  @ApiProperty({ type: PaymentModeSortOrder, required: false })
  @ValidateNested()
  @Type(() => PaymentModeSortOrder)
  paymentMode?: PaymentModeSortOrder

  @ApiProperty({ type: OrganisationRefSortOrder, required: false })
  @ValidateNested()
  @Type(() => OrganisationRefSortOrder)
  organisation?: OrganisationRefSortOrder

  @ApiProperty({ type: DonationTypeRefSortOrder, required: false })
  @ValidateNested()
  @Type(() => DonationTypeRefSortOrder)
  donationType?: DonationTypeRefSortOrder

  @ApiProperty({ type: DonationMethodSortOrder, required: false })
  @ValidateNested()
  @Type(() => DonationMethodSortOrder)
  donationMethod?: DonationMethodSortOrder

  @ApiProperty({ type: DonationAssetTypeSortOrder, required: false })
  @ValidateNested()
  @Type(() => DonationAssetTypeSortOrder)
  donationAssetType?: DonationAssetTypeSortOrder

  @ApiProperty({ type: DonorRefSortOrder, required: false })
  @ValidateNested()
  @Type(() => DonorRefSortOrder)
  donor?: DonorRefSortOrder
}
