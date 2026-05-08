# Component Analysis: Combobox.js

## Summary
This IS the reusable combobox component. It already exists and is used throughout the application, though often duplicated inline in other files.

## Analysis

### Current State
This is the canonical reusable component at `/batta-app/components/ui/Combobox.js`.

**Props:**
- `id: string` - Input element ID
- `value: string` - Current value
- `onChange: (value: string) => void` - Change callback
- `options: string[]` - Available options
- `placeholder: string` - Placeholder text
- `accentClass?: string` - Custom focus ring styling (default: "focus:ring-orange-500/40 focus:border-orange-500")

### Implementation Features
- Click outside to close dropdown
- Touch support
- Keyboard accessible
- Smooth chevron rotation animation
- Dropdown with hover states
- Selected item highlighting

## Usage Issues Found

### Duplicate Instances
This component is duplicated inline in multiple files:
1. `EmployeeOnboarding.js` (lines 14-80) - 66 lines
2. `FuelInputForm.js` (lines 12-102) - 90 lines
3. `FuelOutputForm.js` (lines 12-104) - 92 lines
4. `BricksCountManager.js` - None (uses imported Combobox for location tags)

### Recommendations

#### 1. Remove Duplicates
The following files should import this component instead of defining locally:
- `EmployeeOnboarding.js` - Replace local Combobox with import
- `FuelInputForm.js` - Replace local Combobox with import
- `FuelOutputForm.js` - Replace local Combobox with import

#### 2. Enhance Props
Consider adding:
- `disabled?: boolean` - Disabled state
- `error?: string` - Error state styling
- `className?: string` - Additional wrapper classes

#### 3. Color Theme Support
The component supports accentClass but could have built-in theme presets:

```jsx
const THEMES = {
  purple: "focus:ring-purple-500/40 focus:border-purple-500",
  blue: "focus:ring-blue-500/40 focus:border-blue-500", 
  orange: "focus:ring-orange-500/40 focus:border-orange-500",
  emerald: "focus:ring-emerald-500/40 focus:border-emerald-500",
  pink: "focus:ring-pink-500/40 focus:border-pink-500",
};
```

#### 4. Multi-select Support
Consider adding a variant for multi-select use cases in the future.

## Files Using This Component (via import)

1. `ExtraWorkManager.js` - Work description dropdown
2. `OrderBricksForm.js` - Lead Source, Salesperson, Brick Category, Payment Status
3. `DispatchManager.js` - Cancel reason dropdown
4. `BricksCountManager.js` - Location tags

## Priority Recommendations

1. **High Priority:** Remove duplicates in EmployeeOnboarding, FuelInputForm, FuelOutputForm
2. **Medium Priority:** Add disabled prop support
3. **Low Priority:** Add theme presets

## Migration Example

**Before (FuelInputForm.js):**
```jsx
// Local 90-line Combobox definition
function Combobox({ id, value, onChange, options, placeholder }) { ... }
```

**After:**
```jsx
import Combobox from "@/components/ui/Combobox";

// Use directly
<Combobox id="station_name" value={form.station_name} onChange={setStationName} options={stations} placeholder="Select station" />
```