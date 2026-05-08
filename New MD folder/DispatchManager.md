# Component Analysis: DispatchManager.js

## Summary
Manages order dispatch, payment recording, and order completion for sales orders.

## Recommended Components

### 1. Section (same as OrderBricksForm)
**Type:** Layout
**Current Usage:** Form sections - Order Snapshot, Update Payment, Log Dispatch
**Note:** Use shared Section component from OrderBricksForm

---

### 2. Field
**Type:** Form/Layout
**Current Usage:** Multiple field definitions (lines 14-18)
**Note:** Use shared Field component from OrderBricksForm

---

### 3. SnapshotCard
**Type:** UI/Display
**Current Usage:** Shows order summary (lines 177-195)
**Suggested Props:** `items`, `gridColumns`

**Current Code:**
```jsx
<div className="rounded-2xl bg-gray-800/70 border border-gray-700/50 overflow-hidden">
  <div className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-gray-700/80 to-gray-600/80 border-b border-white/10">
    <Package size={16} className="text-white/80" />
    <span className="text-white font-semibold text-sm tracking-wide uppercase">Order Snapshot</span>
  </div>
  <div className="px-4 py-4 grid grid-cols-2 gap-3">
    {[
      { label: `Total ${labelQty}`, value: selectedOrder.total_qty, color: "text-white" },
      { label: "Remaining", value: remainingQty, color: remainingQty > 0 ? "text-orange-400" : "text-emerald-400" },
      { label: "Total Bill", value: `₹${Math.round(Number(selectedOrder.total_amount)).toLocaleString("en-IN")}`, color: "text-white" },
      { label: "Pending Balance", value: `₹${Math.max(0, pendingBalance).toLocaleString("en-IN")}`, color: pendingBalance > 0 ? "text-red-400" : "text-emerald-400" },
    ].map(({ label, value, color }) => (
      <div key={label} className="bg-gray-900/60 rounded-xl px-3 py-3">
        <p className="text-gray-400 text-xs mb-1">{label}</p>
        <p className={`font-bold text-base ${color}`}>{value}</p>
      </div>
    ))}
  </div>
</div>
```

**Suggested Implementation:**
```jsx
function SnapshotCard({ title, items, columns = 2 }) {
  return (
    <div className="rounded-2xl bg-gray-800/70 border border-gray-700/50 overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-gray-700/80 to-gray-600/80 border-b border-white/10">
        <Package size={16} className="text-white/80" />
        <span className="text-white font-semibold text-sm tracking-wide uppercase">{title}</span>
      </div>
      <div className={`px-4 py-4 grid grid-cols-${columns} gap-3`}>
        {items.map(({ label, value, color }) => (
          <div key={label} className="bg-gray-900/60 rounded-xl px-3 py-3">
            <p className="text-gray-400 text-xs mb-1">{label}</p>
            <p className={`font-bold text-base ${color}`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### 4. PaymentForm
**Type:** Form
**Current Usage:** Record payment section (lines 197-220)
**Suggested Props:** `pendingAmount`, `onSubmit`, `isLoading`

**Current Code:** Contains amount input, payment method select, submit button

**Note:** Similar patterns in GiveSalaryForm, AdvancePaymentForm

---

### 5. DispatchForm
**Type:** Form
**Current Usage:** Log dispatch section (lines 222-244)
**Suggested Props:** `remainingQty`, `drivers`, `onSubmit`, `isLoading`

**Current Code:** Contains quantity input, driver select, submit button

---

### 6. CloseOrderButton
**Type:** UI
**Current Usage:** Force close order section (lines 252-261)

**Current Code:**
```jsx
<div className="rounded-2xl bg-gray-800/70 border border-red-500/30 overflow-hidden mt-8">
  <div className="px-4 py-5">
    <h3 className="text-red-400 font-bold text-sm mb-1 flex items-center gap-2"><AlertTriangle size={16} /> Close Order Early</h3>
    <p className="text-gray-500 text-xs mb-4">Use this if the customer cancelled the remaining order or is unreachable.</p>
    <button onClick={() => setView("cancel")} className="w-full py-2.5 rounded-xl border border-red-500/50 text-red-400 font-bold text-sm hover:bg-red-500/10 active:scale-[0.98] transition-all">
      Force Close Order
    </button>
  </div>
</div>
```

**Suggested Implementation:**
```jsx
function DangerZone({ title, description, buttonLabel, onClick }) {
  return (
    <div className="rounded-2xl bg-gray-800/70 border border-red-500/30 overflow-hidden mt-8">
      <div className="px-4 py-5">
        <h3 className="text-red-400 font-bold text-sm mb-1 flex items-center gap-2"><AlertTriangle size={16} /> {title}</h3>
        <p className="text-gray-500 text-xs mb-4">{description}</p>
        <button onClick={onClick} className="w-full py-2.5 rounded-xl border border-red-500/50 text-red-400 font-bold text-sm hover:bg-red-500/10 active:scale-[0.98] transition-all">
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
```

---

### 7. CancelForm
**Type:** Form/Layout
**Current Usage:** Order cancellation view (lines 96-156)
**Note:** Uses Combobox for reason selection

---

## Priority Recommendations

1. **High Priority:** Section, Field - Use shared components
2. **Medium Priority:** SnapshotCard, DangerZone - Distinctive patterns for order management
3. **Low Priority:** PaymentForm, DispatchForm - Specific to this workflow

## Cross-File Patterns

- Section/Field: OrderBricksForm
- Combobox: Already available at ui/Combobox.js
- Similar payment patterns: GiveSalaryForm, AdvancePaymentForm