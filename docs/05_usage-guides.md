# Usage Guides

This section provides step-by-step instructions for common workflows and main features.

## 1. Logging In

- Users must log in to access most features. (In demo mode, i.e. AUTH_ENABLED=false, the app is read-only and does not require login.)
- Enter your credentials on the login page to access the application.
![Admin login page](images/admin-page.png)
- If in "demo" mode write operations will not be allowed.
![Write operation warning](images/write-operation-warning.png)

## 2. Managing Donations

- Go to the Donation List page.
![Donation list](images/donation-list.png)
- To add a donation, click the "New" button.
![Add donation button](images/add-donation-button.png)
![Donation create page](images/donation-create-page.png)
- Each donation in the list has controls for update and (admin only) delete.
![Donation list controls](images/donation-list-controls.png)
- Donations eligible for tax receipts appear in yellow and have a control to generate an individual tax receipt.
![Eligible donations](images/eligible-donations.png)
- Donations already attached to a tax receipt appear in green and cannot be modified or deleted until the tax receipt is canceled.
![Donations with tax receipts attached](images/donations-with-tax-receipts-attached.png)

## 3. Managing Donors

- Go to the Donor List page.
- View the count of donations and total amount per donor.
![Donor list](images/donor-list.png)
- Click a donor to view detailed information.
![Donor detail](images/donor-detail.png)
- If external provider integration is enabled, access to external user management is available from the donor detail page.
![Donor external link button](images/donor-external-link-button.png)
- Donors cannot be modified in this app.

## 4. Managing Tax Receipts

- Go to the Tax Receipt List page.
![Tax receipt list](images/tax-receipt-list.png)
- Download individual tax receipts.
![Download tax receipt button](images/download-tax-receipt-button.png)
![Tax receipt example](images/tax-receipt-example.png)
- Cancel a given tax receipt (admin only).
![Cancel tax receipt button](images/cancel-tax-receipt-button.png)
- Use the "Create Bulk Annual Tax Receipts" button to generate receipts for all eligible donors for a given year. This navigates to a summary page showing eligible donors and their donations.
![Annual tax receipt button](images/annual-tax-receipt-button.png)
![Annual tax receipt page](images/annual-tax-receipt-page.png)

## 5. Dashboard

- The Dashboard provides a summary view of donations, donors, and tax receipts.
- Information is organized into tabs for each category.
![Dashboard donation tab](images/dashboard-donation-tab.png)
![Dashboard donor tab](images/dashboard-donor-tab.png)
![Dashboard tax receipt tab](images/dashboard-tax-receipt-tab.png)
- Use the dashboard to quickly review key metrics and recent activity.

## 6. Table Features

- All tables support sorting and filtering.
![Filter donation](images/filter-donation.png)
- The Donations and Donors tables have an "Export to CSV" function, which exports data based on the current filters.
![Export donor](images/export-donor.png)

## 7. Help section

- A help button is available throughout the app. Clicking it displays additional information or guidance relevant to the current page or feature.
![Help button](images/help-button.png)

## 8. Language

- A button allows users to select English or French as the application language.
![Change language](images/change-language.png)

## 9. Admin-Only Features

- Admin users have access to Organisation, Payment Mode, Donation Type, Donation Asset Type, and Donation Method lists.
![Admin page highlight](images/dashboard-page-with-admin-page-highlight.png)
- These are simple CRUD pages for managing each type, with add / update / delete functions.
- These pages are only visible to admin users.
![Donation type list](images/donation-type-list.png)
![Organisation update](images/organisation-update.png)

---
[← Previous: Key Concepts & Architecture](04_architecture.md) | [Next: Frontend Guide →](07_frontend-guide.md)
