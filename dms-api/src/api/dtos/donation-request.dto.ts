import { ApiProperty } from '@nestjs/swagger'
import { IsDate, IsNumber, IsUUID } from 'class-validator'
import { Type } from 'class-transformer'

export class DonationRequest {
  @ApiProperty()
  @IsUUID('4')
  donorId: string

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  donatedAt: Date

  @ApiProperty()
  @IsNumber()
  amount: number

  @ApiProperty()
  @IsUUID('4')
  organisationId: string

  @ApiProperty()
  @IsUUID('4')
  donationTypeId: string

  @ApiProperty()
  @IsUUID('4')
  paymentModeId: string

  @ApiProperty()
  @IsUUID('4')
  donationMethodId: string

  @ApiProperty()
  @IsUUID('4')
  donationAssetTypeId: string
}
