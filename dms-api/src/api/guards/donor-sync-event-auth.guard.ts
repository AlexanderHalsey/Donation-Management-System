import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'

import { timingSafeEqual } from 'crypto'
import * as basicAuth from 'basic-auth'

@Injectable()
export class DonorSyncEventAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    if (this.configService.get<string>('DONOR_SYNC_ENABLED') !== 'true') {
      throw new NotFoundException('Donor Sync integration is disabled')
    }

    const request = context.switchToHttp().getRequest<Request>()
    const credentials = basicAuth(request)

    if (!credentials) {
      throw new UnauthorizedException('Missing basic authentication')
    }

    const expectedUsername = this.configService.get<string>('DONOR_SYNC_USERNAME')
    const expectedPassword = this.configService.get<string>('DONOR_SYNC_PASSWORD')

    if (!expectedUsername || !expectedPassword) {
      throw new UnauthorizedException('Donor Sync credentials not configured')
    }

    try {
      const usernameMatch = timingSafeEqual(
        Buffer.from(credentials.name),
        Buffer.from(expectedUsername),
      )

      const passwordMatch = timingSafeEqual(
        Buffer.from(credentials.pass),
        Buffer.from(expectedPassword),
      )

      if (usernameMatch && passwordMatch) return true
    } catch (_err) {
      /* */
    }

    throw new UnauthorizedException('Invalid credentials')
  }
}
