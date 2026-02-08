import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class OrganisationRequest {
  @ApiProperty()
  @IsString()
  name: string

  @ApiProperty()
  @IsBoolean()
  isTaxReceiptEnabled: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  streetAddress?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  postalCode?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  logoId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  object?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  objectDescription?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  signatoryName?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  signatoryPosition?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  signatureId?: string
}
