# Component Analysis: BricksCountManager.js

## Summary
This file manages brick production teams and daily production entries. Has the most sophisticated internal component structure with 4 view components defined internally.

## Recommended Components

### 1. Header
**Type:** Navigation/Layout
**Current Usage:** Used in CreateTeamForm view (lines 24-43)
**Suggested Props:** `onBack`, `title`, `subtitle`, `icon`, `iconClass`

**Current Code:**
```jsx
function Header({ onBack, title, subtitle, icon: Icon, iconClass = "text-emerald-400" }) {
  return (
    <div className="flex items-center gap-3 px-4 pt-5 pb-4 border-b border-gray-800 flex-shrink-0">
      <button onClick={onBack} className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 active:scale-95 transition-all" aria-label="Go back">
        <ArrowLeft size={20} />
      </button>
      <div>
        <div className="flex items-center gap-2">
          {Icon && <Icon size={18} className={iconClass} />}
          <h1 className="text-lg font-semibold leading-tight">{title}</h1>
        </div>
        {subtitle && <p className="text-gray-400 text-xs mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
```

**Benefits:** Reusable header across all internal views and other pages

---

### 2. SearchInput
**Type:** Form
**Current Usage:** Team search in TeamList view (lines 76-88)
**Suggested Props:** `value`, `onChange`, `placeholder`

**Current Code:**
```jsx
<input type="text" placeholder="Search team or location…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all" />
```

**Suggested Implementation:**
```jsx
function SearchInput({ value, onChange, placeholder = "Search..." }) {
  return (
    <input type="text" placeholder={placeholder} value={value} onChange={onChange} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all" />
  );
}
```

**Benefits:** Consistent search styling across app (also used in SalesDashboardHistory)

---

### 3. TeamListItem
**Type:** UI/List
**Current Usage:** Display team in list (lines 98-125)
**Suggested Props:** `team`, `index`, `locationColor`, `onClick`

**Current Code:**
```jsx
<button key={team.id} onClick={() => onSelectTeam(team)} className="w-full flex items-center justify-between bg-gray-800 border border-gray-700 hover:border-emerald-600/50 active:scale-[0.98] rounded-2xl px-4 py-3.5 transition-all duration-150 group">
  <div className="flex items-center gap-3">
    <div className="w-9 h-9 rounded-xl bg-emerald-600/20 flex items-center justify-center flex-shrink-0">
      <span className="text-emerald-400 font-bold text-sm">{index + 1}</span>
    </div>
    <div className="text-left">
      <p className="text-white font-semibold text-sm leading-tight">{team.team_name}</p>
      <div className="flex items-center gap-1 mt-0.5">
        <MapPin size={10} className="text-gray-500 flex-shrink-0" />
        <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${locationColor(team.location_tag)}`}>
          {team.location_tag || "No location"}
        </span>
      </div>
    </div>
  </div>
  <ChevronRight size={18} className="text-gray-600 group-hover:text-emerald-400 transition-colors flex-shrink-0" />
</button>
```

**Suggested Implementation:**
```jsx
function TeamListItem({ team, index, onClick, locationColorFn }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between bg-gray-800 border border-gray-700 hover:border-emerald-600/50 active:scale-[0.98] rounded-2xl px-4 py-3.5 transition-all duration-150 group">
      {/* Team avatar with number */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-600/20 flex items-center justify-center">
          <span className="text-emerald-400 font-bold text-sm">{index + 1}</span>
        </div>
        <div className="text-left">
          <p className="text-white font-semibold text-sm">{team.team_name}</p>
          {/* Location tag */}
          <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${locationColorFn(team.location_tag)}`}>
            {team.location_tag || "No location"}
          </span>
        </div>
      </div>
      <ChevronRight size={18} className="text-gray-600 group-hover:text-emerald-400" />
    </button>
  );
}
```

**Benefits:** Reusable for any list with index numbers and location tags

---

### 4. AddButton
**Type:** UI
**Current Usage:** "Add New Team" button (lines 129-143)
**Suggested Props:** `onClick`, `label`, `icon`, `colorClass`

**Current Code:**
```jsx
<button onClick={onAddTeam} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-emerald-700/60 hover:border-emerald-500 hover:bg-emerald-500/5 rounded-2xl py-4 mt-2 text-emerald-500 hover:text-emerald-400 font-semibold text-sm active:scale-95 transition-all">
  <Plus size={18} />
  Add New Team
</button>
```

**Suggested Implementation:**
```jsx
function AddButton({ onClick, label = "Add New", icon: Icon = Plus, colorClass = "emerald" }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-center gap-2 border-2 border-dashed border-${colorClass}-700/60 hover:border-${colorClass}-500 hover:bg-${colorClass}-500/5 rounded-2xl py-4 mt-2 text-${colorClass}-500 hover:text-${colorClass}-400 font-semibold text-sm active:scale-95 transition-all`}>
      <Icon size={18} />
      {label}
    </button>
  );
}
```

**Benefits:** Consistent "add new" styling across all CRUD operations

---

### 5. FormInput
**Type:** Form
**Current Usage:** Team Name, Location Tag inputs (lines 215-239)
**Current Code:** Same pattern as other files

---

### 6. TabSwitcher
**Type:** Navigation
**Current Usage:** "Log Production" / "Recent History" tabs (lines 411-424)

**Current Code:**
```jsx
<button onClick={() => setActiveTab('form')} className={`flex-1 py-3 text-sm font-semibold transition-all border-b-2 ${activeTab === 'form' ? 'text-emerald-400 border-emerald-400 bg-emerald-400/10' : 'text-gray-500 border-transparent hover:bg-gray-800'}`}>
  Log Production
</button>
```

**Note:** Same pattern as FuelInputForm/FuelOutputForm - should be extracted to shared component

---

### 7. ProductionListItem
**Type:** UI/List
**Current Usage:** Display production entries in history (lines 493-512)

**Current Code:**
```jsx
<div key={h.id} className="flex items-center justify-between bg-gray-800/80 border border-gray-700 rounded-2xl p-4 shadow-sm group">
  <div>
    <div className="flex items-center gap-2 mb-0.5">
      <span className="text-emerald-400 font-bold text-lg">{h.bricks_count.toLocaleString("en-IN")}</span>
      <span className="text-gray-500 text-xs">bricks</span>
    </div>
    <div className="flex items-center gap-2 text-gray-500 text-xs">
      <Clock size={12} />
      <span>{h.entry_date}</span>
    </div>
  </div>
  <button type="button" onClick={() => setConfirmDelete({ show: true, id: h.id })} className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all active:scale-95" title="Delete Entry">
    <Trash2 size={18} />
  </button>
</div>
```

**Benefits:** Could generalize to `HistoryListItem` for use in payroll, sales history

---

### 8. InlineModal (Delete Confirmation)
**Type:** UI
**Current Usage:** Delete confirmation dialog (lines 349-376)

**Current Code:** Reusable pattern - should use shared ConfirmModal instead

---

## Priority Recommendations

1. **High Priority:** Header - Already well-structured, extract for reuse
2. **Medium Priority:** SearchInput, AddButton, TabSwitcher - Used in multiple places
3. **Low Priority:** TeamListItem, ProductionListItem - More specific to this domain

## Architecture Note

This file demonstrates excellent component architecture with 4 internal components (Header, TeamList, CreateTeamForm, TeamEntryForm). Consider this as a model when extracting components - each has clear single responsibility.