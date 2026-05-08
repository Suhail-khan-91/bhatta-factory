# Component Analysis: HistoryStatsDashboard.js

## Summary
Comprehensive payroll history dashboard with factory-wide stats and employee ledger drill-down. Complex component with dashboard and ledger views.

## Recommended Components

### 1. StatCard
**Type:** UI/Display
**Current Usage:** Factory snapshot cards (lines 286-300)
**Suggested Props:** `label`, `value`, `icon`, `color`, `accentClass`

**Current Code:**
```jsx
<div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
  <p className="text-emerald-400 text-xs font-medium mb-1">Total Paid</p>
  <p className="text-white text-xl font-bold flex items-center">
    <IndianRupee size={18} className="mr-0.5" />
    {totalPaid.toLocaleString("en-IN")}
  </p>
</div>
```

**Suggested Implementation:**
```jsx
function StatCard({ label, value, icon: Icon, colorClass = "emerald", format = "currency" }) {
  const displayValue = format === "currency" ? `₹${Number(value).toLocaleString("en-IN")}` : value;
  return (
    <div className={`bg-${colorClass}-500/10 border border-${colorClass}-500/20 rounded-xl p-3`}>
      <p className={`text-${colorClass}-400 text-xs font-medium mb-1`}>{label}</p>
      <p className="text-white text-xl font-bold flex items-center">
        {Icon && <Icon size={18} className="mr-0.5" />}
        {displayValue}
      </p>
    </div>
  );
}
```

**Benefits:** Used in all analytics dashboards (FuelAnalyticsDashboard, ProductionAnalyticsDashboard, SalesDashboardHistory)

---

### 2. CategoryAccordion
**Type:** Navigation/Layout
**Current Usage:** Employee list grouped by category (lines 309-346)
**Suggested Props:** `title`, `count`, `isExpanded`, `onToggle`, `children`

**Current Code:**
```jsx
<div key={cat} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
  <button onClick={() => toggleCategory(cat)} className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-700/50 transition-colors">
    <span className="font-bold text-slate-200">{cat}</span>
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400">{emps.length} employee{emps.length > 1 ? "s" : ""}</span>
      <ChevronRight size={18} className={`text-slate-400 transition-transform ${isOpen ? "rotate-90" : ""}`} />
    </div>
  </button>
  {isOpen && <div className="border-t border-slate-700 divide-y divide-slate-700/60">{children}</div>}
</div>
```

**Suggested Implementation:**
```jsx
function CategoryAccordion({ title, count, isExpanded, onToggle, children }) {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-700/50 transition-colors">
        <span className="font-bold text-slate-200">{title}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{count} items</span>
          <ChevronRight size={18} className={`text-slate-400 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
        </div>
      </button>
      {isExpanded && <div className="border-t border-slate-700 divide-y divide-slate-700/60">{children}</div>}
    </div>
  );
}
```

**Benefits:** Used in SetSalaryDatabase, PendingSalaryForm, ExtraWorkManager

---

### 3. EmployeeListItem
**Type:** UI/List
**Current Usage:** Employee row in category accordion (lines 322-342)

**Current Code:**
```jsx
<button key={emp.id} onClick={() => handleSelectEmployee(emp)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-700/40 transition-colors text-left">
  <div>
    <p className="font-semibold text-slate-200 text-sm">{emp.full_name}</p>
    <p className="text-xs text-slate-400 mt-0.5">
      <span className="text-emerald-400 font-medium">Paid: ₹{empData.paidThisMonth.toLocaleString("en-IN")}</span>
      {empData.activeDues > 0 && <span className="text-orange-400 font-medium"> · Dues: ₹{empData.activeDues.toLocaleString("en-IN")}</span>}
    </p>
  </div>
  <ChevronRight size={16} className="text-slate-500 shrink-0" />
</button>
```

---

### 4. LedgerSummaryCard
**Type:** UI/Display
**Current Usage:** Employee ledger header showing totals (lines 122-139)

**Current Code:**
```jsx
<div className="mx-4 mb-4 bg-slate-800 border border-slate-700 rounded-2xl p-4 grid grid-cols-3 gap-3 text-center">
  <div>
    <p className="text-slate-400 text-xs mb-1">Fixed Salary</p>
    <p className="text-white font-bold">₹{Number(selectedEmployee.base_salary).toLocaleString("en-IN")}</p>
  </div>
  <div className="border-x border-slate-700">
    <p className="text-slate-400 text-xs mb-1">Pending Dues</p>
    <p className={`font-bold ${empData.activeDues > 0 ? "text-orange-400" : "text-emerald-400"}`}>
      ₹{empData.activeDues.toLocaleString("en-IN")}
    </p>
  </div>
  <div>
    <p className="text-slate-400 text-xs mb-1">Advances</p>
    <p className={`font-bold ${empData.activeAdvances > 0 ? "text-red-400" : "text-emerald-400"}`}>
      ₹{empData.activeAdvances.toLocaleString("en-IN")}
    </p>
  </div>
</div>
```

**Suggested Implementation:**
```jsx
function LedgerSummaryCard({ items }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 grid grid-cols-3 gap-3 text-center">
      {items.map((item, i) => (
        <div key={item.label} className={i > 0 ? "border-x border-slate-700" : ""}>
          <p className="text-slate-400 text-xs mb-1">{item.label}</p>
          <p className={`font-bold ${item.colorClass}`}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}
```

---

### 5. LedgerTabBar
**Type:** Navigation
**Current Usage:** Tabs within employee ledger (lines 141-152)

**Current Code:**
```jsx
<div className="flex gap-2 px-4 overflow-x-auto pb-2 scrollbar-hide">
  {TABS.map((tab) => (
    <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab.key ? "bg-blue-600 text-white shadow shadow-blue-600/40" : "bg-slate-800 text-slate-400 border border-slate-700"}`}>
      {tab.label}
    </button>
  ))}
</div>
```

**Suggested Implementation:**
```jsx
function PillTabBar({ tabs, activeTab, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {tabs.map(tab => (
        <button key={tab.key} onClick={() => onChange(tab.key)} className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab.key ? "bg-blue-600 text-white shadow" : "bg-slate-800 text-slate-400 border border-slate-700"}`}>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
```

---

### 6. StatusBadge
**Type:** UI
**Current Usage:** Lines 10-14 - already extracted as utility function
**Note:** Use as component instead of utility

---

### 7. SalaryRecordCard
**Type:** UI/List
**Current Usage:** Display salary history entry (lines 161-188)

**Current Code:**
```jsx
<div key={rec.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-4 space-y-3">
  <div className="flex items-center justify-between">
    <p className="text-slate-400 text-sm font-medium">{rec.date}</p>
    <span className={`text-xs font-semibold ${SALARY_STATUS_COLOR(rec.status)}`}>{rec.status}</span>
  </div>
  <div className="bg-slate-900/60 rounded-xl p-3 space-y-2 border border-slate-700/50">
    <div className="flex justify-between text-sm text-slate-300">
      <span>Base Salary</span>
      <span className="font-medium">₹{rec.base.toLocaleString("en-IN")}</span>
    </div>
    {/* ... more items */}
  </div>
</div>
```

---

## Priority Recommendations

1. **High Priority:** StatCard, CategoryAccordion, PillTabBar - Used extensively across analytics
2. **Medium Priority:** LedgerSummaryCard, EmployeeListItem, SalaryRecordCard
3. **Low Priority:** StatusBadge - already a utility

## Cross-File Patterns

- StatCard appears in: SalesDashboardHistory, FuelAnalyticsDashboard, ProductionAnalyticsDashboard
- CategoryAccordion appears in: SetSalaryDatabase, PendingSalaryForm, ExtraWorkManager
- Ledger patterns unique to this but could be used in future employee-centric views