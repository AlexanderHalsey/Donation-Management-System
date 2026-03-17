# Database & Migrations

This section describes how to manage the database schema, migrations, and seed data using Prisma.

## Location

- **Prisma schema:** `dms-api/prisma/schema.prisma`
- **Migration files:** `dms-api/prisma/migrations/`
- **Seed script:** `dms-api/prisma/seed.ts`

## Creating a Migration

1. Make changes to the Prisma schema.
2. Generate a new migration:

    ```bash
    cd dms-api
    npx prisma migrate dev
    ```

3. Review the generated migration files and SQL.
4. Commit the migration files along with any related business logic changes.

## Resetting and Seeding the Database (Development)

- To reset the local database and reseed with test data:

    ```bash
    npx prisma migrate reset --force && npx prisma db seed
    ```

- This will run all migrations and then execute the seed script.
- Update `dms-api/prisma/seed.ts` if the schema or business logic changes require new or updated seed data.

## Applying Migrations in Production

- Migrations are applied automatically during deployment. See the [Deployment section](11_deployment.md) for details.

## Best Practices

- Always review generated migration SQL before committing.
- Keep the schema, migrations, and business logic in sync.
- Update the seed script as needed when the schema changes.

---

[← Previous: Backend Guide](08_backend-guide.md) | [Next: Testing →](10_testing.md)
