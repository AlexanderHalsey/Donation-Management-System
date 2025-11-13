import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'

import { SortOrder, SortOrderEnum } from './sort-order.dto'

export class DonorSummaryDto {
  id: string
  createdAt: string
  updatedAt: string
  firstName?: string
  lastName: string
}

export class DonorDto extends DonorSummaryDto {
  email?: string
  phoneNumber?: string
  civility?: string
  streetAddress1?: string
  streetAddress2?: string
  postalCode?: string
  city?: string
  state?: string
  country?: string
  isFacilitator: boolean
  isDisabled: boolean
  donationCount: number
  donationTotalAmount: number
}

export class DonorSummaryListSortOrder {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(SortOrderEnum)
  lastName?: SortOrder
}

export class DonorListSortOrder extends DonorSummaryListSortOrder {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(SortOrderEnum)
  donationCount?: SortOrder

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(SortOrderEnum)
  donationTotalAmount?: SortOrder

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(SortOrderEnum)
  email?: SortOrder
}
