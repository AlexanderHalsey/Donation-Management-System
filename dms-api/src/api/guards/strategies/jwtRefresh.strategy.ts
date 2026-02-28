import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { Request } from 'express'
import { JwtPayload } from '@/domain/types'
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(configService: ConfigService) {
    const authEnabled = configService.getOrThrow('AUTH_ENABLED') !== 'false'
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(req: Request) => req?.cookies?.refresh_token]),
      ignoreExpiration: !authEnabled,
      secretOrKey: authEnabled
        ? configService.getOrThrow<string>('JWT_REFRESH_SECRET')
        : 'demo-refresh-secret',
    })
  }

  async validate({ sub, username, role }: JwtPayload) {
    return { userId: sub, username, role }
  }
}
