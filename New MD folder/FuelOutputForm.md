# Component Analysis: FuelOutputForm.js

## Summary
This file implements fuel usage logging with tabs for form entry and usage history. Shares many patterns with FuelInputForm.js.

## Recommended Components

### 1. Combobox
**Type:** Form/UI
**Current Usage:** Used 2 times (Machine Name, Given By)
**Current Issue:** 94-line local duplicate - should use shared component

**Recommendation:** Use `Combobox` from `@/components/ui/Combobox`

---

### 2. TabSwitcher
**Type:** Navigation
**Current Usage:** "Log Usage" and "Recent Usage" tabs
**Suggested Props:** `tabs`, `activeTab`, `onChange`, `accentColor`

**Current Code Pattern (same as FuelInputForm):**
```jsx
<button onClick={() => setActiveTab('form')} className={`flex-1 py-3 text-sm font-semibold transition-all border-b-2 ${activeTab === 'form' ? 'text-orange-400 border-orange-400 bg-orange-400/10' : 'text-gray-500 border-transparent hover:bg-gray-800'}`}>
  Log Usage
</button>
```

**Recommendation:** Create reusable `TabSwitcher` component with configurable accent color

---

### 3. FormInput
**Type:** Form
**Current Usage:** Liters Used, Date, Time inputs

**Current Code Pattern:**
```jsx
const inputCls = (field) => `w-full bg-gray-800 border rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:ring-2 transition-all appearance-none ${errors[field] ? "border-red-500 focus:ring-red-500/40" : "border-gray-700 focus:ring-orange-500/40 focus:border-orange-500"}`;

<input type="number" inputMode="decimal" placeholder="e.g. 5" value={form.liters_used} onChange={(e) => set("liters_used", e.target.value)} className={inputCls("liters_used")} />
```

**Recommendation:** Reuse FormInput from EmployeeOnboarding or FuelInputForm

---

### 4. StockIndicator
**Type:** UI/Display
**Current Usage:** Shows available fuel stock with color coding

**Current Code:**
```jsx
{totalStock !== null && (
  <p className="text-sm font-semibold mt-1" style={{color: totalStock < 20 ? '#ef4444' : '#22c55e'}}>
    ⛽ Available Stock: {totalStock}L
  </p>
)}
```

**Suggested Implementation:**
```jsx
function StockIndicator({ value, threshold = 20, unit = "L" }) {
  const isLow = value < threshold;
  return (
    <p className="text-sm font-semibold mt-1" style={{color: isLow ? '#ef4444' : '#22c55e'}}>
      ⛽ Available Stock: {value}{unit}
    </p>
  );
}
```

**Benefits:** Consistent low-stock warnings across fuel management

---

### 5. SubmitButton
**Type:** UI
**Current Usage:** "Log Fuel Usage" button with orange color theme

**Current Code:**
```jsx
<button type="submit" disabled={isLoading} className="w-full py-4 rounded-2xl disabled:opacity-50 bg-orange-500 hover:bg-orange-400 active:scale-95 text-white font-semibold text-lg transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2">
  {isLoading ? "Saving..." : <><Activity size={20} />Log Fuel Usage</>}
</button>
```

**Recommendation:** Add color variant support to shared SubmitButton

---

### 6. InlineModal
**Type:** UI
**Current Usage:** Success/Error feedback modal (lines 238-253)

**Current Code:**
```jsx
{modal.show && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
    <div className="bg-white rounded-2xl shadow-2xl p-6 mx-6 max-w-sm w-full text-center">
      <p className={`text-lg font-bold mb-4 ${modal.isError ? 'text-red-500' : 'text-green-600'}`}>
        {modal.isError ? '❌ Error' : '✅ Success'}
      </p>
      <p className="text-gray-700 text-sm mb-6">{modal.message}</p>
      <button onClick={() => setModal({show: false, message: '', isError: false})} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-8 rounded-xl">
        OK
      </button>
    </div>
  </div>
)}
```

**Recommendation:** Already have `ConfirmModal` at `ui/ConfirmModal.js` - use it consistently

---

## Priority Recommendations

1. **High Priority:** Combobox - 94-line duplicate, use shared component
2. **Medium Priority:** TabSwitcher, FormInput, SubmitButton - shared with FuelInputForm
3. **Low Priority:** StockIndicator - useful for consistency

## Duplicate Patterns with FuelInputForm.js

This file shares 80%+ patterns with FuelInputForm.js:
- Same TabSwitcher pattern (different accent color)
- Same ListItem pattern for history
- Same FormInput pattern with different error colors
- Same SubmitButton with different color
- Same InlineModal pattern

**Recommendation:** Create fuel-specific component library:
- `FuelFormLayout` - Wrapper for fuel forms
- `FuelTabSwitcher` - Pre-configured tabs with orange theme
- `FuelFormInput` - Pre-configured inputs with orange accent