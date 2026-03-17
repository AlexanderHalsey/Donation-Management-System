# Troubleshooting & FAQ

## Common Issues

### 1. ESM Required Error

If you see an error about ESM (ECMAScript Modules) being required (i.e. `{ ..., code: 'ERR_REQUIRE_ESM' }`):

- Run `nvm use` to ensure you’re using the correct Node.js version (as specified in `.nvmrc`).
- If not using nvm, make sure your Node.js version is up to date.

### 2. Prisma Client Type Errors

If you encounter type errors related to the Prisma Client not being available:

- Run the following command in the `dms-api` directory:

```bash
cd dms-api && npx prisma generate --sql
```

- The `--sql` flag is required to generate special types for the typedsql infrastructure service, which is used by the donor service and required to run the backend.

### 3. Missing Environment Variables

If the app fails to start or behaves unexpectedly, check your environment variables:

- Ensure you have a `.env` file in both `dms-api` and `dms-frontend` directories for local development.
- Additional `.env` files may be needed depending on which Docker Compose file you use (e.g., `docker-compose.demo.yml`, `docker-compose.prod.yml`, etc.).
- Refer to the [Configuration](06_configuration.md) section for required variables.

## Need More Help?

If you encounter any other issues, please open an issue on GitHub for support:

- [GitHub Issues](https://github.com/AlexanderHalsey/Donation-Management-System/issues)

---

[← Previous: Deployment](11_deployment.md) | [Next: Contributing →](13_contributing.md)
