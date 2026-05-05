# Batta Factory Management - Frontend Summary

This document outlines the detailed architecture, components, data models, hardcoded values, and actions of the Batta Factory Management frontend, to assist with backend and database planning.

## 1. Pages and Routes

*   **`/`**: Default Next.js landing page.
*   **`/analytics`**: Factory operations dashboard. Currently UI only (mock data). Shows Fuel Analytics and Production Analytics.
*   **`/calculator`**: Contains a functional calculator with persistent history.
*   **`/master-entry`**: The central logging hub. A menu to access:
    *   Fuel Input
    *   Fuel Output
    *   Bricks Count
    *   New Employee
*   **`/payroll`**: The payroll management hub. A menu to access:
    *   Give Salary
    *   Pending Salary
    *   Advanced Payment
    *   Set Salary Database
    *   Extra Work Salary
    *   History & Stats
*   **`/sales`**: Sales dashboard. Currently UI only. Contains options for "New Sale Entry" and "Sales Dashboard & History".

## 2. Components & Their Functions

### Shared Components
*   **`BottomNavBar`**: Provides persistent navigation across Sales, Payroll, Analytics, Master Entry, and Calculator.
*   **`Combobox`**: A reusable dropdown/typeahead component used heavily across forms for predefined but extensible selections.

### Master Entry Components (`components/master-entry/`)
*   **`FuelInputForm`**: Form to log new fuel purchases.
    *   **Inputs**: Liters Bought (number), Gas Station Name (Combobox), Purchaser Name (Combobox), Total Cost (number), Purchase Date (date), Receipt/Bill Photo (file upload/image).
*   **`FuelOutputForm`**: Form to log fuel usage by machines.
    *   **Inputs**: Target Machine / Vehicle (Combobox), Amount Used (number), Given By (Combobox), Date (date), Time (time).
*   **`BricksCountManager`**: Manages team daily production.
    *   **Views**: Team List (with search), Create Team Form, Team Entry Form (daily production).
    *   **Team Creation Inputs**: Team Name (text), Location Tag (text/suggestions).
    *   **Team Entry Inputs**: Bricks Produced Today (number), Date (date).
*   **`EmployeeOnboarding`**: Form to add new workers to the system.
    *   **Inputs**: Full Name (text), Employee Category (Combobox), Pay Frequency (select: weekly/monthly), Base Salary (number), Boss / Contractor Name (Combobox), Joining Date (date), Gender (Combobox), Religion (Combobox), Age (number), Home City (text), Aadhar Card (file upload), PAN/Passbook (file upload).

### Payroll Components (`components/payroll/`)
*   **`GiveSalaryForm`**: Orchestrates regular payouts (weekly/monthly), including deducting advances and clearing previous dues.
    *   **Inputs**: Category (select), Employee (select), Past Dues to Clear (checkboxes), Past Advances to Deduct (checkboxes), Payment Type (Full/Partial), Partial Amount (number, if partial), Payment Method (select: Cash, Bank Transfer/UPI), Date (date).
*   **`PendingSalaryForm`**: Specialized form to clear outstanding dues.
    *   **Inputs**: Select Employee, Select Dues to Clear (checkboxes), Payment Type (Full/Partial), Partial Amount (number, if partial), Payment Method (select), Date (date).
*   **`AdvancePaymentForm`**: Form to issue advance salary to a worker.
    *   **Inputs**: Category (select), Employee (select), Advance Amount (number), Payment Method (select), Date (date).
*   **`ExtraWorkManager`**: Handles logging and paying for overtime or specific tasks.
    *   **Log Work Inputs**: Category, Employee, Work Description (Combobox), Amount Agreed (number), Date (date).
    *   **Pay Work Inputs**: Payment Method (select), Date (date).
*   **`SetSalaryDatabase`**: To edit base salary configurations for employees.
    *   **Inputs**: Pay Frequency (select), Base Salary (number).
*   **`HistoryStatsDashboard`**: Comprehensive read-only dashboard. Displays factory-wide snapshot (Total Paid, Pending Dues) and individual employee ledgers (Salary, Pending, Advances, Extra Work tabs).

### Calculator (`components/calculator/`)
*   **`CalculatorWidget`**: Standard mathematical calculator with history tracking saved to `localStorage` (`batta_calc_history`).

## 3. Data Structures & Payloads

Forms generally submit the following key fields (based on logged payloads):

*   **Fuel Input (`fuel_slots`)**: `liters_bought`, `liters_remaining` (initially same as bought), `station_name`, `purchaser_name`, `total_cost`, `purchase_date` (ISO string with time), `receipt_image_url` (intended for external storage).
*   **Fuel Output (`fuel_usage_logs`)**: `machine_name`, `liters_used`, `given_by`, `usage_date` (ISO string with combined date/time), `logged_by`.
*   **Team Data**: `team_number`, `team_name`, `location_tag`.
*   **Bricks Count Entry**: `team_id`, `team_number`, `team_name`, `bricks_count`, `entry_date`, `logged_by`.
*   **Employee (`employees`)**: `full_name`, `employee_category`, `pay_frequency`, `base_salary`, `gender`, `religion`, `age`, `boss_contractor_name`, `home_city`, `joining_date`, `document_url`, `is_active`.
*   **Advance Payment**: `employeeId`, `employeeName`, `fixedSalary`, `advanceAmount`, `paymentMethod`, `date`.
*   **Give Salary (Payout)**: `employeeId`, `employeeName`, `fixedSalary`, `paidToday`, `oldDuesCleared` (array of IDs), `sumOldDuesCleared`, `advancesDeducted` (array of IDs), `sumAdvancesDeducted`, `totalPayout`, `newPendingDueCreated`, `paymentMethod`, `date`.
*   **Clear Dues**: `employeeId`, `employeeName`, `category`, `clearedDues` (array of IDs), `selectedTotal`, `actualPaid`, `remainingCreated`, `paymentMethod`, `date`.
*   **Update Salary Profile**: `employeeId`, `name`, `oldSalary`, `newSalary`, `oldPayType`, `newPayType`, `date`.
*   **Extra Work Log**: `category`, `employeeName`, `workName`, `amount`, `dateLogged`.
*   **Extra Work Pay**: `taskId`, `employeeName`, `category`, `workName`, `amountPaid`, `paymentMethod`, `payDate`.

## 4. Hardcoded Values & Dictionaries

*   **Employee Categories**: "Jhokwa", "Driver", "Bharae wala", "Coal picker", "General", "Rabbis spreader" (added in onboarding).
*   **Genders**: "Male", "Female", "Other".
*   **Religions**: "Muslim", "Hindu", "Sikh", "Christian", "Other".
*   **Boss / Contractors**: "Master", "Pardhan", "Uncle", "Bade Abbu".
*   **Gas Stations**: "Petrol Pump 1", "Petrol Pump 2", "Petrol Pump 3".
*   **Fuel Purchasers / Givers**: "Master", "Pardhan", "Uncle", "General Worker".
*   **Machines / Vehicles**: "JCB", "Tractor_1", "Tractor_2", "Icer Machine", "Small Green Machine".
*   **Extra Work Options**: "Night Shift", "Coal Unloading", "Machine Repair", "Jungle Cleaning".
*   **Location Tags (Bricks)**: "Near Chimni", "Near Jungle", "South Field", "East Block", "West Block", "North Side".
*   **Payment Methods**: "Cash", "Bank Transfer/UPI".
*   **Sales Pricing (UI Note)**: Default Price per Trawli: ₹14,000, Discounted Rate: ₹13,500.

## 5. User Actions

*   **Submit/Log Forms**: Logging fuel input, fuel usage, daily bricks count, new employees, extra work, issuing advances, and giving salaries.
*   **Image Uploads**: Uploading receipt photos for fuel, and Aadhar/PAN/Passbook images for employees. Includes previewing and removing the selected image.
*   **Calculate Salaries**: Computing complex salary payouts (Base Salary + Cleared Dues - Deducted Advances = Final Payout), with automatic calculation of new pending dues if a partial payment is made.
*   **Team Management**:
    *   Create a new Team.
    *   **Request Deletion** of a team: Triggers an alert indicating an approval request is sent to "Admin (Uncle)".
*   **Edit Database**: Modify the fixed salary amount and frequency (Weekly/Monthly) for existing employees.
*   **Search**: Filter the team list by name or location tag.
*   **Calculator**: Perform math operations with an automatically saved history log that can be viewed and cleared.