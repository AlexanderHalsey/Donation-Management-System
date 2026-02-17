import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { Request } from 'express'
import { JwtPayload } from '@/domain/types'

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(configService: ConfigService) {
    const jwtRefreshSecret = configService.get<string>('JWT_REFRESH_SECRET')
    if (!jwtRefreshSecret) {
      throw new Error(
        'JWT_REFRESH_SECRET_MISSING: JWT_REFRESH_SECRET environment variable is not set',
      )
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(req: Request) => req?.cookies?.refresh_token]),
      ignoreExpiration: false,
      secretOrKey: jwtRefreshSecret,
    })
  }

  async validate({ sub, username, role }: JwtPayload) {
    return { userId: sub, username, role }
  }
}
