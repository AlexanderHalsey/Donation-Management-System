import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsUUID } from 'class-validator'

export class DonationTypeRequest {
  @ApiProperty()
  @IsString()
  name: string

  @ApiProperty()
  @IsUUID()
  organisationId: string
}
