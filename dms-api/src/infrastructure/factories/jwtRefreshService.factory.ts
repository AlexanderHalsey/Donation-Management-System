import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'

export const useJwtRefreshServiceFactory = async (configService: ConfigService) => {
  return new JwtService({
    secret: configService.get<string>('JWT_REFRESH_SECRET'),
    signOptions: {
      expiresIn: parseInt(configService.get<string>('JWT_REFRESH_TOKEN_LIFETIME_MS', '0'), 10),
    },
  })
}
