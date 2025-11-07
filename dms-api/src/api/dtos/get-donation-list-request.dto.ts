import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmptyObject, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

import { PaginationRequest } from './pagination.dto'
import { DonationSortOrder } from './sort-order.dto'

export class DonationPaginationRequest extends PaginationRequest {
  @ApiProperty({ type: DonationSortOrder, required: false })
  @ValidateNested()
  @Type(() => DonationSortOrder)
  orderBy?: DonationSortOrder
}

export class GetDonationListRequest {
  @ApiProperty({ type: DonationPaginationRequest })
  @ValidateNested()
  @IsNotEmptyObject()
  @Type(() => DonationPaginationRequest)
  pagination: DonationPaginationRequest
}
