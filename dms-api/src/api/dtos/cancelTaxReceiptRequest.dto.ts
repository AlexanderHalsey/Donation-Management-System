import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class CancelTaxReceiptRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  canceledReason: string
}
