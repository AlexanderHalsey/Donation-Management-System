import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmptyObject, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

import { DonorListSortOrder } from './donor.dto'
import { DonorListFilter } from './get-donor-list-request.dto'

export class GetExportDonorListRequest {
  @ApiProperty({ type: DonorListSortOrder })
  @ValidateNested()
  @IsNotEmptyObject()
  @Type(() => DonorListSortOrder)
  orderBy: DonorListSortOrder

  @ApiProperty({ type: DonorListFilter, required: false })
  @ValidateNested()
  @Type(() => DonorListFilter)
  filter?: DonorListFilter
}
