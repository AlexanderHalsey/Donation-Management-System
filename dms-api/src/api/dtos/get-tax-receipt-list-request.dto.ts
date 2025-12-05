import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmptyObject, IsOptional, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

import { TaxReceiptListSortOrder, TaxReceiptTypeEnum, type TaxReceiptType } from './tax-receipt.dto'

import { PaginationRequest } from './pagination.dto'
import { BoolFilter, DateTimeFilter, UuidFilter } from './filter.dto'

export class TaxReceiptListPaginationRequest extends PaginationRequest {
  @ApiProperty({ type: TaxReceiptListSortOrder, required: false })
  @ValidateNested()
  @Type(() => TaxReceiptListSortOrder)
  orderBy?: TaxReceiptListSortOrder
}

export class TaxReceiptTypeFilter {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(TaxReceiptTypeEnum)
  equals?: TaxReceiptType
}

export class TaxReceiptListFilter {
  @ApiProperty({ type: UuidFilter, required: false })
  @ValidateNested()
  @Type(() => UuidFilter)
  donorId?: UuidFilter

  @ApiProperty({ type: DateTimeFilter, required: false })
  @ValidateNested()
  @Type(() => DateTimeFilter)
  createdAt?: DateTimeFilter

  @ApiProperty({ type: TaxReceiptTypeFilter, required: false })
  @ValidateNested()
  @Type(() => TaxReceiptTypeFilter)
  type?: TaxReceiptTypeFilter

  @ApiProperty({ type: BoolFilter, required: false })
  @ValidateNested()
  @Type(() => BoolFilter)
  isCanceled?: BoolFilter
}

export class GetTaxReceiptListRequest {
  @ApiProperty({ type: TaxReceiptListPaginationRequest })
  @ValidateNested()
  @IsNotEmptyObject()
  @Type(() => TaxReceiptListPaginationRequest)
  pagination: TaxReceiptListPaginationRequest

  @ApiProperty({ type: TaxReceiptListFilter, required: false })
  @ValidateNested()
  @Type(() => TaxReceiptListFilter)
  filter?: TaxReceiptListFilter
}
