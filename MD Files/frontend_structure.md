# Frontend Data Architecture & Backend Blueprint

## 1. Master Entry & Core Entities

### CreateTeamForm (within BricksCountManager)
- **State Variables / Form Fields**: `teamName (String)`, `locationTag (String)`
- **Expected API Payload**:
```json
{
  "team_number": 13,
  "team_name": "Raju Team",
  "location_tag": "Near Chimni"
}
```

### TeamEntryForm (within BricksCountManager)
- **State Variables / Form Fields**: `bricks (String/Number)`, `date (String)`
- **Expected API Payload**:
```json
{
  "team_id": "1",
  "team_number": 1,
  "team_name": "Raju Team",
  "bricks_count": 2500,
  "entry_date": "2026-04-29",
  "logged_by": "Master"
}
```

### EmployeeOnboarding
- **State Variables / Form Fields**: `full_name (String)`, `employee_category (String)`, `pay_frequency (String)`, `base_salary (String/Number)`, `gender (String)`, `religion (String)`, `age (String/Number)`, `boss_contractor_name (String)`, `home_city (String)`, `joining_date (String)`, `aadhar_file (File | null)`, `secondary_doc_file (File | null)`
- **Expected API Payload**:
```json
{
  "full_name": "Raju Kumar",
  "employee_category": "Jhokwa",
  "pay_frequency": "weekly",
  "base_salary": 2000,
  "gender": "Male",
  "religion": "Hindu",
  "age": 28,
  "boss_contractor_name": "Pardhan",
  "home_city": "Azamgarh, UP",
  "joining_date": "2026-04-29",
  "document_url": null,
  "is_active": true
}
```

### FuelInputForm
- **State Variables / Form Fields**: `liters_bought (String/Number)`, `station_name (String)`, `purchaser_name (String)`, `total_cost (String/Number)`, `purchase_date (String)`, `receipt_image (File | null)`
- **Expected API Payload**:
```json
{
  "liters_bought": 50,
  "liters_remaining": 50,
  "station_name": "Petrol Pump 1",
  "purchaser_name": "Master",
  "total_cost": 4500,
  "purchase_date": "2026-04-29T10:30:00.000Z",
  "receipt_image_url": null
}
```

### FuelOutputForm
- **State Variables / Form Fields**: `machine_name (String)`, `liters_used (String/Number)`, `given_by (String)`, `usage_date (String)`, `usage_time (String)`
- **Expected API Payload**:
```json
{
  "machine_name": "JCB",
  "liters_used": 5,
  "given_by": "Master",
  "usage_date": "2026-04-29T14:30:00.000Z",
  "logged_by": "Master"
}
```

### Combobox (UI Component)
- **State Variables / Form Fields**: `isOpen (Boolean)`, `value (String from props)`
- **Expected API Payload**: None (Reusable UI wrapper that passes string values back to parent forms).

## 2. Payroll Operations

### AdvancePaymentForm
- **State Variables / Form Fields**: `category (String)`, `employeeId (String)`, `advanceAmount (String/Number)`, `paymentMethod (String)`, `date (String)`
- **Expected API Payload**:
```json
{
  "employeeId": 1,
  "employeeName": "Ali",
  "fixedSalary": 15000,
  "advanceAmount": 5000,
  "paymentMethod": "Cash",
  "date": "2026-04-29"
}
```

### ExtraWorkManager (Entry Form)
- **State Variables / Form Fields**: `category (String)`, `employeeId (String)`, `workDesc (String)`, `amount (String/Number)`, `date (String)`
- **Expected API Payload**:
```json
{
  "category": "Driver",
  "employeeName": "Ali",
  "workName": "Night Shift Bricks Transfer",
  "amount": 500,
  "dateLogged": "2026-04-29"
}
```

### ExtraWorkManager (Payment Form)
- **State Variables / Form Fields**: `paymentMethod (String)`, `payDate (String)`
- **Expected API Payload**:
```json
{
  "taskId": "t1",
  "employeeName": "Ali",
  "category": "Driver",
  "workName": "Night Shift Bricks Transfer",
  "amountPaid": 500,
  "paymentMethod": "Cash",
  "payDate": "2026-04-29"
}
```

### GiveSalaryForm
- **State Variables / Form Fields**: `category (String)`, `employeeId (String)`, `selectedPastDues (Array)`, `selectedPastAdvances (Array)`, `paymentType (String)`, `partialAmount (String/Number)`, `calculatedPending (Number | null)`, `paymentMethod (String)`, `date (String)`
- **Expected API Payload**:
```json
{
  "employeeId": 1,
  "employeeName": "Ali",
  "fixedSalary": 15000,
  "paidToday": 15000,
  "oldDuesCleared": ["d1", "d2"],
  "sumOldDuesCleared": 1500,
  "advancesDeducted": ["a1"],
  "sumAdvancesDeducted": 1000,
  "totalPayout": 15500,
  "newPendingDueCreated": 0,
  "paymentMethod": "Cash",
  "date": "2026-04-29"
}
```

### HistoryStatsDashboard
- **State Variables / Form Fields**: `view (String)`, `selectedEmployee (Object | null)`, `expandedCategories (Object)`, `activeTab (String)`
- **Expected API Payload**: None (Read-only dashboard, queries history data and aggregates).

### PendingSalaryForm
- **State Variables / Form Fields**: `expandedEmployees (Object)`, `payingEmployee (Object | null)`, `selectedDues (Array)`, `paymentType (String)`, `partialAmount (String/Number)`, `paymentMethod (String)`, `date (String)`
- **Expected API Payload**:
```json
{
  "employeeId": 1,
  "employeeName": "Ali",
  "category": "Driver",
  "clearedDues": ["d1", "d2"],
  "selectedTotal": 1500,
  "actualPaid": 1500,
  "remainingCreated": 0,
  "paymentMethod": "Cash",
  "date": "2026-04-29"
}
```

### SetSalaryDatabase
- **State Variables / Form Fields**: `expandedEmployees (Object)`, `editingEmployee (Object | null)`, `payType (String)`, `salaryAmount (String/Number)`
- **Expected API Payload**:
```json
{
  "employeeId": 1,
  "name": "Ali",
  "oldSalary": 15000,
  "newSalary": 16000,
  "oldPayType": "Monthly",
  "newPayType": "Weekly",
  "date": "2026-04-29"
}
```

## 3. Sales Operations

### OrderBricksForm
- **State Variables / Form Fields**: `orderMode (String: trawli/custom)`, `trawlisQty (String/Number)`, `bricksQty (String/Number)`, `brickCategory (String)`, `customerName (String)`, `customerMobile (String)`, `customerAddress (String)`, `orderDate (String)`, `leadSource (String)`, `salesperson (String)`, `pricePerTrawli (Number)`, `customTotalAmount (String/Number)`, `paymentStatus (String)`, `amountPaid (String/Number)`, `paymentMethod (String)`, `receivedBy (String)`
- **Expected API Payload**:
```json
{
  "trawlisQty": "2",
  "bricksQty": "",
  "brickCategory": "Red",
  "customerName": "Suhail",
  "customerMobile": "+91 99999 99999",
  "customerAddress": "Bhadni Chafa",
  "orderDate": "2026-04-29",
  "leadSource": "Master",
  "salesperson": "Master",
  "pricePerTrawli": 14000,
  "customTotalAmount": "",
  "paymentStatus": "Partial Advance",
  "amountPaid": "10000",
  "paymentMethod": "Cash",
  "receivedBy": "Master",
  "orderMode": "trawli",
  "totalAmount": 28000,
  "timestamp": "2026-04-29T10:30:00.000Z"
}
```

### DispatchManager
- **State Variables / Form Fields**: `view (String)`, `dashboardTab (String)`, `selectedOrder (Object)`, `paymentInput (Object)`, `dispatchInput (Object)`, `cancelReason (String)`
- **Expected API Payloads**:
  - **Record Payment**:
  ```json
  {
    "orderId": "ORD-1",
    "amountReceived": 5000,
    "method": "Cash",
    "timestamp": "2026-04-29T11:00:00.000Z"
  }
  ```
  - **Log Dispatch**:
  ```json
  {
    "orderId": "ORD-1",
    "driver": "Ali",
    "qtyDispatched": 1,
    "timestamp": "2026-04-29T12:00:00.000Z"
  }
  ```
  - **Force Close Order**:
  ```json
  {
    "orderId": "ORD-1",
    "reason": "Payment not done",
    "timestamp": "2026-04-29T13:00:00.000Z"
  }
  ```

### SalesDashboardHistory
- **State Variables / Form Fields**: `activeTab (String)`, `timeRange (String)`, `searchQuery (String)`
- **Expected API Payload**: None (Read-only dashboard, queries sales data and aggregates).

## 4. Analytics Data Needs

### FuelAnalyticsDashboard
- **Required Aggregated Data**:
  - Filter by `timeRange` (7D, 1M, Year) using `purchase_date` for stock and `usage_date` for usage.
  - Active Fuel Slots (`liters_remaining > 0`).
  - Total Fuel Stock (`sum(liters_remaining)`).
  - Total Fuel Spent (`sum(total_cost)`).
  - Total Fuel Consumed (`sum(liters_used)`).
  - Fuel usage aggregated by `machine_name`.
  - Detailed history ledger of usage (`Fuel_Usage` records).

### ProductionAnalyticsDashboard
- **Required Aggregated Data**:
  - Filter by `timeRange` (7D, 1M, Year) using `entry_date`.
  - Total Bricks (`sum(bricks_count)`).
  - Number of Active Teams (distinct `team_id` from logs).
  - Best Single Day Production (max `bricks_count` in a day).
  - Leaderboard: Total bricks aggregated by `team_name`.
  - Daily Production Trend: Total bricks aggregated by `entry_date`.
  - Detailed history ledger of entries (`Daily_Production` records).

## 5. Proposed Database Tables

Based on the required frontend structures, here is the proposed backend schema architecture:

- **Employees**
  - `id` (PK)
  - `full_name` (String)
  - `employee_category` (String)
  - `pay_frequency` (String)
  - `base_salary` (Decimal)
  - `gender` (String)
  - `religion` (String)
  - `age` (Integer)
  - `boss_contractor_name` (String)
  - `home_city` (String)
  - `joining_date` (Date)
  - `document_url` (String, nullable)
  - `is_active` (Boolean)

- **Brick_Teams**
  - `id` (PK)
  - `team_number` (Integer)
  - `team_name` (String)
  - `location_tag` (String)

- **Daily_Production**
  - `id` (PK)
  - `team_id` (FK -> Brick_Teams)
  - `bricks_count` (Integer)
  - `entry_date` (Date)
  - `logged_by` (String)

- **Fuel_Stock**
  - `id` (PK)
  - `liters_bought` (Decimal)
  - `liters_remaining` (Decimal)
  - `station_name` (String)
  - `purchaser_name` (String)
  - `total_cost` (Decimal)
  - `purchase_date` (Timestamp)
  - `receipt_image_url` (String, nullable)

- **Fuel_Usage**
  - `id` (PK)
  - `machine_name` (String)
  - `liters_used` (Decimal)
  - `given_by` (String)
  - `usage_date` (Timestamp)
  - `logged_by` (String)

- **Extra_Work**
  - `id` (PK)
  - `employee_id` (FK -> Employees)
  - `work_name` (String)
  - `amount` (Decimal)
  - `date_logged` (Date)
  - `is_paid` (Boolean)
  - `payment_date` (Date, nullable)
  - `payment_method` (String, nullable)

- **Payroll_Ledger** (Unified ledger for Salary, Dues, Advances)
  - `id` (PK)
  - `employee_id` (FK -> Employees)
  - `transaction_type` (Enum: 'SALARY', 'CLEAR_DUES', 'ADVANCE_GIVEN')
  - `amount` (Decimal)
  - `base_salary` (Decimal, nullable)
  - `due_created` (Decimal, default 0)
  - `advance_deducted` (Decimal, default 0)
  - `payment_method` (String)
  - `date` (Date)

- **Salary_History**
  - `id` (PK)
  - `employee_id` (FK -> Employees)
  - `old_salary` (Decimal)
  - `new_salary` (Decimal)
  - `old_pay_type` (String)
  - `new_pay_type` (String)
  - `change_date` (Date)

- **Sales_Orders**
  - `id` (PK)
  - `order_mode` (String: 'trawli' | 'custom')
  - `brick_category` (String)
  - `customer_name` (String)
  - `customer_mobile` (String)
  - `customer_address` (Text)
  - `order_date` (Date)
  - `lead_source` (String)
  - `salesperson` (String)
  - `total_qty` (Integer)
  - `price_per_trawli` (Decimal, nullable)
  - `total_amount` (Decimal)
  - `paid_amount` (Decimal, default 0)
  - `dispatched_qty` (Integer, default 0)
  - `status` (String: 'Active', 'Completed', 'Cancelled', 'Force Closed')
  - `close_reason` (String, nullable)
  - `timestamp` (Timestamp)

- **Order_Payments**
  - `id` (PK)
  - `order_id` (FK -> Sales_Orders)
  - `amount_received` (Decimal)
  - `payment_method` (String)
  - `received_by` (String)
  - `timestamp` (Timestamp)

- **Dispatches**
  - `id` (PK)
  - `order_id` (FK -> Sales_Orders)
  - `driver_name` (String)
  - `qty_dispatched` (Integer)
  - `timestamp` (Timestamp)