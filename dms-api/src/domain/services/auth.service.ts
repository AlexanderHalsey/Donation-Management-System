import { Inject, Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import * as bcrypt from 'bcrypt'

import { UserService } from './user.service'

import { User } from '@shared/models'
import { JwtPayload } from '../types'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly userService: UserService,
    @Inject('JWT_SERVICE') private readonly jwtService: JwtService,
    @Inject('JWT_REFRESH_SERVICE') private readonly jwtRefreshService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<User | null> {
    const user = await this.userService.findByUserName(username)
    const match = await bcrypt.compare(pass, user.passwordHash)
    if (match) {
      this.logger.log(`User ${username} authenticated successfully`)
      return this.userService.transformToModel(user)
    }
    this.logger.warn({
      code: 'AUTHENTICATION_FAILED',
      message: `Authentication failed for user ${username}`,
    })
    return null
  }

  async issueTokens(user: User): Promise<{
    accessToken: string
    refreshToken: string
  }> {
    const accessToken = this.jwtService.sign({
      username: user.username,
      sub: user.id,
      role: user.role,
    } satisfies JwtPayload)

    const refreshToken = this.jwtRefreshService.sign({
      username: user.username,
      sub: user.id,
      role: user.role,
    } satisfies JwtPayload)

    this.logger.log(`Tokens issued for user ${user.username} (ID: ${user.id})`)

    return { accessToken, refreshToken }
  }
}
