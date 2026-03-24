import { Controller, Get, Inject, InternalServerErrorException } from '@nestjs/common'
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager'
import { HealthCheckService, HealthCheck, HealthIndicatorResult } from '@nestjs/terminus'
import { PrismaHealthIndicator } from '@nestjs/terminus'
import { PrismaService } from '@/infrastructure'

const DB_TIMEOUT_MS = 5000
const REDIS_TIMEOUT_MS = 3000
const FAILURE_THRESHOLD = 10

type ServiceHealthKey = 'redis' | 'database'

@Controller('health')
export class HealthController {
  private readonly failures: Record<ServiceHealthKey, number> = {
    redis: 0,
    database: 0,
  }

  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealthIndicator: PrismaHealthIndicator,
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  private withThreshold<T extends ServiceHealthKey>(
    key: T,
    check: () => Promise<HealthIndicatorResult>,
  ): () => Promise<HealthIndicatorResult> {
    return async () => {
      try {
        const result = await check()
        this.failures[key] = 0
        return result
      } catch {
        this.failures[key]++
        if (this.failures[key] >= FAILURE_THRESHOLD) {
          throw new InternalServerErrorException(
            `${key} health check failed after ${FAILURE_THRESHOLD} attempts`,
          )
        }
        return {
          [key]: { status: 'up', note: 'Transient failure, will retry' },
        }
      }
    }
  }

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      this.withThreshold('redis', () => {
        return Promise.race<HealthIndicatorResult>([
          (async () => {
            await this.cacheManager.set('healthcheck', 'ok', 5 * 1000)
            const value = await this.cacheManager.get('healthcheck')
            if (value !== 'ok') throw new InternalServerErrorException('Redis health check failed')
            return { redis: { status: 'up' } }
          })(),
          new Promise((_, reject) => setTimeout(reject, REDIS_TIMEOUT_MS)),
        ])
      }),
      this.withThreshold('database', () =>
        this.prismaHealthIndicator.pingCheck('database', this.prisma, {
          timeout: DB_TIMEOUT_MS,
        }),
      ),
    ])
  }
}
