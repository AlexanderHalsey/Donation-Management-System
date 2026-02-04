import { Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import * as bcrypt from 'bcrypt'

import { UserService } from './user.service'

import { User } from '@shared/models'
import { JwtPayload } from '../types'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    @Inject('JWT_SERVICE') private readonly jwtService: JwtService,
    @Inject('JWT_REFRESH_SERVICE') private readonly jwtRefreshService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<User | null> {
    const user = await this.userService.findByUserName(username)
    const match = await bcrypt.compare(pass, user.passwordHash)
    if (match) {
      return this.userService.transformToModel(user)
    }
    return null
  }

  async issueTokens(user: User): Promise<{
    accessToken: string
    refreshToken: string
  }> {
    return {
      accessToken: this.jwtService.sign({
        username: user.username,
        sub: user.id,
      } satisfies JwtPayload),
      refreshToken: this.jwtRefreshService.sign({
        username: user.username,
        sub: user.id,
      } satisfies JwtPayload),
    }
  }
}
