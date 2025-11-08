import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmptyObject, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

import { DonationListSortOrder } from './donation.dto'

import { PaginationRequest } from './pagination.dto'
import { BoolFilter, DateTimeFilter, FloatFilter, UuidFilter } from './filter.dto'

export class DonationListPaginationRequest extends PaginationRequest {
  @ApiProperty({ type: DonationListSortOrder, required: false })
  @ValidateNested()
  @Type(() => DonationListSortOrder)
  orderBy?: DonationListSortOrder
}

export class DonationListFilterRequest {
  @ApiProperty({ type: UuidFilter, required: false })
  @ValidateNested()
  @Type(() => UuidFilter)
  contactId?: UuidFilter

  @ApiProperty({ type: DateTimeFilter, required: false })
  @ValidateNested()
  @Type(() => DateTimeFilter)
  donatedAt?: DateTimeFilter

  @ApiProperty({ type: FloatFilter, required: false })
  @ValidateNested()
  @Type(() => FloatFilter)
  amount?: FloatFilter

  @ApiProperty({ type: UuidFilter, required: false })
  @ValidateNested()
  @Type(() => UuidFilter)
  paymentModeId?: UuidFilter

  @ApiProperty({ type: UuidFilter, required: false })
  @ValidateNested()
  @Type(() => UuidFilter)
  organisationId?: UuidFilter

  @ApiProperty({ type: UuidFilter, required: false })
  @ValidateNested()
  @Type(() => UuidFilter)
  donationTypeId?: UuidFilter

  @ApiProperty({ type: BoolFilter, required: false })
  @ValidateNested()
  @Type(() => BoolFilter)
  isDisabled?: BoolFilter
}

export class GetDonationListRequest {
  @ApiProperty({ type: DonationListPaginationRequest })
  @ValidateNested()
  @IsNotEmptyObject()
  @Type(() => DonationListPaginationRequest)
  pagination: DonationListPaginationRequest

  @ApiProperty({ type: DonationListFilterRequest, required: false })
  @ValidateNested()
  @Type(() => DonationListFilterRequest)
  filter?: DonationListFilterRequest
}
