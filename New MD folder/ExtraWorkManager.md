# Component Analysis: ExtraWorkManager.js

## Summary
Manages extra work logging with three views: menu, entry form, and payment dashboard. Uses Combobox for work description selection.

## Recommended Components

### 1. MenuCard
**Type:** UI
**Current Usage:** Main menu buttons (lines 136-160)
**Suggested Props:** `onClick`, `title`, `description`, `icon`, `accentClass`

**Current Code:**
```jsx
<button onClick={() => setView('entry')} className="bg-gradient-to-br from-pink-600 to-rose-700 hover:from-pink-500 hover:to-rose-600 text-white p-6 rounded-2xl shadow-lg flex flex-col items-start gap-4 active:scale-95 transition-all text-left group border border-pink-500/20">
  <div className="bg-white/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
    <PlusCircle size={28} />
  </div>
  <div>
    <h2 className="text-xl font-bold mb-1">1. Log New Extra Work</h2>
    <p className="text-pink-200 text-sm opacity-90">Record a new task, overtime, or custom gig completed by a worker.</p>
  </div>
</button>
```

**Suggested Implementation:**
```jsx
function MenuCard({ onClick, number, title, description, icon: Icon, fromColor, toColor }) {
  return (
    <button onClick={onClick} className={`bg-gradient-to-br ${fromColor} ${toColor} text-white p-6 rounded-2xl shadow-lg flex flex-col items-start gap-4 active:scale-95 transition-all text-left group border border-white/20`}>
      <div className="bg-white/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
        <Icon size={28} />
      </div>
      <div>
        <h2 className="text-xl font-bold mb-1">{number}. {title}</h2>
        <p className="text-white/80 text-sm opacity-90">{description}</p>
      </div>
    </button>
  );
}
```

**Benefits:** Can be used for any main menu navigation in the app

---

### 2. Combobox (already exists)
**Type:** Form/UI
**Current Usage:** Work Description dropdown (lines 224-231)
**Note:** Should use shared component from `@/components/ui/Combobox`

---

### 3. CategorySelect, EmployeeSelect
**Type:** Form
**Current Usage:** Lines 196-219
**Note:** Same pattern as GiveSalaryForm - extract to shared

---

### 4. WorkTaskCard
**Type:** UI/List
**Current Usage:** Display extra work task in dashboard (lines 334-348)

**Current Code:**
```jsx
<div key={task.id} className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
  <div className="flex justify-between items-start mb-2">
    <div>
      <p className="text-slate-200 font-medium text-base">{task.work_name}</p>
      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Calendar size={12}/>{task.date_logged}</p>
    </div>
    <p className="text-emerald-400 font-bold">₹{task.amount}</p>
  </div>
  <button onClick={() => { setSelectedTask({...task, empName, category}); setView('pay'); }} className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-lg text-sm flex items-center justify-center gap-1.5 transition-colors">
    <CreditCard size={16}/> Pay Amount
  </button>
</div>
```

**Suggested Implementation:**
```jsx
function TaskCard({ task, onPay, onDelete }) {
  return (
    <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-slate-200 font-medium text-base">{task.title}</p>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Calendar size={12}/>{task.date}</p>
        </div>
        <p className="text-emerald-400 font-bold">{task.amount}</p>
      </div>
      {onPay && <button onClick={onPay} className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-lg text-sm flex items-center justify-center gap-1.5">Pay</button>}
    </div>
  );
}
```

---

### 5. PaymentConfirmationCard
**Type:** UI/Display
**Current Usage:** Payment summary before confirming (lines 391-406)

**Current Code:**
```jsx
<div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 shadow-inner space-y-3">
  <div className="flex justify-between items-center pb-2 border-b border-slate-700">
    <span className="text-slate-400 text-sm">Employee</span>
    <span className="font-semibold">{selectedTask.empName} ({selectedTask.category})</span>
  </div>
  <div className="flex justify-between items-center pb-2 border-b border-slate-700">
    <span className="text-slate-400 text-sm">Work Description</span>
    <span className="font-semibold text-right max-w-[60%]">{selectedTask.work_name}</span>
  </div>
  <div className="flex justify-between items-center">
    <span className="text-slate-400 text-sm">Amount to Pay</span>
    <span className="text-2xl font-bold text-emerald-400 flex items-center">
      <IndianRupee size={20}/>{selectedTask.amount}
    </span>
  </div>
</div>
```

**Suggested Implementation:**
```jsx
function ConfirmationCard({ items, total, totalLabel }) {
  return (
    <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 shadow-inner space-y-3">
      {items.map(item => (
        <div key={item.label} className="flex justify-between items-center pb-2 border-b border-slate-700">
          <span className="text-slate-400 text-sm">{item.label}</span>
          <span className="font-semibold">{item.value}</span>
        </div>
      ))}
      {total && <div className="flex justify-between items-center pt-2">
        <span className="text-slate-400 text-sm">{totalLabel}</span>
        <span className="text-2xl font-bold text-emerald-400">{total}</span>
      </div>}
    </div>
  );
}
```

---

## Priority Recommendations

1. **High Priority:** MenuCard - Distinctive pattern for main navigation
2. **Medium Priority:** TaskCard, CategorySection, ExpandableSection (from PendingSalaryForm)
3. **Low Priority:** ConfirmationCard - specific to payment flows

## View Structure Note

This component manages three distinct views (menu, entry, dashboard) - similar pattern to BricksCountManager. Could extract a ViewManager pattern.