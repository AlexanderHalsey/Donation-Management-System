import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'

import { SortOrder, SortOrderEnum } from './sort-order.dto'

export class DonorRefDto {
  id: string
  lastName: string
  firstName?: string
}

export class DonorListItemDto extends DonorRefDto {
  updatedAt: string
  externalId: number
  donationCount: number
  donationTotalAmount: number
  email?: string
}

export class DonorDto extends DonorListItemDto {
  createdAt: string
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
}

export class DonorRefSortOrder {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(SortOrderEnum)
  lastName?: SortOrder
}

export class DonorListSortOrder extends DonorRefSortOrder {
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
