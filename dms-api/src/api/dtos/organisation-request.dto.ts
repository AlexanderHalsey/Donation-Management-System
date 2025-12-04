import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class OrganisationRequest {
  @ApiProperty()
  @IsString()
  name: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  locality?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  postCode?: string

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
