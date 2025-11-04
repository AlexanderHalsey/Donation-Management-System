import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmptyObject, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

import { PaginationRequest } from './pagination.dto'
import { DonationSortOrderRequest } from './sort-order.dto'

export class DonationPaginationRequest extends PaginationRequest {
  @ApiProperty({ type: DonationSortOrderRequest, required: false })
  @ValidateNested()
  @Type(() => DonationSortOrderRequest)
  orderBy?: DonationSortOrderRequest
}

export class GetDonationListRequest {
  @ApiProperty({ type: DonationPaginationRequest })
  @ValidateNested()
  @IsNotEmptyObject()
  @Type(() => DonationPaginationRequest)
  pagination: DonationPaginationRequest
}
