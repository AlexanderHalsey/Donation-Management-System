import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'

export const useJwtServiceFactory = async (configService: ConfigService) => {
  return new JwtService({
    secret: configService.get<string>('JWT_SECRET'),
    signOptions: { expiresIn: configService.get<number>('JWT_TOKEN_LIFETIME_MS') },
  })
}
