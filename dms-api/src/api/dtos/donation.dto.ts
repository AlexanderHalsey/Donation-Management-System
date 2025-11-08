import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsOptional, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

import { OrganisationSummaryDto, OrganisationListSortOrder } from './organisation.dto'
import { DonationTypeDto, DonationTypeListSortOrder } from './donation-type.dto'
import { DonationMethodDto, DonationMethodListSortOrder } from './donation-method.dto'
import { DonationAssetTypeDto, DonationAssetTypeListSortOrder } from './donation-asset-type.dto'
import { PaymentModeDto, PaymentModeListSortOrder } from './payment-mode.dto'

import { SortOrderEnum, SortOrder } from './sort-order.dto'

export class DonationDto {
  id: string
  createdAt: string
  updatedAt: string
  donatedAt: string
  amount: number
  paymentMode: PaymentModeDto
  organisation: OrganisationSummaryDto
  donationType: DonationTypeDto
  donationMethod: DonationMethodDto
  donationAssetType: DonationAssetTypeDto
  isDisabled: boolean
  contactId: string
  receiptId?: string
}

export class DonationListSortOrder {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(SortOrderEnum)
  createdAt?: SortOrder

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(SortOrderEnum)
  donatedAt?: SortOrder

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(SortOrderEnum)
  amount?: SortOrder

  @ApiProperty({ type: PaymentModeListSortOrder, required: false })
  @ValidateNested()
  @Type(() => PaymentModeListSortOrder)
  paymentMode?: PaymentModeListSortOrder

  @ApiProperty({ type: OrganisationListSortOrder, required: false })
  @ValidateNested()
  @Type(() => OrganisationListSortOrder)
  organisation?: OrganisationListSortOrder

  @ApiProperty({ type: DonationTypeListSortOrder, required: false })
  @ValidateNested()
  @Type(() => DonationTypeListSortOrder)
  donationType?: DonationTypeListSortOrder

  @ApiProperty({ type: DonationMethodListSortOrder, required: false })
  @ValidateNested()
  @Type(() => DonationMethodListSortOrder)
  donationMethod?: DonationMethodListSortOrder

  @ApiProperty({ type: DonationAssetTypeListSortOrder, required: false })
  @ValidateNested()
  @Type(() => DonationAssetTypeListSortOrder)
  donationAssetType?: DonationAssetTypeListSortOrder

  // contact name
  // receipt reference number
}
