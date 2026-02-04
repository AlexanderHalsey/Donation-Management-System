import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') implements CanActivate {
  constructor(private readonly configService: ConfigService) {
    super()
  }

  canActivate(context: ExecutionContext): ReturnType<CanActivate['canActivate']> {
    if (this.configService.get('AUTH_ENABLED') === 'false') {
      return true
    }
    return super.canActivate(context)
  }
}
