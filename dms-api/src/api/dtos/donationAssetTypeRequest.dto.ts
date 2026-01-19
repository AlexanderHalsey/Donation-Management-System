import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsString } from 'class-validator'

export class DonationAssetTypeRequest {
  @ApiProperty()
  @IsString()
  name: string

  @ApiProperty()
  @IsBoolean()
  isDefault: boolean
}
