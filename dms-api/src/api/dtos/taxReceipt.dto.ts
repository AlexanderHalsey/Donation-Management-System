import { ApiProperty } from '@nestjs/swagger'

import { Type } from 'class-transformer'
import { IsEnum, IsOptional, ValidateNested } from 'class-validator'

import { DonorRefDto, DonorRefSortOrder } from './donor.dto'
import { NameSortOrder, SortOrderEnum, type SortOrder } from './sortOrder.dto'

export enum TaxReceiptTypeEnum {
  ANNUAL = 'ANNUAL',
  INDIVIDUAL = 'INDIVIDUAL',
}
export type TaxReceiptType = 'ANNUAL' | 'INDIVIDUAL'

export enum TaxReceiptStatusEnum {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  FAILED = 'FAILED',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
}
export type TaxReceiptStatus = 'PENDING' | 'PROCESSING' | 'FAILED' | 'COMPLETED' | 'CANCELED'

export class TaxReceiptListItemDto {
  id: string
  createdAt: string
  updatedAt: string
  receiptNumber: number
  donor: DonorRefDto
  type: TaxReceiptType
  file?: {
    id: string
    name: string
  }
  status: TaxReceiptStatus
  canceledAt?: string
  canceledReason?: string
}

export class TaxReceiptFileSortOrder extends NameSortOrder {}

export class TaxReceiptListSortOrder {
  @ApiProperty({ type: DonorRefSortOrder, required: false })
  @ValidateNested()
  @Type(() => DonorRefSortOrder)
  donor?: DonorRefSortOrder

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(SortOrderEnum)
  createdAt?: SortOrder

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(SortOrderEnum)
  receiptNumber?: SortOrder

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(SortOrderEnum)
  type?: SortOrder

  @ApiProperty({ type: TaxReceiptFileSortOrder, required: false })
  @ValidateNested()
  @Type(() => TaxReceiptFileSortOrder)
  file?: TaxReceiptFileSortOrder
}
