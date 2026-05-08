# Component Analysis: FuelAnalyticsDashboard.js

## Summary
Fuel analytics with KPI cards, stock levels, usage by machine, and usage history. Shares patterns with SalesDashboardHistory.

## Recommended Components

### 1. TimeRangeSelector
**Type:** Navigation
**Current Usage:** 7D/1M/Year filter (lines 99-105)
**Note:** Same as SalesDashboardHistory - extract to shared

---

### 2. KPICard
**Type:** UI/Display
**Current Usage:** Current Stock, Total Spent, Total Consumed (lines 107-114)
**Note:** Same as SalesDashboardHistory - extract to shared

---

### 3. StockProgressCard
**Type:** UI/Display
**Current Usage:** Active fuel slots with progress bars (lines 117-135)

**Current Code:**
```jsx
<div className="rounded-2xl bg-gray-800/70 border border-gray-700/50 p-4">
  <h3 className="text-white font-bold text-sm mb-3">Active Fuel Slots</h3>
  <div className="space-y-3">
    {fuelStocks.filter(s => Number(s.liters_remaining) > 0).map(slot => {
      const pct = Math.round((Number(slot.liters_remaining) / Number(slot.liters_bought)) * 100);
      return (
        <div key={slot.id}>
          <div className="flex justify-between mb-1">
            <span className="text-gray-300 text-xs">{slot.station_name}</span>
            <span className="text-blue-400 text-xs font-semibold">{Number(slot.liters_remaining)}L / {Number(slot.liters_bought)}L</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-gray-600 text-[10px] mt-0.5">{new Date(slot.purchase_date).toLocaleDateString()} · by {slot.purchaser_name}</p>
        </div>
      );
    })}
  </div>
</div>
```

**Suggested Implementation:**
```jsx
function StockProgressCard({ title, items, progressKey, totalKey, formatFn }) {
  return (
    <div className="rounded-2xl bg-gray-800/70 border border-gray-700/50 p-4">
      <h3 className="text-white font-bold text-sm mb-3">{title}</h3>
      <div className="space-y-3">
        {items.map(item => {
          const progress = Math.round((item[progressKey] / item[totalKey]) * 100);
          return (
            <div key={item.id}>
              <div className="flex justify-between mb-1">
                <span className="text-gray-300 text-xs">{item.name}</span>
                <span className="text-blue-400 text-xs font-semibold">{formatFn(item)}</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${progress}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

### 4. UsageByMachineCard
**Type:** UI/Display
**Current Usage:** Fuel usage breakdown by machine (lines 138-156)

**Current Code:**
```jsx
<div className="rounded-2xl bg-gray-800/70 border border-gray-700/50 p-4">
  <h3 className="text-white font-bold text-sm mb-4">Fuel Usage by Machine</h3>
  <div className="space-y-3">
    {Object.entries(machineMap).sort((a, b) => b[1] - a[1]).map(([machine, liters]) => (
      <div key={machine}>
        <div className="flex justify-between mb-1">
          <span className="text-gray-300 text-xs">{machine}</span>
          <span className="text-gray-400 text-xs font-semibold">{liters}L</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-500" style={{ width: `${(liters / maxMachine) * 100}%` }} />
        </div>
      </div>
    ))}
  </div>
</div>
```

**Note:** Same ProgressBar pattern as StockProgressCard - could generalize

---

### 5. UsageHistoryItem
**Type:** UI/List
**Current Usage:** Display usage in history tab (lines 162-172)

**Current Code:**
```jsx
{[...fuelUsages].sort((a,b) => new Date(b.usage_date) - new Date(a.usage_date)).map(log => (
  <div key={log.id} className="rounded-2xl bg-gray-800/70 border border-gray-700/50 px-4 py-3 flex items-center justify-between">
    <div>
      <p className="text-white font-semibold text-sm">{log.machine_name}</p>
      <p className="text-gray-500 text-xs">{new Date(log.usage_date).toLocaleString()} · by {log.given_by}</p>
    </div>
    <div className="text-right">
      <p className="text-blue-400 font-bold text-base">{Number(log.liters_used)}L</p>
    </div>
  </div>
))}
```

---

### 6. TabSwitcher
**Type:** Navigation
**Current Usage:** "Insights & Stats" and "Usage History" tabs (lines 86-90)

**Current Code:**
```jsx
<button key={t.key} onClick={() => setActiveTab(t.key)} className={`flex-1 py-3 text-sm font-semibold transition-all border-b-2 ${activeTab === t.key ? "text-blue-400 border-blue-400 bg-blue-400/10" : "text-gray-500 border-transparent hover:bg-gray-800"}`}>
  {t.label}
</button>
```

---

## Priority Recommendations

1. **High Priority:** TimeRangeSelector, KPICard - Shared with SalesDashboardHistory, ProductionAnalyticsDashboard
2. **Medium Priority:** StockProgressCard, UsageByMachineCard - Could generalize ProgressBar
3. **Low Priority:** UsageHistoryItem, TabSwitcher - Already covered elsewhere

## Cross-File Patterns

- TimeRangeSelector: SalesDashboardHistory, ProductionAnalyticsDashboard
- KPICard: SalesDashboardHistory, ProductionAnalyticsDashboard
- Progress bars: StockProgressCard, UsageByMachineCard (same pattern)
- Usage history: Same as SalesDashboardHistory order list