# Frontend Guide

This section provides an overview of the frontend structure, key modules, and development practices.

## Running and Building the Frontend

- To run the frontend locally:
  
  ```bash
  cd dms-frontend
  npm run dev
  ```

- To build the frontend:
  
  ```bash
  npm run build
  ```

## Entry Point and Core Setup

- The main entry point initializes Pinia (state management), the router, Quasar (UI framework), and Vue I18n (internationalization) with translation files.

## Project Structure

- **apis/**: Contains logic for connecting to the backend API.
- **components/**: Houses UI components that inherit from Quasar, as well as reusable and custom global components.
- **layouts/**: Defines the panel layout and the shared "page" component used across all pages.
- **stores/**: Contains Pinia stores, which fetch data from the apis directory and store it globally for reuse across features.
- **router.ts**: Defines application routes and enforces access control (general and admin access).
- **features/**: Splits application functionality into feature modules. Each feature typically includes:
  - **pages/**: Uses the layout "page" component to render feature-specific pages.
  - **components/**: Contains smaller, feature-specific components (forms, tabs, dialogs, summaries, etc.) used by pages.
  - **zod schemas**: Defines form validation schemas and exports form data types for use elsewhere in the app.
- **locales/**: Stores translation files (e.g., English and French) and their types for use with Vue I18n.

## Adding New Functionality

- **New features**: Add a new directory under features/ with its own pages, components, and (if needed) zod schemas.
- **New global components**: Add to the components/ directory for reuse across the app.
- **New API integrations**: Add logic to the apis/ directory and connect via stores.
- **New routes**: Update router.ts and ensure access control is handled appropriately.
- **New translations**: Add or update files in locales/ and update usage in components/pages as needed.

---
[← Previous: Usage Guides](05_usage-guides.md) | [Next: Backend Guide →](08_backend-guide.md)
