import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsString, IsUUID } from 'class-validator'

export class DonationTypeRequest {
  @ApiProperty()
  @IsString()
  name: string

  @ApiProperty()
  @IsUUID()
  organisationId: string

  @ApiProperty()
  @IsBoolean()
  isTaxReceiptEnabled: boolean
}
