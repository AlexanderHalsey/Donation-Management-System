import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'

export const useJwtServiceFactory = async (configService: ConfigService) => {
  return new JwtService({
    secret: configService.get<string>('JWT_SECRET'),
    signOptions: {
      expiresIn: parseInt(configService.get<string>('JWT_TOKEN_LIFETIME_MS', '0'), 10),
    },
  })
}
