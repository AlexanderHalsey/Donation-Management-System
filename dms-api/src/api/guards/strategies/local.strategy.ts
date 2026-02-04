import { Injectable, UnauthorizedException } from '@nestjs/common'

import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'

import { AuthService } from '@/domain'

import { User } from '@shared/models'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super()
  }

  async validate(username: string, password: string): Promise<User> {
    const user = await this.authService.validateUser(username, password)
    if (!user) throw new UnauthorizedException()
    return user
  }
}
