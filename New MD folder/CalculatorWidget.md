# Component Analysis: CalculatorWidget.js

## Summary
Calculator with standard operations, history panel, and keyboard support. Self-contained widget.

## Recommended Components

### 1. CalculatorDisplay
**Type:** UI/Display
**Current Usage:** Shows current value and expression (lines 274-284)
**Suggested Props:** `display`, `expression`, `fontSizeClass`

**Current Code:**
```jsx
<div className="flex flex-col justify-end px-5 pt-6 pb-4 min-h-[140px]">
  <p className="text-right text-gray-400 text-sm min-h-[20px] truncate">
    {expression || " "}
  </p>
  <p className={`text-right font-light tracking-tight leading-none mt-1 ${displayFontSize} transition-all duration-150`}>
    {formatDisplay(display)}
  </p>
</div>
```

**Suggested Implementation:**
```jsx
function CalculatorDisplay({ expression, value, fontSizeClass }) {
  return (
    <div className="flex flex-col justify-end px-5 pt-6 pb-4 min-h-[140px]">
      <p className="text-right text-gray-400 text-sm min-h-[20px] truncate">{expression || " "}</p>
      <p className={`text-right font-light tracking-tight leading-none mt-1 ${fontSizeClass} transition-all duration-150`}>{value}</p>
    </div>
  );
}
```

---

### 2. CalculatorButton
**Type:** UI
**Current Usage:** Number, operator, and action buttons (lines 342-356)
**Suggested Props:** `label`, `type`, `onClick`, `icon`

**Current Code:**
```jsx
<button onPointerDown={() => handleButton(label, type)} className={btnStyle[type]}>
  {label === "÷" ? "÷" : label === "×" ? "×" : label === "−" ? "−" : label === "⌫" ? <Delete size={20} /> : label}
</button>
```

**Suggested Implementation:**
```jsx
function CalculatorButton({ label, type, onClick, icon: Icon }) {
  const btnBase = "flex items-center justify-center rounded-2xl font-semibold transition-all duration-100 active:scale-95 select-none cursor-pointer h-16 text-xl";
  const btnStyle = {
    number: `${btnBase} bg-gray-700 text-white hover:bg-gray-600`,
    operator: `${btnBase} bg-blue-600 text-white hover:bg-blue-500`,
    action: `${btnBase} bg-gray-600 text-white hover:bg-gray-500`,
    equals: `${btnBase} bg-blue-500 text-white hover:bg-blue-400 shadow-lg shadow-blue-500/30`,
  };
  
  return (
    <button onPointerDown={onClick} className={btnStyle[type]}>
      {Icon ? <Icon size={20} : label}
    </button>
  );
}
```

---

### 3. CalculatorKeypad
**Type:** UI
**Current Usage:** Grid of calculator buttons (lines 342-356)
**Note:** Could wrap buttons in a grid component

---

### 4. HistoryPanel
**Type:** UI/List
**Current Usage:** Slide-in calculation history (lines 302-340)

**Current Code:**
```jsx
<div className={`absolute left-4 top-0 bottom-4 w-[calc(75%-0.375rem)] bg-gray-900 border border-gray-800 rounded-2xl z-20 flex flex-col shadow-2xl transition-transform duration-300 ease-out ${showHistory ? "translate-x-0" : "-translate-x-[120%]"}`}>
  <div className="flex-1 overflow-y-auto p-4 space-y-4">
    {history.map((eq, i) => (
      <div key={i} onClick={() => handleHistoryClick(eq)} className="cursor-pointer hover:bg-gray-800 p-2 rounded-xl active:bg-gray-700 transition-colors text-right">
        <div className="text-gray-400 text-sm">{expr}</div>
        <div className="text-green-400 text-2xl font-light">={res}</div>
      </div>
    ))}
  </div>
  {history.length > 0 && (
    <div className="p-3 border-t border-gray-800">
      <button onClick={clearHistory} className="w-full py-2.5 text-green-400 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors text-sm font-medium">
        Clear history
      </button>
    </div>
  )}
</div>
```

**Suggested Implementation:**
```jsx
function HistoryPanel({ history, isVisible, onItemClick, onClear }) {
  return (
    <div className={`absolute left-4 top-0 bottom-4 w-[calc(75%-0.375rem)] bg-gray-900 border border-gray-800 rounded-2xl z-20 flex flex-col shadow-2xl transition-transform ${isVisible ? "translate-x-0" : "-translate-x-[120%]"}`}>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {history.length === 0 ? <p className="text-gray-500 text-sm">No history</p> : history.map((eq, i) => (
          <div key={i} onClick={() => onItemClick(eq)} className="cursor-pointer hover:bg-gray-800 p-2 rounded-xl text-right">
            <div className="text-gray-400 text-sm">{eq.expression}</div>
            <div className="text-green-400 text-2xl font-light">={eq.result}</div>
          </div>
        ))}
      </div>
      {history.length > 0 && <div className="p-3 border-t border-gray-800"><button onClick={onClear} className="w-full py-2.5 text-green-400 bg-gray-800 rounded-xl hover:bg-gray-700 text-sm">Clear</button></div>}
    </div>
  );
}
```

---

### 5. ActionButton (History toggle)
**Type:** UI
**Current Usage:** Toggle history panel (lines 287-296)

**Current Code:**
```jsx
<button onPointerDown={(e) => { e.stopPropagation(); setShowHistory((v) => !v); }} className="text-gray-400 hover:text-gray-200 transition-colors p-1 -ml-1">
  <Clock size={20} />
</button>
```

---

## Priority Recommendations

1. **Low Priority:** This is a self-contained widget - extraction would be refactoring, not component creation
2. **Nice to have:** CalculatorDisplay, HistoryPanel could be extracted for testability

## Architecture Note

This component is well-structured with clear internal responsibilities. The main value would be in extracting pieces for testing, not for reuse elsewhere (calculator is unique in the app).