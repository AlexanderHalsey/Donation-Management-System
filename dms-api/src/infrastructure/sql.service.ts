import { Injectable } from '@nestjs/common'
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
  minAmount: number | null,
  maxAmount: number | null,
  orderByField: string,
  orderByDirection: string,
  limit: number,
  offset: number,
) => runtime.TypedSql<unknown[], GetDonorListItemResult>

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
  private typedSqlFunctions: { getDonorListItem: GetDonorListItemFunction } | null = null

  constructor() {
    // In development, ensure SQL files are generated to prevent runtime surprises
    if (process.env.NODE_ENV !== 'production') {
      try {
        // Use the exact same path that the dynamic import uses
        require.resolve('../../prisma/generated/prisma/sql')
      } catch (error) {
        throw new Error(
          `❌ TypedSQL files not found!\n\n` +
            `You must generate SQL types before running the dev server:\n` +
            `  npx prisma generate --sql\n\n` +
            `Then restart your dev server.\n\n` +
            `Error details: ${error}`,
        )
      }
    }
  }

  private async loadSqlFunctions(): Promise<{ getDonorListItem: GetDonorListItemFunction }> {
    if (!this.typedSqlFunctions) {
      try {
        // Try relative path from dist to the generated files
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - Module may not exist during build, handled by try/catch
        const typedSqlModule = await import('../../prisma/generated/prisma/sql')
        this.typedSqlFunctions = typedSqlModule
      } catch (error) {
        throw new Error(
          `SQL functions not available. Make sure to run "npx prisma generate --sql" first. Error: ${error}`,
        )
      }
    }
    return this.typedSqlFunctions!
  }

  async getDonorListItem(
    ...args: Parameters<GetDonorListItemFunction>
  ): Promise<ReturnType<GetDonorListItemFunction>> {
    const typedSql = await this.loadSqlFunctions()

    // Return the function result directly for use with $queryRawTyped
    return typedSql.getDonorListItem(...args)
  }
}
