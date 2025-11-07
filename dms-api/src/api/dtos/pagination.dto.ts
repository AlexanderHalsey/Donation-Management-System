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

/**
 * Generic pagination DTO
 * @template T - The type of the orderBy property
 */
export class PaginationDto<T> {
  totalCount: number
  page: number
  pageSize: number
  orderBy?: T
}
