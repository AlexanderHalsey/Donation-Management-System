import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { JwtPayload } from '@/domain/types'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    const authEnabled = configService.getOrThrow('AUTH_ENABLED') !== 'false'
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: !authEnabled,
      secretOrKey: authEnabled ? configService.getOrThrow<string>('JWT_SECRET') : 'demo-secret',
    })
  }

  async validate({ sub, username, role }: JwtPayload) {
    return { userId: sub, username, role }
  }
}
