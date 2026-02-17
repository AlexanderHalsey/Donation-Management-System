import { ConfigService } from '@nestjs/config'

export const useBullMqFactory = (configService: ConfigService) => ({
  connection: {
    host: configService.get('REDIS_HOST', 'localhost'),
    port: configService.get('REDIS_PORT', 6379),
    retryDelayOnFailover: 1000,
  },
})
