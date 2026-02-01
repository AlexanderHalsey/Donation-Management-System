import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class BulkAnnualTaxReceiptRequest {
  @ApiProperty({ type: Array<string> })
  @IsString({ each: true })
  donorIds: string[]
}
