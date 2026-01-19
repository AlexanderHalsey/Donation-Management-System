import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmptyObject, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

import { DonationListSortOrder } from './donation.dto'
import { DonationListFilter } from './getDonationListRequest.dto'

export class GetExportDonationListRequest {
  @ApiProperty({ type: DonationListSortOrder })
  @ValidateNested()
  @IsNotEmptyObject()
  @Type(() => DonationListSortOrder)
  orderBy: DonationListSortOrder

  @ApiProperty({ type: DonationListFilter, required: false })
  @ValidateNested()
  @Type(() => DonationListFilter)
  filter?: DonationListFilter
}
