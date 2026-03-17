# Testing

This project includes tests for domain services and infrastructure consumers in the backend, and end-to-end (E2E) tests for the frontend.

## Backend Testing

**Scope:** Tests are written for domain services and infrastructure consumers, which encapsulate the business logic.

**How to run:**

- Change directory to the backend:

  ```bash
  cd dms-api
  npm run test
  ```

- This runs the backend test suite.

## Frontend Testing

**Scope:** Only end-to-end (E2E) tests are included for the frontend, using Cypress.

**How to run:**

- To run E2E tests locally with a browser:

  ```bash
  npm run cy:e2e:dev
  ```

- To run E2E tests headlessly:

  ```bash
  npm run cy:e2e
  ```

## Root-Level Testing

To run both backend and frontend tests together, run:

  ```bash
  npm run test
  ```

from the project root.

## Notes

See the respective package.json files for more test scripts and options.

---
[← Previous: Database & Migrations](09_database-migrations.md) | [Next: Deployment →](11_deployment.md)
