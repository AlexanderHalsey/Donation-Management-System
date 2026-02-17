import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type * as runtime from '@prisma/client/runtime/client'

export interface GetDonorListItemResult {
  id: string
  firstName: string | null
  lastName: string
  updatedAt: Date
  externalId: number
  email: string | null
  isDisabled: boolean
  donationTotalAmount: number | null
  donationCount: bigint | null
  totalCount: bigint | null
}

type GetDonorListItemFunction = (
  startDate: Date | null,
  endDate: Date | null,
  donorIds: string | null,
  isDisabled: boolean | null,
  minAmount: number | null,
  maxAmount: number | null,
  orderByField: string,
  orderByDirection: string,
  limit: number,
  offset: number,
) => runtime.TypedSql<unknown[], GetDonorListItemResult>

type TypedSqlModule = {
  getDonorListItem: GetDonorListItemFunction
}

/**
 * TypedSqlService - Dynamic wrapper for Prisma generated SQL functions
 *
 * PURPOSE: This service exists to solve a build-time dependency issue with Prisma v7's typed SQL.
 *
 * PROBLEM: Prisma's `npx prisma generate --sql` requires a database connection to validate
 * SQL files and generate TypeScript types. This creates a chicken-and-egg problem during
 * Docker builds where we need to compile TypeScript before we have database access.
 *
 * SOLUTION: This service provides:
 * 1. Build-time: TypeScript compilation succeeds even when generated SQL types don't exist yet
 * 2. Runtime: Dynamically loads real Prisma-generated SQL functions when database is available
 * 3. Type safety: Explicit interfaces ensure we catch schema mismatches
 *
 * WORKFLOW:
 * - Development: Run `npx prisma generate --sql` → service loads generated functions
 * - Docker build: TypeScript compiles successfully (SQL import handled gracefully)
 * - Docker runtime: Container runs `npx prisma generate --sql` → service loads real functions
 */
@Injectable()
export class TypedSqlService {
  private readonly logger = new Logger(TypedSqlService.name)
  private typedSqlModule: TypedSqlModule | null = null

  constructor(private readonly configService: ConfigService) {
    // In development, ensure SQL files are generated to prevent runtime surprises
    if (this.configService.get<string>('NODE_ENV') !== 'production') {
      try {
        require.resolve('../../../prisma/generated/prisma/sql')
      } catch (error) {
        throw new Error(
          'Prisma SQL files not found. Please run `npx prisma generate --sql` before starting the application.',
          { cause: error },
        )
      }
    }
  }

  private async loadSqlModule(): Promise<TypedSqlModule> {
    if (!this.typedSqlModule) {
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - Module may not exist during build, handled by try/catch
        this.typedSqlModule = await import('../../../prisma/generated/prisma/sql')
      } catch (error) {
        throw new BadRequestException({
          code: 'PRISMA_SQL_MODULE_LOAD_FAILED',
          message:
            'Failed to load Prisma SQL module. Please ensure `npx prisma generate --sql` has been run.',
          cause: error,
        })
      }
    }
    // Non-null assertion required for Docker builds: TypeScript can statically analyze that
    // the SQL module path doesn't exist during build, so it knows the import will fail and
    // this.typedSqlModule remains null. The ! asserts our runtime guarantee that we never
    // reach this return when the module is actually null (exception is thrown instead).
    return this.typedSqlModule!
  }

  async getDonorListItem(
    ...args: Parameters<GetDonorListItemFunction>
  ): Promise<ReturnType<GetDonorListItemFunction>> {
    const typedSql = await this.loadSqlModule()

    return typedSql.getDonorListItem(...args)
  }
}
