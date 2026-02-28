import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { Request } from 'express'

@Injectable()
export class DemoWriteLockGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>()

    const writeEnabled = this.configService.get<string>('AUTH_ENABLED') === 'true'

    const isWritePath =
      ['PUT', 'PATCH', 'DELETE'].includes(request.method) ||
      (request.method === 'POST' &&
        !(
          request.path.endsWith('filtered-list') ||
          request.path.match(/.*\/exports\/(donations|donors)\/csv$/)
        ))

    if (!writeEnabled && isWritePath) {
      throw new ForbiddenException('Write operations are disabled in demo mode.')
    }
    return true
  }
}
