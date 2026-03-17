# Configuration

This project relies on environment variables for backend and frontend services. Proper setup is required for local development and production.

## Backend (`dms-api`) Environment Variables

| Variable                        | Required     | Description / Usage                                                                                                       |
|:-------------------------------:|:------------:|:----------------------------------------------------------------------------------------------------                      |
| DATABASE_URL                    | Yes          | PostgreSQL connection string. Use local (e.g., `postgres://postgres:postgres@db:5432/postgres`) or external DB.           |
| REDIS_HOST                      | Yes          | Redis host for caching and queue jobs. Local: `localhost` or external.                                                    |
| REDIS_PORT                      | Yes          | Redis port for caching and queue jobs. Local: `6379` or external.                                                         |
| TAX_RECEIPT_TEMPLATE            | Yes          | Options: `cerfa` (context-specific) or `demo` (general use).                                                              |
| TAX_RECEIPT_RELEASE_MONTH_INDEX | Optional     | Month index for annual tax receipt processing. Default: `0`.                                                              |
| TAX_RECEIPT_RELEASE_DAY         | Optional     | Day for annual tax receipt processing. Default: `0`.                                                                      |
| DONOR_SYNC_ENABLED              | Yes          | Enables external donor sync service. Set to `false` unless needed.                                                        |
| DONOR_SYNC_USERNAME             | Conditional  | Required if donor sync is enabled.                                                                                        |
| DONOR_SYNC_PASSWORD             | Conditional  | Required if donor sync is enabled.                                                                                        |
| EMAIL_ENABLED                   | Yes          | Enables email sending for bulk annual receipts.                                                                           |
| EMAIL_TEST_MODE                 | Optional     | Enables test mode for emails.                                                                                             |
| EMAIL_TEMPLATE_STORAGE_KEY      | Conditional  | Required if emails are enabled. Storage key for email template in GCS.                                                    |
| SMTP_USER                       | Conditional  | Required if emails are enabled. SMTP user for sending emails.                                                             |
| SMTP_SENDER                     | Conditional  | Required if emails are enabled. SMTP sender address.                                                                      |
| SMTP_PASS                       | Conditional  | Required if emails are enabled. SMTP password.                                                                            |
| SMTP_REPLY_TO                   | Conditional  | Required if emails are enabled. SMTP reply-to address.                                                                    |
| AUTH_ENABLED                    | Yes          | Enables authentication. If `false`, app is read-only.                                                                     |
| JWT_SECRET                      | Conditional  | Required if auth is enabled. JWT secret for authentication.                                                               |
| JWT_TOKEN_LIFETIME_MS           | Conditional  | Required if auth is enabled. JWT token lifetime in ms.                                                                    |
| JWT_REFRESH_SECRET              | Conditional  | Required if auth is enabled. JWT refresh secret.                                                                          |
| JWT_REFRESH_TOKEN_LIFETIME_MS   | Conditional  | Required if auth is enabled. JWT refresh token lifetime in ms.                                                            |
| REFRESH_TOKEN_COOKIE_PATH       | Optional     | Needed for production (e.g., `/api/auth`), default for development.                                                       |
| LOGTAIL_SOURCE_TOKEN            | Conditional  | Required for production logtail integration.                                                                              |
| LOGTAIL_INGESTING_HOST          | Conditional  | Required for production logtail integration.                                                                              |
| GOOGLE_APPLICATION_CREDENTIALS  | Yes          | Path to Google Cloud credentials file. See below for instructions.                                                        |
| GCS_BUCKET_NAME                 | Yes          | Google Cloud Storage bucket name for app.                                                                                 |
| GCS_BACKUP_BUCKET_NAME          | Yes          | Google Cloud Storage bucket name for backups.                                                                             |

## Frontend (`dms-frontend`) Environment Variables

| Variable                            | Required     | Description / Usage                                                                                  |
|:-----------------------------------:|:------------:|:-----------------------------------------------------------------------------------------------------|
| VITE_API_BASE_URL                   | Yes          | Backend API base URL.                                                                                |
| VITE_MOCK_API_HOST                  | Optional     | Mock API host for testing.                                                                           |
| VITE_AUTH_ENABLED                   | Yes          | Enables authentication in frontend.                                                                  |
| VITE_DONOR_EXTERNAL_PROVIDER_ENABLED| Yes          | Enables external donor provider integration (linked to donor sync events).                           |
| VITE_DONOR_EXTERNAL_PROVIDER_NAME   | Conditional  | Required if external provider is enabled. Name of external donor provider.                           |
| VITE_DONOR_EXTERNAL_PROVIDER_URL    | Conditional  | Required if external provider is enabled. URL of external donor provider.                            |

## Docker Compose

There are two ways to use Docker in this project:

### 1. Local Database & Redis Only

For local development, you can quickly start PostgreSQL and Redis containers:

```bash
cd dms-api && docker-compose -p postgres_and_redis up
```

This is recommended for most development and testing scenarios. You’ll run the backend and frontend locally, connecting to these containers.

#### Tear Down Containers and Remove Volumes

To stop and remove containers, including associated volumes:

```bash
docker-compose -p postgres_and_redis down -v
```

### 2. Full Containerized Application

The root directory includes multiple Docker Compose files for fully containerizing the app:

- `docker-compose.demo.yml` uses `.env.demo` in both `dms-api` and `dms-frontend`. (Note: This file expects an external database instance; it does not start a local DB container.)
- `docker-compose.prod.yml` uses `.env.prod` or `.env.production` as appropriate. (Note: This file expects an external database instance; it does not start a local DB container.)
- `docker-compose.test.yml` uses `.env.test`.

These compose files build and run all services (backend, frontend, redis, etc.) in containers, as used for deployment. Demo and prod builds expect an external database; only the test compose file may include a local DB instance.
When using a specific Docker Compose file, ensure the corresponding `.env` files exist in each service directory.

## Google Cloud Service Account

To use Google Cloud features, you need a `serviceAccount.json` file:

- Go to the Google Cloud Console.
- Navigate to IAM & Admin > Service Accounts.
- Create a new service account or select an existing one.
- Generate a new key (JSON format) and download it.
- Place the file in your project and reference its path in `GOOGLE_APPLICATION_CREDENTIALS`.

## Tips

- Ensure all required variables are set for your environment.
- Refer to the [Troubleshooting & FAQ](13_troubleshooting.md) section for common configuration issues.
- For production, set variables carefully and securely (e.g., via GitHub Actions secrets).

---

[← Previous: Usage Guides](05_usage-guides.md) | [Next: Frontend Guide →](07_frontend-guide.md)
