import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsString } from 'class-validator'

export enum UserRoleEnum {
  ADMIN = 'admin',
  STANDARD = 'standard',
}
export type UserRole = 'admin' | 'standard'

export class UserRequest {
  @ApiProperty()
  @IsString()
  username: string

  @ApiProperty()
  @IsString()
  password: string

  @ApiProperty()
  @IsEnum(UserRoleEnum)
  role: UserRole
}
