# Component Analysis: OrderBricksForm.js

## Summary
Sales order form with customer details, order configuration, financials, and PDF invoice generation.

## Recommended Components

### 1. Section
**Type:** Layout
**Current Usage:** Form sections with headers (lines 12-20)
**Suggested Props:** `icon`, `title`, `accent`, `children`

**Current Code:**
```jsx
const SECTION = ({ icon: Icon, title, accent, children }) => (
  <div className="rounded-2xl bg-gray-800/70 border border-gray-700/50 mb-4">
    <div className={`flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r ${accent} border-b border-white/10 rounded-t-2xl`}>
      <Icon size={16} className="text-white/80" />
      <span className="text-white font-semibold text-sm tracking-wide uppercase">{title}</span>
    </div>
    <div className="px-4 py-4 space-y-4">{children}</div>
  </div>
);
```

**Benefits:** Reusable across other sales forms and complex forms elsewhere

---

### 2. Field
**Type:** Form/Layout
**Current Usage:** Label + input wrapper (lines 22-28)
**Suggested Props:** `label`, `hint`, `children`

**Current Code:**
```jsx
const Field = ({ label, hint, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-gray-400 text-xs font-medium uppercase tracking-wider">{label}</label>
    {children}
    {hint && <p className="text-gray-500 text-xs mt-0.5">{hint}</p>}
  </div>
);
```

**Benefits:** Used extensively - extract for consistency

---

### 3. CustomDropdown
**Type:** Form
**Current Usage:** Wrapper for Combobox with Field (lines 30-36)
**Suggested Props:** `label`, `options`, `value`, `onChange`, `placeholder`, `zIndex`

**Current Code:**
```jsx
const CustomDropdown = ({ label, options, value, onChange, placeholder, zIndex = "z-50" }) => (
  <div className={`relative ${zIndex}`}>
    <Field label={label}>
      <Combobox id={label.replace(/\s+/g, '')} options={options} value={value} onChange={onChange} placeholder={placeholder} />
    </Field>
  </div>
);
```

**Benefits:** Combobox with consistent wrapper styling

---

### 4. TabSwitcher
**Type:** Navigation
**Current Usage:** "New Order" and "Order History" tabs (lines 338-351)
**Note:** Similar pattern to other files - extract as shared

---

### 5. ToggleButtonGroup
**Type:** Form
**Current Usage:** Trawli vs Custom brick order mode (lines 384-397)

**Current Code:**
```jsx
<div className="flex gap-2 p-1 bg-gray-900/60 rounded-xl border border-gray-700">
  <button onClick={() => setOrderMode("trawli")} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${orderMode === "trawli" ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30" : "text-gray-400 hover:text-gray-200"}`}>
    🚛 Order by Trawli
  </button>
  <button onClick={() => setOrderMode("custom")} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${orderMode === "custom" ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30" : "text-gray-400 hover:text-gray-200"}`}>
    🧱 Custom Bricks
  </button>
</div>
```

**Suggested Implementation:**
```jsx
function ToggleButtonGroup({ options, selected, onChange }) {
  return (
    <div className="flex gap-2 p-1 bg-gray-900/60 rounded-xl border border-gray-700">
      {options.map(opt => (
        <button key={opt.value} onClick={() => onChange(opt.value)} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${selected === opt.value ? "bg-orange-500 text-white shadow-lg" : "text-gray-400 hover:text-gray-200"}`}>
          {opt.icon} {opt.label}
        </button>
      ))}
    </div>
  );
}
```

---

### 6. TotalDisplay
**Type:** UI/Display
**Current Usage:** Shows calculated total amount (lines 417-423)

**Current Code:**
```jsx
<div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-4 text-center">
  <p className="text-emerald-400 text-xs font-medium uppercase tracking-widest mb-1">Total Amount</p>
  <p className="text-white text-4xl font-extrabold tracking-tight">₹{totalAmount.toLocaleString("en-IN")}</p>
  <p className="text-emerald-400/60 text-xs mt-1">
    {form.trawlisQty || "0"} trawli × ₹{Number(form.pricePerTrawli).toLocaleString("en-IN")}
  </p>
</div>
```

**Suggested Implementation:**
```jsx
function TotalDisplay({ label, amount, details, colorClass = "emerald" }) {
  return (
    <div className={`rounded-2xl bg-${colorClass}-500/10 border border-${colorClass}-500/30 px-4 py-4 text-center`}>
      <p className={`text-${colorClass}-400 text-xs font-medium uppercase tracking-widest mb-1`}>{label}</p>
      <p className="text-white text-4xl font-extrabold tracking-tight">₹{Number(amount).toLocaleString("en-IN")}</p>
      {details && <p className={`text-${colorClass}-400/60 text-xs mt-1`}>{details}</p>}
    </div>
  );
}
```

---

### 7. OrderHistoryItem
**Type:** UI/List
**Current Usage:** Display order in history (lines 472-500)

**Current Code:**
```jsx
<div key={order.id} className="bg-gray-800 border border-gray-700 rounded-2xl p-4">
  <div className="flex justify-between items-start mb-2">
    <div>
      <h3 className="font-bold text-white text-lg">{order.customer_name}</h3>
      <p className="text-gray-400 text-xs">{new Date(order.order_date).toLocaleDateString()}</p>
    </div>
    <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded-full font-semibold">
      ₹{Math.round(Number(order.total_amount)).toLocaleString('en-IN')}
    </span>
  </div>
  <div className="flex justify-between items-center mt-4">
    <p className="text-sm text-gray-300">Pending: <span className="text-orange-400 font-bold">₹{Math.max(0, pending).toLocaleString('en-IN')}</span></p>
    <button className="bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center gap-1 transition-colors">Bill 📄</button>
  </div>
</div>
```

---

### 8. PDFPreviewModal
**Type:** UI/Modal
**Current Usage:** Invoice preview with download (lines 509-555)

**Current Code:** Complex modal with iframe for PDF preview

**Note:** This is business logic specific to invoice generation - not recommended for extraction

---

## Priority Recommendations

1. **High Priority:** Section, Field - Used throughout this file and applicable to other complex forms
2. **Medium Priority:** CustomDropdown, ToggleButtonGroup, TotalDisplay
3. **Low Priority:** OrderHistoryItem - Specific to sales but could generalize

## Cross-File Patterns

- SECTION pattern used: OrderBricksForm (this file), DispatchManager
- Field pattern used: All sales forms
- TabSwitcher pattern: Throughout app