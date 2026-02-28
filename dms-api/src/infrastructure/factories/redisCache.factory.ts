import KeyvRedis from '@keyv/redis'
import { ConfigService } from '@nestjs/config'

export const useRedisCacheFactory = (configService: ConfigService) => ({
  stores: [
    new KeyvRedis(
      `redis://${configService.get<string>('REDIS_HOST', 'localhost')}:${parseInt(configService.get<string>('REDIS_PORT', '6379'), 10)}`,
    ),
  ],
})
