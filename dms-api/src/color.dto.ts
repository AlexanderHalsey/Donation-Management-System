import { ApiProperty } from '@nestjs/swagger'

export class ColorResponseDto {
  @ApiProperty()
  color: string
}
