import { ApiProperty } from '@nestjs/swagger'
import { IsInt } from 'class-validator'

export class PaginationRequest {
  @ApiProperty()
  @IsInt()
  page: number

  @ApiProperty()
  @IsInt()
  pageSize: number
}

export class PaginationDto {
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}
