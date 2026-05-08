# Component Analysis: SalesDashboardHistory.js

## Summary
Sales analytics dashboard with KPIs, lead source breakdown, revenue trends, and order history.

## Recommended Components

### 1. TimeRangeSelector
**Type:** Navigation
**Current Usage:** 7D/1M/Year time filter (lines 104-109)
**Suggested Props:** `ranges`, `selected`, `onChange`

**Current Code:**
```jsx
<div className="flex gap-2 p-1 bg-gray-800/60 rounded-xl border border-gray-700">
  {TIME_RANGES.map(r => (
    <button key={r} onClick={() => setTimeRange(r)} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${timeRange === r ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30" : "text-gray-400 hover:text-white"}`}>
      {r}
    </button>
  ))}
</div>
```

**Suggested Implementation:**
```jsx
function TimeRangeSelector({ ranges, selected, onChange }) {
  return (
    <div className="flex gap-2 p-1 bg-gray-800/60 rounded-xl border border-gray-700">
      {ranges.map(r => (
        <button key={r} onClick={() => onChange(r)} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${selected === r ? "bg-orange-500 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}>
          {r}
        </button>
      ))}
    </div>
  );
}
```

**Benefits:** Used in FuelAnalyticsDashboard, ProductionAnalyticsDashboard

---

### 2. KPICard
**Type:** UI/Display
**Current Usage:** Dashboard statistics cards (lines 112-121)
**Suggested Props:** `label`, `value`, `icon`, `accentClass`

**Current Code:**
```jsx
<div className={`rounded-2xl bg-gradient-to-br ${accent} shadow-lg ${glow} p-4`}>
  <div className="flex items-center justify-between mb-2">
    <span className="text-white/70 text-xs font-medium">{label}</span>
    <div className="bg-white/20 rounded-lg p-1.5"><Icon size={14} className="text-white" /></div>
  </div>
  <p className="text-white font-extrabold text-xl leading-tight">{value}</p>
</div>
```

**Suggested Implementation:**
```jsx
function KPICard({ label, value, icon: Icon, fromGradient, toGradient, shadow }) {
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${fromGradient} ${toGradient} shadow-lg ${shadow} p-4`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/70 text-xs font-medium">{label}</span>
        <div className="bg-white/20 rounded-lg p-1.5"><Icon size={14} className="text-white" /></div>
      </div>
      <p className="text-white font-extrabold text-xl leading-tight">{value}</p>
    </div>
  );
}
```

**Benefits:** Used in all analytics dashboards (FuelAnalyticsDashboard, ProductionAnalyticsDashboard)

---

### 3. ProgressBar
**Type:** UI
**Current Usage:** Lead source breakdown (lines 130-140)

**Current Code:**
```jsx
<div className="h-2 bg-gray-700 rounded-full overflow-hidden">
  <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500" style={{ width: `${(amt / maxLeadVal) * 100}%` }} />
</div>
```

**Suggested Implementation:**
```jsx
function ProgressBar({ value, max, colorClass = "orange" }) {
  return (
    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
      <div className={`h-full rounded-full bg-gradient-to-r from-${colorClass}-500 to-${colorColor || colorClass}-500 transition-all duration-500`} style={{ width: `${(value / max) * 100}%` }} />
    </div>
  );
}
```

---

### 4. RevenueChart (SVG)
**Type:** UI/Visualization
**Current Usage:** Revenue trend visualization (lines 145-178)
**Note:** Complex SVG chart - not recommended for extraction as component

---

### 5. SearchInput
**Type:** Form
**Current Usage:** Order search (lines 184-186)
**Note:** Same pattern as BricksCountManager - extract to shared

---

### 6. OrderListItem
**Type:** UI/List
**Current Usage:** Display order in history (lines 191-225)

**Current Code:**
```jsx
<div key={order.id} className="rounded-2xl bg-gray-800/70 border border-gray-700/50 px-4 py-4">
  <div className="flex items-start justify-between mb-2">
    <div>
      <p className="text-white font-bold text-sm">{order.customer_name}</p>
      <p className="text-gray-500 text-xs">{order.order_date} · via {order.lead_source || "Direct"}</p>
    </div>
    <span className={`text-xs border rounded-full px-2.5 py-0.5 font-semibold whitespace-nowrap ${s.bg} ${s.text} ${s.border}`}>
      {order.status.replace("_", " ")}
    </span>
  </div>
  <div className="flex gap-4 text-xs mt-2">
    <span className="text-gray-400">Paid: <span className="text-white font-semibold">₹{Number(order.paid_amount).toLocaleString("en-IN")}</span><span className="text-gray-600">/₹{Number(order.total_amount).toLocaleString("en-IN")}</span></span>
    <span className="text-gray-400">{dispLabel}: <span className="text-white font-semibold">{order.dispatched_qty}</span><span className="text-gray-600">/{order.total_qty}</span></span>
  </div>
  {pending > 0 && order.status !== "Force_Closed" && order.status !== "Cancelled" && (
    <p className="text-red-400/80 text-xs mt-1.5">Balance: ₹{pending.toLocaleString("en-IN")}</p>
  )}
</div>
```

---

### 7. StatusBadge
**Type:** UI
**Current Usage:** Order status display (lines 8-13, 202)
**Note:** Already extracted as STATUS_STYLES utility

---

## Priority Recommendations

1. **High Priority:** TimeRangeSelector, KPICard, ProgressBar - Used across all analytics
2. **Medium Priority:** SearchInput, OrderListItem
3. **Low Priority:** StatusBadge - Already extracted

## Cross-File Patterns

- TimeRangeSelector: FuelAnalyticsDashboard, ProductionAnalyticsDashboard
- KPICard: FuelAnalyticsDashboard, ProductionAnalyticsDashboard
- ProgressBar: FuelAnalyticsDashboard, ProductionAnalyticsDashboard
- OrderListItem: DispatchManager history