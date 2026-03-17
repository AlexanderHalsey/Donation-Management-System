# Backend Guide

This section provides an overview of the backend structure, key modules, and development practices.

## Running and Building the Backend

- To run the backend locally:
  
  ```bash
  cd dms-api
  npm run start:dev
  ```

- To build the backend:

  ```bash
  npm run build
  ```

## Modules and Layered Structure

All backend code is located in the `dms-api/src` directory. The application is organized using a layered architecture:

- **App module**: The main entry point for the HTTP API. Imports the api, domain, and infrastructure layers to handle web requests and responses.
- **Worker module**: Handles background jobs and tasks. Imports the domain and infrastructure layers, but does not use the api layer.

### Layers

- **api layer**: Contains all HTTP-related logic, including controllers, converters, decorators, DTOs, filters, and guards. Used only by the app module.
- **domain layer**: Contains the core business logic, organized by concern (e.g., donation service, tax receipt service). Both the app and worker modules depend on these services to ensure business rules are consistently applied across HTTP and background jobs. Also includes helpers, schemas, and exception files.

  **Main services and their responsibilities:**
  - **AuthService**: Authenticates users and issues JWTs.
  - **DonationService**: Handles donation-related business logic.
  - **DonationAssetTypeService, DonationMethodService, DonationTypeService, OrganisationService, PaymentModeService**: Manage admin objects attached to donations, providing context. Only admin users can modify these.
  - **ExportService**: Provides export lists of donors or donations, which can be exported as CSVs.
  - **FileService**: Manages file metadata and connects to GCSService for external file storage.
  - **PDFRenderService, TaxReceiptGeneratorService**: Used for generating tax receipt files, called by the TaxReceiptService.
  - **TaxReceiptService**: Handles tax receipt generation and related rules.

- **infrastructure layer**: Manages infrastructure concerns such as factories, services, and tasks and consumers used by the worker. Consumers in this layer contribute to core business logic by processing jobs and events.

  **Main infrastructure services and their responsibilities:**
  - **BullMQService**: Manages job queues and background processing.
  - **PrismaService**: Provides database access and ORM functionality.
  - **SMTPService**: Handles email sending.
  - **GCSService**: Manages interactions with Google Cloud Storage.
  - **Factories**: Provide object creation and dependency management.
  - **Consumers**: Process jobs/events and implement business logic for background tasks.
  - **Tasks**: Define scheduled background jobs.

### Adding / Updating Functionality

- **HTTP endpoints**: Add controllers and related logic in the api layer.
- **domain services**: When adding or updating domain functionality, ensure each service encapsulates its own business logic and maintains clear boundaries between concerns.
- **background jobs**: Configure jobs via the BullMQService. Domain services can call BullMQService to add jobs. To process jobs, add or update consumers in the infrastructure consumers section.

### Test directories

Exist in both domain and infrastructure layers. See the [Testing](10_testing.md) section for details.

---
[← Previous: Frontend Guide](07_frontend-guide.md) | [Next: Database & Migrations →](09_database-migrations.md)
