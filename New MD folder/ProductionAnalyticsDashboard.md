# Component Analysis: ProductionAnalyticsDashboard.js

## Summary
Production analytics with KPI cards, team leaderboard, daily production trend, and entry ledger. Shares patterns with SalesDashboardHistory and FuelAnalyticsDashboard.

## Recommended Components

### 1. TimeRangeSelector
**Type:** Navigation
**Current Usage:** 7D/1M/Year filter (lines 108-114)
**Note:** Same as SalesDashboardHistory, FuelAnalyticsDashboard - shared component

---

### 2. KPICard
**Type:** UI/Display
**Current Usage:** Total Bricks, Active Teams, Best Single Day (lines 116-127)
**Note:** Same as SalesDashboardHistory, FuelAnalyticsDashboard - shared component

---

### 3. LeaderboardCard
**Type:** UI/Display
**Current Usage:** Team production rankings (lines 130-147)

**Current Code:**
```jsx
<div className="rounded-2xl bg-gray-800/70 border border-gray-700/50 p-4">
  <h3 className="text-white font-bold text-sm mb-4">Production Leaderboard</h3>
  <div className="space-y-3">
    {rankedTeams.map(([name, total], i) => (
      <div key={name}>
        <div className="flex justify-between mb-1">
          <span className="text-gray-300 text-xs">{MEDAL[i] || `#${i + 1}`} {name}</span>
          <span className="text-gray-400 text-xs font-semibold">{total.toLocaleString("en-IN")}</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all" style={{ width: `${(total / maxTeamVal) * 100}%` }} />
        </div>
      </div>
    ))}
  </div>
</div>
```

**Suggested Implementation:**
```jsx
function LeaderboardCard({ title, items, formatFn, medals = true }) {
  return (
    <div className="rounded-2xl bg-gray-800/70 border border-gray-700/50 p-4">
      <h3 className="text-white font-bold text-sm mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={item.name}>
            <div className="flex justify-between mb-1">
              <span className="text-gray-300 text-xs">{medals ? (MEDAL[i] || `#${i+1}`) : ''} {item.name}</span>
              <span className="text-gray-400 text-xs font-semibold">{formatFn ? formatFn(item.value) : item.value}</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${(item.value / item.max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### 4. TrendChart (SVG)
**Type:** UI/Visualization
**Current Usage:** Daily production trend (lines 151-186)
**Note:** Complex SVG - similar to RevenueChart in SalesDashboardHistory

---

### 5. ProductionEntryItem
**Type:** UI/List
**Current Usage:** Entry ledger display (lines 192-200)

**Current Code:**
```jsx
{[...productions].sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date)).map((log, i) => (
  <div key={i} className="rounded-2xl bg-gray-800/70 border border-gray-700/50 px-4 py-3 flex items-center justify-between">
    <div>
      <p className="text-white font-semibold text-sm">{log.team_name}</p>
      <p className="text-gray-500 text-xs">{log.entry_date} · Team #{log.team_number}</p>
    </div>
    <p className="text-emerald-400 font-bold text-base">{log.bricks_count.toLocaleString("en-IN")}</p>
  </div>
))}
```

---

### 6. TabSwitcher
**Type:** Navigation
**Current Usage:** "Insights & Stats" and "Entry Ledger" tabs (lines 94-99)

**Current Code:** Same pattern as other analytics dashboards

---

## Priority Recommendations

1. **High Priority:** TimeRangeSelector, KPICard - Already identified for shared use
2. **Medium Priority:** LeaderboardCard - Distinctive for this analytics type
3. **Low Priority:** ProductionEntryItem, TabSwitcher - Covered elsewhere

## Cross-File Patterns

- TimeRangeSelector: SalesDashboardHistory, FuelAnalyticsDashboard
- KPICard: SalesDashboardHistory, FuelAnalyticsDashboard
- Leaderboard with medals: Unique to this file
- Trend chart: Similar to SalesDashboardHistory RevenueChart
- Entry list: Same pattern as FuelAnalyticsDashboard UsageHistoryItem

## Analytics Dashboard Consolidation

All three analytics dashboards (Sales, Fuel, Production) share:
- TimeRangeSelector
- KPICard
- TabSwitcher
- List items with similar structure
- SVG trend charts

**Recommendation:** Create `analytics/` component folder with shared components:
- `AnalyticsDashboardLayout`
- `TimeRangeSelector`
- `KPICard`
- `TrendChart`
- `DataListItem`