import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmptyObject, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

import { DonorListSortOrder } from './donor.dto'

import { PaginationRequest } from './pagination.dto'
import { DateTimeFilter, FloatFilter, UuidFilter } from './filter.dto'

export class DonorListPaginationRequest extends PaginationRequest {
  @ApiProperty({ type: DonorListSortOrder, required: false })
  @ValidateNested()
  @Type(() => DonorListSortOrder)
  orderBy?: DonorListSortOrder
}

export class DonorListFilter {
  @ApiProperty({ type: UuidFilter, required: false })
  @ValidateNested()
  @Type(() => UuidFilter)
  id?: UuidFilter

  @ApiProperty({ type: DateTimeFilter, required: false })
  @ValidateNested()
  @Type(() => DateTimeFilter)
  donatedAt?: DateTimeFilter

  @ApiProperty({ type: FloatFilter, required: false })
  @ValidateNested()
  @Type(() => FloatFilter)
  totalAmount?: FloatFilter
}

export class GetDonorListRequest {
  @ApiProperty({ type: DonorListPaginationRequest })
  @ValidateNested()
  @IsNotEmptyObject()
  @Type(() => DonorListPaginationRequest)
  pagination: DonorListPaginationRequest

  @ApiProperty({ type: DonorListFilter, required: false })
  @ValidateNested()
  @Type(() => DonorListFilter)
  filter?: DonorListFilter
}
