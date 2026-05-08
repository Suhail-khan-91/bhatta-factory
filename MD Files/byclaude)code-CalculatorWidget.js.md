# CalculatorWidget.js Summary

## Purpose
A fully functional calculator widget component that supports basic arithmetic operations, displays calculation history, and integrates with a backend API for persistent history storage.

## Key Features
- **Basic arithmetic**: Addition, subtraction, multiplication, and division
- **Number formatting**: Indian numbering system (commas) with 10 decimal places
- **Chained calculations**: Supports immediate execution of previous operations
- **History management**: Stores up to 100 calculations with retrieve/clear functionality
- **Responsive display**: Dynamic font sizing based on value length
- **Touch-friendly UI**: Uses pointer events for responsive touch interactions

## State Management
| Variable | Type | Purpose |
|----------|------|---------|
| `display` | string | Current input/operand being typed |
| `expression` | string | Top bar showing current operation (e.g., "123 +") |
| `operand1` | number | First operand for pending operation |
| `operator` | string | Current active operator (÷, ×, −, +) |
| `waitNext` | boolean | Flag indicating next digit starts fresh |
| `history` | array | Local cached history (synchronized with API) |
| `showHistory` | boolean | Controls visibility of history panel |

## API Integration
- **`getCalculatorHistory()`**: Fetches history from backend on mount, maps API response to string format
- **`saveCalculation(expr, res)`**: Saves each calculation to backend when completed
- **`clearCalculatorHistory()`**: Clears local and backend history when panel is cleared
- Storage key: `"batta_calc_history"`

## User Interactions (Keyboard Shortcuts)
| Key | Action |
|-----|--------|
| `0-9` | Input digit |
| `.` | Decimal point (validated against existing decimal) |
| `+` | Addition |
| `-` | Subtraction |
| `*` | Multiplication |
| `/` | Division |
| `Enter` / `=` | Calculate |
| `Backspace` | Delete last digit |
| `Escape` / `c` | Clear all |

## UI Structure
```
┌─────────────────────────────────────┐
│  ┌─────────────────────────────┐    │
│  │   Expression: "123 + "      │    │  ← Top bar
│  │                             │    │
│  │   45,678.123               │    │  ← Main display
│  └─────────────────────────────┘    │
│                                     │
│  [Clock]  C  +/−  %  ÷  7  8  9  ×  │
│  ⌫  0  .  =  4  5  6  −  1  2  3  + │
│  (History panel slides from left)   │
│                                     │
│  Grid: 4 columns, 16px spacing      │
└─────────────────────────────────────┘
```

- **Display area**: Two-line screen with dynamic font sizing (text-3xl to text-5xl)
- **Action bar**: Top-right clock icon toggles history panel
- **Keypad**: 4×5 grid with button types: number, operator, action, equals
- **History panel**: Slide-in panel (75% of remaining width) showing last 100 calculations

## Notable Design Decisions

1. **Indian Numbering System**: Uses `toLocaleString("en-IN")` for proper comma placement (e.g., 1,23,45,678)

2. **Chained Operations**: When a new operator is pressed, the previous operation executes immediately before setting up the new one

3. **Wait Next Flag**: Prevents multiple decimals and resets state after equals to allow fresh input

4. **Display Limits**: Prevents display values exceeding 15 characters to avoid overflow

5. **Pointer Events**: Uses `onPointerDown` instead of `onClick` for better touch responsiveness (prevents 300ms delay)

6. **Click-outside History**: History panel closes when clicking outside the panel area

7. **Error Handling**: Division by zero and invalid inputs return "Error" string

8. **History Format**: Stores as `"expression = result"` strings for easy parsing and display

9. **Dynamic Font Sizing**: Font size adjusts based on display length (12+ chars: text-3xl, 8+ chars: text-4xl, else text-5xl)

10. **Button Styling**: Different styles for each button type with hover states and active scale effect