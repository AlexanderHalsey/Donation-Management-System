import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmptyObject, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

import { DonationListSortOrder } from './donation.dto'

import { PaginationRequest } from './pagination.dto'

export class DonationListPaginationRequest extends PaginationRequest {
  @ApiProperty({ type: DonationListSortOrder, required: false })
  @ValidateNested()
  @Type(() => DonationListSortOrder)
  orderBy?: DonationListSortOrder
}


  @ValidateNested()
}

export class GetDonationListRequest {
  @ApiProperty({ type: DonationListPaginationRequest })
  @ValidateNested()
  @IsNotEmptyObject()
  @Type(() => DonationListPaginationRequest)
  pagination: DonationListPaginationRequest
}
