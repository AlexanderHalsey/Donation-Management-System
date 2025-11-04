import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsOptional, ValidateNested } from 'class-validator'

enum SortOrderEnum {
  ASC = 'asc',
  DESC = 'desc',
}
type SortOrder = 'asc' | 'desc'

export class PaymentModeSortOrderRequest {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(SortOrderEnum)
  createdAt?: SortOrder

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(SortOrderEnum)
  name?: SortOrder
}

export class OrganisationSortOrderRequest {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(SortOrderEnum)
  createdAt?: SortOrder

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(SortOrderEnum)
  name?: SortOrder
}

export class DonationTypeSortOrderRequest {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(SortOrderEnum)
  createdAt?: SortOrder

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(SortOrderEnum)
  name?: SortOrder
}

export class DonationMethodSortOrderRequest {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(SortOrderEnum)
  createdAt?: SortOrder

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(SortOrderEnum)
  name?: SortOrder
}

export class DonationAssetTypeSortOrderRequest {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(SortOrderEnum)
  createdAt?: SortOrder

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(SortOrderEnum)
  name?: SortOrder
}

export class DonationSortOrderRequest {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(SortOrderEnum)
  createdAt?: SortOrder

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(SortOrderEnum)
  amount?: SortOrder

  @ApiProperty({ type: PaymentModeSortOrderRequest, required: false })
  @ValidateNested()
  @Type(() => PaymentModeSortOrderRequest)
  paymentMode?: PaymentModeSortOrderRequest

  @ApiProperty({ type: OrganisationSortOrderRequest, required: false })
  @ValidateNested()
  @Type(() => OrganisationSortOrderRequest)
  organisation?: OrganisationSortOrderRequest

  @ApiProperty({ type: DonationTypeSortOrderRequest, required: false })
  @ValidateNested()
  @Type(() => DonationTypeSortOrderRequest)
  donationType?: DonationTypeSortOrderRequest

  @ApiProperty({ type: DonationMethodSortOrderRequest, required: false })
  @ValidateNested()
  @Type(() => DonationMethodSortOrderRequest)
  donationMethod?: DonationMethodSortOrderRequest

  @ApiProperty({ type: DonationAssetTypeSortOrderRequest, required: false })
  @ValidateNested()
  @Type(() => DonationAssetTypeSortOrderRequest)
  donationAssetType?: DonationAssetTypeSortOrderRequest

  // contact name
  // receipt reference number
}
