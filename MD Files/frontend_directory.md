# Frontend Directory Structure

This document outlines the frontend structure of the Batta application, specifically focusing on the `/app` and `/components` directories.

## `app/` Directory
The `app/` directory utilizes Next.js App Router for defining the routes and page layouts.

- `favicon.ico` - The website's favicon icon.
- `globals.css` - Global CSS styles applied to the entire application.
- `layout.js` - The root layout component that wraps all pages.
- `page.js` - The main entry point or landing page of the application.

### Feature Routes
- `analytics/page.js` - The main page for the Analytics module, likely showing various data insights.
- `calculator/page.js` - The main page for the Calculator module, providing calculation tools.
- `master-entry/page.js` - The main page for the Master Entry module, likely used for core data input and management.
- `payroll/page.js` - The main page for the Payroll module, managing employee salaries and records.
- `sales/page.js` - The main page for the Sales module, tracking orders and dispatch.

## `components/` Directory
The `components/` directory contains reusable UI elements grouped by their feature modules.

### Analytics (`components/analytics/`)
Components related to data visualization and metrics.
- `FuelAnalyticsDashboard.js` - Dashboard component for analyzing fuel usage and related metrics.
- `ProductionAnalyticsDashboard.js` - Dashboard component for analyzing brick production statistics.

### Calculator (`components/calculator/`)
Components providing calculation functionality.
- `CalculatorWidget.js` - A widget component for performing quick calculations within the app.

### Master Entry (`components/master-entry/`)
Components for core data management and initial configurations.
- `BricksCountManager.js` - Form or manager component for tracking and inputting brick counts.
- `EmployeeOnboarding.js` - Component for adding and onboarding new employees into the system.
- `FuelInputForm.js` - Form component for recording incoming fuel deliveries or inventory.
- `FuelOutputForm.js` - Form component for recording fuel usage or consumption.

### Navigation (`components/navigation/`)
Components related to app navigation.
- `BottomNavBar.js` - The bottom navigation bar, typical for a mobile-first application layout.

### Payroll (`components/payroll/`)
Components for managing employee compensation and work history.
- `AdvancePaymentForm.js` - Form component for issuing and tracking advance payments to employees.
- `ExtraWorkManager.js` - Component for recording and managing additional work hours or tasks.
- `GiveSalaryForm.js` - Form component used for processing and distributing regular salary payments.
- `HistoryStatsDashboard.js` - Dashboard showing historical payroll data and employee statistics.
- `PendingSalaryForm.js` - Component for viewing and managing unpaid or pending salaries.
- `SetSalaryDatabase.js` - Component for defining and managing base salary structures or databases.

### Sales (`components/sales/`)
Components handling orders and product distribution.
- `DispatchManager.js` - Component for managing the dispatch and delivery of brick orders.
- `OrderBricksForm.js` - Form component for placing new brick orders.
- `SalesDashboardHistory.js` - Dashboard displaying historical sales data and performance metrics.

### UI (`components/ui/`)
Generic, reusable user interface components.
- `Combobox.js` - A reusable combobox or custom select dropdown UI component.