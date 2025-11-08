import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'

export enum SortOrderEnum {
  ASC = 'asc',
  DESC = 'desc',
}
export type SortOrder = 'asc' | 'desc'

export class NameSortOrder {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(SortOrderEnum)
  name?: SortOrder
}
