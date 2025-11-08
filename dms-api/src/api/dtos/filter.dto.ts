import { ApiProperty } from '@nestjs/swagger'

import { IsBoolean, IsDate, IsNumber, IsOptional } from 'class-validator'
import { Type } from 'class-transformer'

export class DateTimeFilter {
  @ApiProperty({ required: false })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  lte?: Date

  @ApiProperty({ required: false })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  gte?: Date
}

export class UuidFilter {
  @ApiProperty({ required: false })
  @IsOptional()
  equals?: string
}

export class FloatFilter {
  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  equals?: number

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  lte?: number

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  gte?: number
}

export class BoolFilter {
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  equals?: boolean
}
