# Component Analysis: GiveSalaryForm.js

## Summary
This file implements salary payment processing with past dues management, advance deductions, and payment calculation. Complex business logic with several reusable UI patterns.

## Recommended Components

### 1. TabSwitcher
**Type:** Navigation
**Current Usage:** "Log Entry" and "Recent History" tabs (lines 186-201)
**Suggested Props:** `tabs`, `activeTab`, `onChange`, `accentColor = "blue"`

**Current Code:**
```jsx
<div className="flex p-1 bg-slate-800/50 mx-4 mb-4 rounded-xl border border-slate-700">
  <button onClick={() => setActiveTab('form')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'form' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-slate-200'}`}>
    <PlusCircle size={16} />
    Log Entry
  </button>
  <button onClick={() => setActiveTab('history')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-slate-200'}`}>
    <History size={16} />
    Recent History
  </button>
</div>
```

**Recommendation:** Extract as reusable component with icon support

---

### 2. CategorySelect
**Type:** Form
**Current Usage:** Employee Category dropdown (lines 207-220)
**Suggested Props:** `value`, `onChange`, `options`, `required`

**Current Code:**
```jsx
<select value={category} onChange={(e) => { setCategory(e.target.value); setEmployeeId(""); }} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-white" required>
  <option value="" disabled>Select category...</option>
  {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
</select>
```

**Benefits:** Used in all payroll forms (AdvancePaymentForm, ExtraWorkManager, PendingSalaryForm)

---

### 3. EmployeeSelect
**Type:** Form
**Current Usage:** Employee Name dropdown filtered by category (lines 223-237)

**Current Code:** Same pattern as CategorySelect but with filtered options

---

### 4. EmployeeSummaryCard
**Type:** UI/Display
**Current Usage:** Shows employee pay type and fixed salary (lines 242-254)

**Current Code:**
```jsx
<div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 flex justify-between items-center shadow-inner">
  <div>
    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Pay Type</p>
    <p className="font-medium text-slate-200">{selectedEmployee.pay_frequency} Paid</p>
  </div>
  <div className="text-right">
    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Fixed Salary</p>
    <p className="text-xl font-bold text-green-400 flex items-center gap-1 justify-end">
      <IndianRupee size={18} />
      {Number(selectedEmployee.base_salary).toLocaleString('en-IN')}
    </p>
  </div>
</div>
```

**Suggested Implementation:**
```jsx
function EmployeeSummaryCard({ payFrequency, baseSalary, currency = "₹" }) {
  return (
    <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 flex justify-between items-center shadow-inner">
      <div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Pay Type</p>
        <p className="font-medium text-slate-200">{payFrequency} Paid</p>
      </div>
      <div className="text-right">
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Fixed Salary</p>
        <p className="text-xl font-bold text-green-400 flex items-center gap-1 justify-end">
          <IndianRupee size={18} />
          {Number(baseSalary).toLocaleString('en-IN')}
        </p>
      </div>
    </div>
  );
}
```

**Benefits:** Reusable in AdvancePaymentForm, ExtraWorkManager, SetSalaryDatabase

---

### 5. CheckboxListItem
**Type:** Form
**Current Usage:** Past Pending Dues and Past Advances selection (lines 258-301)

**Current Code:**
```jsx
{pastDues.map((due) => (
  <label key={due.id} className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-xl p-3 cursor-pointer">
    <input type="checkbox" checked={selectedPastDues.includes(due.id)} onChange={() => handleTogglePastDue(due.id)} className="w-6 h-6 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-800" />
    <span className="flex-1 text-lg font-medium">₹{Number(due.due_created)} from {new Date(due.transaction_date).toLocaleDateString()}</span>
  </label>
))}
```

**Suggested Implementation:**
```jsx
function CheckboxListItem({ checked, onChange, label, variant = "default" }) {
  const variantClasses = {
    default: "bg-slate-800 border-slate-700 text-white",
    danger: "bg-red-500/10 border-red-500/30 text-red-400"
  };
  return (
    <label className={`flex items-center gap-3 rounded-xl p-3 cursor-pointer border ${variantClasses[variant]}`}>
      <input type="checkbox" checked={checked} onChange={onChange} className="w-6 h-6 rounded" />
      <span className="flex-1 text-lg font-medium">{label}</span>
    </label>
  );
}
```

**Benefits:** Used for dues, advances, and can be used elsewhere

---

### 6. PaymentTypeToggle
**Type:** Form
**Current Usage:** Full Payment / Partial Payment toggle (lines 306-321)

**Current Code:**
```jsx
<div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
  <button type="button" className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${paymentType === "Full Payment" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`} onClick={() => { setPaymentType("Full Payment"); setCalculatedPending(null); }}>
    Full Payment
  </button>
  <button type="button" className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${paymentType === "Partial Payment" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`} onClick={() => setPaymentType("Partial Payment")}>
    Partial Payment
  </button>
</div>
```

**Suggested Implementation:**
```jsx
function ToggleButtonGroup({ options, selected, onChange }) {
  return (
    <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
      {options.map(opt => (
        <button key={opt} type="button" onClick={() => onChange(opt)} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${selected === opt ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}>
          {opt}
        </button>
      ))}
    </div>
  );
}
```

**Benefits:** Used in Partial Payment input, can be used elsewhere

---

### 7. AmountInput
**Type:** Form
**Current Usage:** Partial amount input with calculate button (lines 326-348)

**Current Code:**
```jsx
<div className="flex gap-2">
  <input type="number" value={partialAmount} onChange={(e) => { setPartialAmount(e.target.value); setCalculatedPending(null); }} placeholder="Actual Amount Paid (₹)" className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white" required />
  <button type="button" onClick={calculatePending} className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 rounded-lg text-sm font-medium flex items-center gap-1 transition-all">
    <Calculator size={16} />
    Calc
  </button>
</div>
```

---

### 8. SalaryBreakdown
**Type:** UI/Display
**Current Usage:** Shows final payout calculation (lines 352-372)

**Current Code:**
```jsx
<div className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border border-blue-800/50 rounded-xl p-5 shadow-lg flex flex-col gap-2 my-2">
  <div className="flex justify-between items-center border-b border-blue-800/50 pb-2">
    <span className="text-blue-300 text-sm">Today's Pay</span>
    <span className="text-blue-200 font-medium">₹{getTodayPaid()}</span>
  </div>
  {/* ... more rows */}
</div>
```

**Suggested Implementation:**
```jsx
function SalaryBreakdown({ items, total, totalLabel = "Final Payout" }) {
  return (
    <div className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border border-blue-800/50 rounded-xl p-5 shadow-lg flex flex-col gap-2 my-2">
      {items.map(item => (
        <div key={item.label} className="flex justify-between items-center border-b border-blue-800/50 pb-2">
          <span className="text-blue-300 text-sm">{item.label}</span>
          <span className={item.colorClass}>{item.value}</span>
        </div>
      ))}
      <div className="flex justify-between items-center pt-2">
        <span className="text-white font-bold uppercase tracking-wider text-sm">{totalLabel}</span>
        <div className="text-2xl font-bold text-white">{total}</div>
      </div>
    </div>
  );
}
```

---

### 9. SalaryHistoryItem
**Type:** UI/List
**Current Usage:** Display salary history in history tab (lines 430-457)

**Current Code:** Similar pattern to other list items in the app

---

## Priority Recommendations

1. **High Priority:** TabSwitcher, CategorySelect, EmployeeSelect - Used across all payroll forms
2. **Medium Priority:** EmployeeSummaryCard, CheckboxListItem, ToggleButtonGroup - Complex business logic components
3. **Low Priority:** AmountInput, SalaryBreakdown, SalaryHistoryItem - More specific

## Cross-File Patterns

This file shares patterns with:
- `AdvancePaymentForm.js` - CategorySelect, EmployeeSelect, EmployeeSummaryCard
- `PendingSalaryForm.js` - TabSwitcher pattern
- `ExtraWorkManager.js` - CategorySelect, EmployeeSelect
- `HistoryStatsDashboard.js` - Similar history item patterns