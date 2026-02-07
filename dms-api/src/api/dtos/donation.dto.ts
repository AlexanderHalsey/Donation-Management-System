import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsOptional, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

import { OrganisationRefDto, OrganisationRefSortOrder } from './organisation.dto'
import { DonationTypeDto, DonationTypeSortOrder } from './donationType.dto'
import { DonationMethodDto, DonationMethodSortOrder } from './donationMethod.dto'
import { DonationAssetTypeDto, DonationAssetTypeSortOrder } from './donationAssetType.dto'
import { PaymentModeDto, PaymentModeSortOrder } from './paymentMode.dto'
import { DonorRefDto, DonorRefSortOrder } from './donor.dto'

import { SortOrderEnum, SortOrder } from './sortOrder.dto'

export class DonationRefDto {
  id: string
  donatedAt: string
  amount: number
  donor: DonorRefDto
}

export class DonationListItemDto extends DonationRefDto {
  updatedAt: string
  paymentMode: PaymentModeDto
  organisation: OrganisationRefDto
  donationType: DonationTypeDto
  isTaxReceiptEnabled: boolean
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

  @ApiProperty({ type: DonationTypeSortOrder, required: false })
  @ValidateNested()
  @Type(() => DonationTypeSortOrder)
  donationType?: DonationTypeSortOrder

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
