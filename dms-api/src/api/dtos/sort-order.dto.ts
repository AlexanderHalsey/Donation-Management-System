import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsOptional, ValidateNested } from 'class-validator'

enum SortOrderEnum {
  ASC = 'asc',
  DESC = 'desc',
}
type SortOrder = 'asc' | 'desc'

export class NameSortOrder {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(SortOrderEnum)
  name?: SortOrder
}

export class PaymentModeSortOrder extends NameSortOrder {}
export class OrganisationSortOrder extends NameSortOrder {}
export class DonationTypeSortOrder extends NameSortOrder {}
export class DonationMethodSortOrder extends NameSortOrder {}
export class DonationAssetTypeSortOrder extends NameSortOrder {}

export class DonationSortOrder {
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

  @ApiProperty({ type: PaymentModeSortOrder, required: false })
  @ValidateNested()
  @Type(() => PaymentModeSortOrder)
  paymentMode?: PaymentModeSortOrder

  @ApiProperty({ type: OrganisationSortOrder, required: false })
  @ValidateNested()
  @Type(() => OrganisationSortOrder)
  organisation?: OrganisationSortOrder

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

  // contact name
  // receipt reference number
}
