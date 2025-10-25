## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## prisma

Schema compilation: `npx prisma generate`

Migration: `npx prisma migrate`

DB connection: `psql "$DATABASE_URL"`

you might need these tools in the dockerfile (maybe it comes with the postgresql image ?)

Backup: `pg_dump "$DATABASE_URL" --format=custom --clean --if-exists --no-owner --no-acl > backup.dump`

Restore: `pg_restore -d "$DATABASE_URL" --clean --if-exists --no-owner --no-privileges backup.dump`

## Database migrations

When developing locally, the docker compose that spins up a database will automatically apply the necessary migrations to the database. When running on a beta/production environment
migrations are used. Every time a schema change is deployed, a new migration
must be generated. Once deployed it will be applied automatically.
