# Deployment

This section describes the current deployment process for the Donation Management System.

## Overview

Deployment is automated using GitHub Actions, which builds and deploys the application to a production server using Docker Compose.

## CI/CD Pipeline

- The GitHub Actions workflow is triggered on pushes to the main branch.
- It installs dependencies, builds .env files from GitHub secrets, and creates the Google Cloud service account file.
- Prisma client is generated using the production environment variables.
- Tests are run before deployment.
- The project is copied to the VPS using rsync over SSH.
- Docker Compose is used to pull, build, and restart containers for all services.

## Backend Deployment Details

The backend Dockerfile runs a startup script (`startup.sh`) that:

- Applies database migrations using Prisma.
- Generates SQL types and builds TypeScript files.
- Cleans up build files.
- Starts either the main application or worker process.

## Environment Variables & Secrets

- .env files for backend and frontend are generated from GitHub secrets during the workflow.
- The Google Cloud service account file is created from a base64-encoded secret.

## Customizing Deployment

- The current setup is designed for a VPS with Docker Compose and GitHub Actions.
- Users can adapt the workflow for their own infrastructure or CI/CD provider as needed.

## Post-Deployment

- Database migrations are applied automatically during container startup.
- Containers are rebuilt and restarted to ensure the latest code and configuration are used.

---
[← Previous: Testing](10_testing.md) | [Next: Troubleshooting & FAQ →](12_troubleshooting.md)
