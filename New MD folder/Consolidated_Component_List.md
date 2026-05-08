# Consolidated Reusable Components List

## Overview
This document lists all reusable components identified across 19 frontend JS files in `batta-app/components/`, organized by priority and recommended folder structure.

---

## 📋 HIGH PRIORITY (Used in 8+ files, immediate impact)

| # | Component Name | Type | Files Using It | Current Status |
|---|----------------|------|----------------|----------------|
| 1 | **Combobox** | Form/UI | EmployeeOnboarding, FuelInputForm, FuelOutputForm, ExtraWorkManager, OrderBricksForm, DispatchManager, BricksCountManager | **DUPLICATED** in 3 files - use existing `ui/Combobox` |
| 2 | **TabSwitcher** | Navigation | FuelInputForm, FuelOutputForm, BricksCountManager, GiveSalaryForm, AdvancePaymentForm, PendingSalaryForm, OrderBricksForm, FuelAnalyticsDashboard, ProductionAnalyticsDashboard | ✅ Created at `ui/TabSwitcher.js` |
| 3 | **FormInput/Field** | Form | All 15+ form files | ✅ Created at `ui/FormInput.js` |
| 4 | **SearchInput** | Form | BricksCountManager, SalesDashboardHistory | ✅ Created at `ui/SearchInput.js` |
| 5 | **Section** (wrapper) | Layout | OrderBricksForm, DispatchManager | ✅ Created at `ui/Section.js` (includes Field component) |

---

## 🟡 MEDIUM PRIORITY (Used in 3-7 files)

| # | Component Name | Type | Files Using It | Current Status |
|---|----------------|------|----------------|----------------|
| 1 | **KPICard** | UI/Display | SalesDashboardHistory, FuelAnalyticsDashboard, ProductionAnalyticsDashboard | ✅ Created at `ui/KPICard.js` |
| 2 | **TimeRangeSelector** | Navigation | SalesDashboardHistory, FuelAnalyticsDashboard, ProductionAnalyticsDashboard | ✅ Created at `ui/TimeRangeSelector.js` |
| 3 | **CategorySection** | Layout | PendingSalaryForm, ExtraWorkManager, SetSalaryDatabase, HistoryStatsDashboard | ✅ Created at `ui/CategorySection.js` |
| 4 | **ExpandableSection** | Layout | PendingSalaryForm, SetSalaryDatabase, HistoryStatsDashboard | ✅ Created at `ui/ExpandableSection.js` |
| 5 | **CategorySelect** | Form | GiveSalaryForm, AdvancePaymentForm, ExtraWorkManager | ✅ Created at `ui/CategorySelect.js` |
| 6 | **EmployeeSelect** | Form | GiveSalaryForm, AdvancePaymentForm, ExtraWorkManager | ✅ Created at `ui/EmployeeSelect.js` |
| 7 | **EmployeeSummaryCard** | UI/Display | GiveSalaryForm, AdvancePaymentForm | ✅ Created at `ui/EmployeeSummaryCard.js` |
| 8 | **ListItem** (history) | UI/List | FuelInputForm, FuelOutputForm, BricksCountManager, GiveSalaryForm, SalesDashboardHistory | ✅ Created at `ui/ListItem.js` |
| 9 | **SubmitButton** | UI | All form files | ✅ Created at `ui/SubmitButton.js` |

---

## 🟢 LOW PRIORITY (Used in 1-2 files, nice to have)

| Component Name | Type | Files | Status |
|----------------|------|-------|--------|
| **Header** (page header) | Navigation | BricksCountManager | ✅ `ui/Header.js` |
| **MenuCard** | UI | ExtraWorkManager | ✅ `ui/MenuCard.js` |
| **StockIndicator** | UI/Display | FuelOutputForm | ✅ `ui/StockIndicator.js` |
| **EmployeeExpandableRow** | Layout | SetSalaryDatabase | ✅ `ui/EmployeeExpandableRow.js` |
| **SnapshotCard** | UI/Display | DispatchManager | ✅ `ui/SnapshotCard.js` |
| **DangerZone** | UI | DispatchManager | ✅ `ui/DangerZone.js` |
| **ProgressBar** | UI | SalesDashboardHistory, FuelAnalyticsDashboard | ✅ `ui/ProgressBar.js` |
| **LedgerSummaryCard** | UI/Display | HistoryStatsDashboard | ✅ `ui/LedgerSummaryCard.js` |
| **PillTabBar** | Navigation | HistoryStatsDashboard | ✅ `ui/PillTabBar.js` |
| **ToggleButtonGroup** | Form | GiveSalaryForm, OrderBricksForm | ✅ `ui/ToggleButtonGroup.js` |

---

## 📊 Recommended Component Folder Structure

```
batta-app/components/
├── ui/                          (already exists)
│   ├── Combobox.js              ✅ Already exists
│   ├── ConfirmModal.js          ✅ Already exists
│   └── NEW:
│       ├── FormInput.js         ← HIGH PRIORITY
│       ├── TabSwitcher.js       ← HIGH PRIORITY
│       ├── SearchInput.js       ← HIGH PRIORITY
│       ├── SubmitButton.js      ← MEDIUM PRIORITY
│       ├── KPICard.js           ← MEDIUM PRIORITY
│       ├── TimeRangeSelector.js ← MEDIUM PRIORITY
│       ├── ProgressBar.js       ← LOW PRIORITY
│       └── EmptyState.js        ← LOW PRIORITY
│
├── form/                        (NEW - form primitives)
│   ├── CategorySelect.js
│   ├── EmployeeSelect.js
│   ├── ToggleButtonGroup.js
│   └── DateInput.js
│
├── layout/                      (NEW - layout components)
│   ├── Section.js               ← OrderBricksForm pattern
│   ├── CategorySection.js
│   ├── ExpandableSection.js
│   └── Header.js
│
├── analytics/                   (NEW - analytics dashboard shared)
│   ├── TimeRangeSelector.js
│   ├── KPICard.js
│   ├── LeaderboardCard.js
│   └── DataListItem.js
│
└── payroll/                     (NEW - payroll specific)
    ├── EmployeeSummaryCard.js
    ├── SalaryBreakdown.js
    └── LedgerSummaryCard.js
```

---

## 📁 Source Files Analyzed

1. `master-entry/EmployeeOnboarding.md`
2. `master-entry/FuelInputForm.md`
3. `master-entry/FuelOutputForm.md`
4. `master-entry/BricksCountManager.md`
5. `payroll/GiveSalaryForm.md`
6. `payroll/AdvancePaymentForm.md`
7. `payroll/PendingSalaryForm.md`
8. `payroll/ExtraWorkManager.md`
9. `payroll/HistoryStatsDashboard.md`
10. `payroll/SetSalaryDatabase.md`
11. `sales/OrderBricksForm.md`
12. `sales/DispatchManager.md`
13. `sales/SalesDashboardHistory.md`
14. `ui/Combobox.md`
15. `navigation/BottomNavBar.md`
16. `calculator/CalculatorWidget.md`
17. `analytics/FuelAnalyticsDashboard.md`
18. `analytics/ProductionAnalyticsDashboard.md`
19. `admin/AdminSettings.md`

---

## 🚀 Implementation Order

### Phase 1: HIGH PRIORITY
1. **Combobox** - Remove duplicates, use existing `ui/Combobox`
2. **TabSwitcher** - Create new component
3. **FormInput** - Create new component
4. **SearchInput** - Create new component
5. **Section** - Create new component

### Phase 2: MEDIUM PRIORITY
1. **KPICard**
2. **TimeRangeSelector**
3. **CategorySection**
4. **ExpandableSection**
5. **CategorySelect**
6. **EmployeeSelect**
7. **SubmitButton**

### Phase 3: LOW PRIORITY
1. Remaining components as needed

---

## Notes

- **Combobox** is already at `batta-app/components/ui/Combobox.js` - just need to remove duplicates from 3 files
- All other HIGH PRIORITY items need to be created as new components
- Start with Phase 1 for maximum impact with least complexity
- Each component should accept `accentClass` or color props for flexibility across different pages