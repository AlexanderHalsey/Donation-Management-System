import { Controller, Get, Inject, InternalServerErrorException } from '@nestjs/common'
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager'
import { HealthCheckService, HealthCheck, HealthIndicatorResult } from '@nestjs/terminus'
import { PrismaHealthIndicator, HttpHealthIndicator } from '@nestjs/terminus'
import { PrismaService } from '@/infrastructure'

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealthIndicator: PrismaHealthIndicator,
    private readonly prisma: PrismaService,
    private readonly httpHealthIndicator: HttpHealthIndicator,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    return this.health.check([
      async () => {
        return await Promise.race<HealthIndicatorResult>([
          (async () => {
            await this.cacheManager.set('healthcheck', 'ok', 5 * 1000)
            const value = await this.cacheManager.get('healthcheck')
            if (value !== 'ok') throw new InternalServerErrorException('Redis health check failed')
            return { redis: { status: 'up' } }
          })(),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new InternalServerErrorException('Redis health check timed out')),
              1000,
            ),
          ),
        ])
      },
      async () => {
        try {
          return await this.prismaHealthIndicator.pingCheck('database', this.prisma)
        } catch {
          throw new InternalServerErrorException('Database health check failed')
        }
      },
      async () => {
        try {
          return await this.httpHealthIndicator.pingCheck('nestjs-docs', 'https://docs.nestjs.com/')
        } catch {
          throw new InternalServerErrorException('HTTP health check failed')
        }
      },
    ])
  }
}
