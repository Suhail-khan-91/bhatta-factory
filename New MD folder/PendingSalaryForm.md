# Component Analysis: PendingSalaryForm.js

## Summary
Manages pending salary dues with expandable employee list and payment clearing functionality.

## Recommended Components

### 1. ExpandableSection
**Type:** UI/Layout
**Current Usage:** Employee expandable cards (lines 296-340)
**Suggested Props:** `title`, `isExpanded`, `onToggle`, `children`, `badge`

**Current Code:**
```jsx
<div key={emp.id} className="bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden">
  <button onClick={() => toggleEmployee(emp.id)} className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-800/80 transition-colors">
    <span className="font-semibold text-slate-200">{emp.full_name}</span>
    <div className="flex items-center gap-3">
      <span className="text-orange-400 font-bold flex items-center">
        <IndianRupee size={14} className="mr-0.5" />
        {totalDues.toLocaleString("en-IN")}
      </span>
      {isExpanded ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
    </div>
  </button>
  {isExpanded && (
    <div className="bg-slate-900 px-3 py-3 border-t border-slate-800 space-y-3">
      {/* Expanded content */}
    </div>
  )}
</div>
```

**Suggested Implementation:**
```jsx
function ExpandableSection({ title, value, valueColor, isExpanded, onToggle, children }) {
  return (
    <div className="bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-800/80 transition-colors">
        <span className="font-semibold text-slate-200">{title}</span>
        <div className="flex items-center gap-3">
          {value && <span className={valueColor}>{value}</span>}
          {isExpanded ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
        </div>
      </button>
      {isExpanded && <div className="bg-slate-900 px-3 py-3 border-t border-slate-800">{children}</div>}
    </div>
  );
}
```

**Benefits:** Used in ExtraWorkManager, SetSalaryDatabase, HistoryStatsDashboard

---

### 2. CategorySection
**Type:** Layout
**Current Usage:** Group employees by category (lines 283-346)
**Suggested Props:** `title`, `children`, `isEmpty`

**Current Code:**
```jsx
<div key={category} className="bg-slate-800 rounded-xl p-4 shadow-md border border-slate-700">
  <h2 className="text-lg font-bold text-slate-200 mb-3 border-b border-slate-700 pb-2">{category}</h2>
  <div className="space-y-3">{children}</div>
</div>
```

**Suggested Implementation:**
```jsx
function CategorySection({ title, children }) {
  return (
    <div className="bg-slate-800 rounded-xl p-4 shadow-md border border-slate-700">
      <h2 className="text-lg font-bold text-slate-200 mb-3 border-b border-slate-700 pb-2">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
```

**Benefits:** Used in ExtraWorkManager, SetSalaryDatabase, HistoryStatsDashboard

---

### 3. DueListItem
**Type:** UI/List
**Current Usage:** Show individual due in expanded view (lines 318-328)

**Current Code:**
```jsx
<div className="flex justify-between items-center text-sm p-2 rounded-md bg-slate-800/40">
  <div className="flex items-center text-slate-400 gap-1.5">
    <Calendar size={14} />
    <span>{new Date(due.transaction_date).toLocaleDateString()}</span>
  </div>
  <span className="text-slate-300 font-medium">₹{Number(due.due_created)}</span>
</div>
```

---

### 4. ClearDuesButton
**Type:** UI
**Current Usage:** Action button to pay dues (lines 332-338)

**Current Code:**
```jsx
<button onClick={() => setPayingEmployee(emp)} className="w-full mt-2 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-bold py-2.5 rounded-lg shadow disabled:opacity-50 transition-all text-sm flex justify-center items-center gap-1">
  <IndianRupee size={16}/>
  Clear Pending Dues
</button>
```

---

### 5. CheckboxList
**Type:** Form
**Current Usage:** Select dues to clear (lines 160-171)

**Current Code:** Same CheckboxListItem pattern from GiveSalaryForm

---

### 6. PaymentForm (in paying view)
**Type:** Form/Layout
**Current Usage:** Form to clear selected dues (lines 142-253)
**Note:** Contains patterns from GiveSalaryForm - could extract

---

## Priority Recommendations

1. **High Priority:** ExpandableSection - Used in multiple payroll forms
2. **Medium Priority:** CategorySection, DueListItem
3. **Low Priority:** ClearDuesButton - specific action button

## Cross-File Patterns

- ExpandableSection used in: ExtraWorkManager, SetSalaryDatabase, HistoryStatsDashboard
- CategorySection used in: ExtraWorkManager, SetSalaryDatabase, HistoryStatsDashboard
- CheckboxList pattern from GiveSalaryForm