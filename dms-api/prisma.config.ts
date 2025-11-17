import path from 'node:path'
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: path.join('prisma', 'models'),
  migrations: {
    path: path.join('prisma', 'migrations'),
    seed: 'ts-node --transpile-only prisma/seed.ts',
  },
  typedSql: {
    path: path.join('prisma', 'sql'),
  },
  engine: 'classic',
  datasource: {
    url: env('DATABASE_URL'),
  },
})
