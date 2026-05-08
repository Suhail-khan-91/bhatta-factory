# Component Analysis: AdminSettings.js

## Summary
Admin panel for managing application settings (pricing, gas stations, machines, lead sources, etc.) with CRUD operations on settings arrays.

## Recommended Components

### 1. SettingsCategoryCard
**Type:** Layout
**Current Usage:** Each settings category section (lines 202-242)
**Suggested Props:** `title`, `values`, `onAdd`, `onDelete`, `inputValue`, `onInputChange`

**Current Code:**
```jsx
<div key={cat.key} className="bg-gray-800 border border-gray-700 rounded-2xl p-4">
  <h2 className="text-sm font-bold text-gray-200 mb-3 uppercase tracking-wider">{cat.label}</h2>
  <div className="flex flex-wrap gap-2 mb-4">
    {values.length === 0 ? (
      <span className="text-gray-500 text-xs italic">No items added.</span>
    ) : (
      values.map((v) => (
        <div key={v} className="flex items-center gap-1.5 bg-gray-700 text-gray-200 text-sm px-3 py-1.5 rounded-lg border border-gray-600">
          <span>{v}</span>
          <button onClick={() => handleDelete(cat.key, v)} className="text-red-400 hover:text-red-300 transition-colors ml-1 p-0.5">
            <X size={14} />
          </button>
        </div>
      ))
    )}
  </div>
  <div className="flex gap-2">
    <input type="text" placeholder={`Add new ${cat.label.toLowerCase()}...`} value={inputs[cat.key] || ""} onChange={(e) => setInputs((prev) => ({ ...prev, [cat.key]: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && handleAdd(cat.key)} className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
    <button onClick={() => handleAdd(cat.key)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1 transition-all active:scale-95">
      <Plus size={16} /> Add
    </button>
  </div>
</div>
```

**Suggested Implementation:**
```jsx
function SettingsCategoryCard({ title, values, onAdd, onDelete, inputValue, onInputChange, placeholder }) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4">
      <h2 className="text-sm font-bold text-gray-200 mb-3 uppercase tracking-wider">{title}</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        {values.length === 0 ? <span className="text-gray-500 text-xs italic">No items added.</span> : values.map(v => (
          <div key={v} className="flex items-center gap-1.5 bg-gray-700 text-gray-200 text-sm px-3 py-1.5 rounded-lg border border-gray-600">
            <span>{v}</span>
            <button onClick={() => onDelete(v)} className="text-red-400 hover:text-red-300"><X size={14} /></button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="text" value={inputValue} onChange={onInputChange} onKeyDown={(e) => e.key === "Enter" && onAdd()} placeholder={placeholder} className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white" />
        <button onClick={onAdd} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-1"><Plus size={16} /> Add</button>
      </div>
    </div>
  );
}
```

---

### 2. TagChip
**Type:** UI
**Current Usage:** Display settings value as removable tag (lines 210-222)
**Suggested Props:** `value`, `onDelete`

**Current Code:**
```jsx
<div className="flex items-center gap-1.5 bg-gray-700 text-gray-200 text-sm px-3 py-1.5 rounded-lg border border-gray-600">
  <span>{v}</span>
  <button onClick={() => handleDelete(cat.key, v)} className="text-red-400 hover:text-red-300 transition-colors ml-1 p-0.5">
    <X size={14} />
  </button>
</div>
```

---

### 3. AddInput
**Type:** Form
**Current Usage:** Input for adding new values (lines 227-233)

**Current Code:**
```jsx
<input type="text" placeholder={`Add new ${cat.label.toLowerCase()}...`} value={inputs[cat.key] || ""} onChange={(e) => setInputs((prev) => ({ ...prev, [cat.key]: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && handleAdd(cat.key)} className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
```

---

### 4. AddButton
**Type:** UI
**Current Usage:** Add new value button (lines 235-240)

**Current Code:**
```jsx
<button onClick={() => handleAdd(cat.key)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1 transition-all active:scale-95">
  <Plus size={16} /> Add
</button>
```

---

### 5. PricingSection
**Type:** Layout
**Current Usage:** Price per trawli settings (lines 162-196)
**Suggested Props:** `value`, `onChange`, `onSave`, `history`

**Current Code:**
```jsx
<div className="bg-gray-800 border border-gray-700 rounded-2xl p-4">
  <h2 className="text-sm font-bold text-gray-200 mb-3 uppercase tracking-wider">Pricing</h2>
  <div className="flex gap-2">
    <div className="relative flex-1">
      <span className="absolute left-3 top-2.5 text-gray-400">₹</span>
      <input type="number" placeholder="Price per Trawli" value={priceInput} onChange={(e) => setPriceInput(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-7 pr-3 py-2 text-sm text-white" />
    </div>
    <button onClick={handleUpdatePrice} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1">
      Save
    </button>
  </div>
  {pricingHistory.length > 0 && (
    <div className="mt-4 pt-3 border-t border-gray-700">
      <p className="text-gray-400 text-xs font-semibold mb-2">History (Last 5)</p>
      <ul className="space-y-1">
        {[...pricingHistory].sort((a, b) => new Date(b.changed_at) - new Date(a.changed_at)).slice(0, 5).map((h, i) => (
          <li key={i} className="text-gray-300 text-xs">₹{h.price} — {formatDate(h.changed_at)}</li>
        ))}
      </ul>
    </div>
  )}
</div>
```

---

### 6. SettingsHeader
**Type:** Navigation/Layout
**Current Usage:** Page header with back button and title (lines 134-152)

**Current Code:**
```jsx
<div className="flex items-center justify-between px-4 py-4 border-b border-gray-800 bg-gray-900/95 backdrop-blur">
  <div className="flex items-center gap-3">
    <button onClick={onClose} className="p-2 -ml-2 rounded-xl bg-gray-800 hover:bg-gray-700 active:scale-95 transition-all text-gray-300">
      <ArrowLeft size={18} />
    </button>
    <div>
      <h1 className="text-xl font-bold">Admin Panel</h1>
      <p className="text-gray-400 text-xs mt-0.5">Manage dropdown options</p>
    </div>
  </div>
  <button onClick={onClose} className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 active:scale-95 transition-all text-gray-300" aria-label="Close">
    <X size={20} />
  </button>
</div>
```

---

### 7. LoadingSpinner
**Type:** UI
**Current Usage:** Loading state (lines 155-158)

**Current Code:**
```jsx
<div className="flex items-center justify-center h-40">
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
</div>
```

**Note:** Could be standardized app-wide

---

## Priority Recommendations

1. **High Priority:** SettingsCategoryCard - Core functionality, could be shared if more admin sections added
2. **Medium Priority:** PricingSection - Specific to this admin but well-structured
3. **Low Priority:** TagChip, AddInput, AddButton, SettingsHeader - Simple enough to not warrant extraction

## Cross-File Patterns

This is a unique file - most patterns don't appear elsewhere. The main value is in demonstrating CRUD UI patterns for array-based settings.