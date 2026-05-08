# Component Analysis: FuelInputForm.js

## Summary
This file implements a fuel purchase input form with tabs for form entry and purchase history. Contains reusable patterns for forms, tabs, and list items.

## Recommended Components

### 1. Combobox
**Type:** Form/UI
**Current Usage:** Used 3 times (Gas Station Name, Purchaser Name)
**Suggested Props:**
- `id: string`, `value: string`, `onChange: (value: string) => void`, `options: string[]`, `placeholder: string`, `accentClass?: string`

**Current Code:**
```jsx
// Local Combobox component (lines 12-102) - 90 lines
// Should be replaced with:
// import Combobox from "@/components/ui/Combobox";
```

**Benefits:** Eliminate 90 lines of duplicate code. Already exists as shared component.

---

### 2. FormInput
**Type:** Form
**Current Usage:** Used 4 times (Liters Bought, Total Cost, Date, Receipt Photo)
**Suggested Props:** `type`, `value`, `onChange`, `placeholder`, `error`, `accept`, `label`

**Current Code Pattern:**
```jsx
const inputCls = (field) =>
  `w-full bg-gray-800 border rounded-xl px-4 py-3 text-white text-base
   placeholder-gray-500 focus:outline-none focus:ring-2 transition-all
   ${errors[field]
     ? "border-red-500 focus:ring-red-500/40"
     : "border-gray-700 focus:ring-blue-500/40 focus:border-blue-500"}`;
```

**Suggested Extraction:**
```jsx
function FormInput({ label, type = "text", value, onChange, placeholder, error, accept, inputMode }) {
  return (
    <div>
      {label && <label className="block text-gray-400 text-xs font-medium uppercase tracking-wider mb-1.5">{label}</label>}
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} inputMode={inputMode} accept={accept} className={inputStyles(error)} />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
```

**Benefits:** Consistent input styling, built-in error handling, reusable across all fuel forms.

---

### 3. TabSwitcher
**Type:** Navigation/UI
**Current Usage:** Two tabs - "Log Purchase" and "Recent Purchases"
**Suggested Props:**
- `tabs: { key: string, label: string }[]` - Tab configuration
- `activeTab: string` - Current active tab
- `onChange: (key: string) => void` - Tab change callback
- `accentColor?: string` - Active tab color (e.g., "blue-400")

**Current Code:**
```jsx
<div className="flex">
  <button onClick={() => setActiveTab('form')} className={`flex-1 py-3 text-sm font-semibold transition-all border-b-2 ${activeTab === 'form' ? 'text-blue-400 border-blue-400 bg-blue-400/10' : 'text-gray-500 border-transparent hover:bg-gray-800'}`}>
    Log Purchase
  </button>
  <button onClick={() => setActiveTab('history')} className={`flex-1 py-3 text-sm font-semibold transition-all border-b-2 ${activeTab === 'history' ? 'text-blue-400 border-blue-400 bg-blue-400/10' : 'text-gray-500 border-transparent hover:bg-gray-800'}`}>
    Recent Purchases
  </button>
</div>
```

**Suggested Implementation:**
```jsx
function TabSwitcher({ tabs, activeTab, onChange, accentColor = "blue-400" }) {
  return (
    <div className="flex">
      {tabs.map(tab => (
        <button key={tab.key} onClick={() => onChange(tab.key)} className={`flex-1 py-3 text-sm font-semibold transition-all border-b-2 ${activeTab === tab.key ? `text-${accentColor} border-${accentColor} bg-${accentColor}/10` : 'text-gray-500 border-transparent hover:bg-gray-800'}`}>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
```

**Benefits:** Reusable across all tabbed views (FuelOutputForm, GiveSalaryForm, OrderBricksForm, etc.)

---

### 4. PurchaseListItem
**Type:** UI/List
**Current Usage:** Displays recent purchases in history tab
**Suggested Props:**
- `item: object` - Data object with purchase details
- `onDelete?: (id: number) => void` - Delete callback
- `accentColor?: string` - Color for quantity display

**Current Code:**
```jsx
<div key={stock.id} className="flex items-center justify-between bg-gray-800/80 border border-gray-700 rounded-xl p-4 shadow-sm">
  <div>
    <div className="flex items-center gap-2 mb-1">
      <span className="text-blue-400 font-bold text-base">{stock.liters_bought}L</span>
      <span className="text-gray-500 text-xs">({stock.liters_remaining}L remaining)</span>
    </div>
    <p className="text-gray-300 text-sm font-medium">{stock.station_name}</p>
    <p className="text-gray-500 text-xs">{new Date(stock.purchase_date).toLocaleDateString()} · by {stock.purchaser_name}</p>
  </div>
  <button type="button" onClick={() => setConfirmDelete({ isOpen: true, id: stock.id })} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors active:scale-95" title="Delete Purchase">
    <Trash2 size={18} />
  </button>
</div>
```

**Suggested Implementation:**
```jsx
function ListItem({ title, subtitle, metadata, value, valueLabel, onDelete, accentColor = "blue-400" }) {
  return (
    <div className="flex items-center justify-between bg-gray-800/80 border border-gray-700 rounded-xl p-4 shadow-sm">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-${accentColor} font-bold text-base`}>{value}{valueLabel}</span>
          {metadata && <span className="text-gray-500 text-xs">{metadata}</span>}
        </div>
        <p className="text-gray-300 text-sm font-medium">{title}</p>
        {subtitle && <p className="text-gray-500 text-xs">{subtitle}</p>}
      </div>
      {onDelete && <button type="button" onClick={onDelete} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors active:scale-95"><Trash2 size={18} /></button>}
    </div>
  );
}
```

**Benefits:** Consistent list item display across history views in FuelOutputForm, BricksCountManager, GiveSalaryForm, etc.

---

### 5. SubmitButton
**Type:** UI
**Current Usage:** "Log Fuel Purchase" button
**Suggested Props:** `isLoading`, `loadingText`, `icon`, `children`, `colorClass`

**Current Code:**
```jsx
<button type="submit" disabled={isLoading} className="w-full py-4 rounded-2xl disabled:opacity-50 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold text-lg transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2">
  {isLoading ? "Saving..." : <><Fuel size={20} />Log Fuel Purchase</>}
</button>
```

**Benefits:** Consistent button styling with loading states across app

---

### 6. EmptyState
**Type:** UI
**Current Usage:** When no recent purchases found
**Suggested Props:**
- `message: string` - Message to display
- `icon?: ReactNode` - Optional icon

**Current Code:**
```jsx
<p className="text-gray-500 text-sm text-center py-4 bg-gray-800/50 rounded-xl border border-gray-700/50">No recent purchases found.</p>
```

**Suggested Implementation:**
```jsx
function EmptyState({ message, icon: Icon }) {
  return (
    <p className="text-gray-500 text-sm text-center py-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
      {Icon && <Icon size={16} className="inline mr-2" />}
      {message}
    </p>
  );
}
```

**Benefits:** Consistent empty state messaging across all list views

---

## Priority Recommendations

- **High Priority:** Combobox - Duplicate code (90 lines). Use shared component.

- **Medium Priority:** FormInput, TabSwitcher, SubmitButton - Used in multiple files with similar patterns.

- **Low Priority:** ListItem, EmptyState - Nice to have for consistency but less reused.

---

## Cross-File Patterns

The patterns in this file also appear in:
- `FuelOutputForm.js` - Similar Combobox, TabSwitcher, ListItem patterns
- `BricksCountManager.js` - Similar TabSwitcher, ListItem, Header patterns
- `GiveSalaryForm.js` - Similar TabSwitcher patterns
- `OrderBricksForm.js` - Similar TabSwitcher, SECTION wrapper patterns

Extracting these components would provide consistency across the entire application.