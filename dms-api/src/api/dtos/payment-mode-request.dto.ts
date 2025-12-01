import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class PaymentModeRequest {
  @ApiProperty()
  @IsString()
  name: string
}
