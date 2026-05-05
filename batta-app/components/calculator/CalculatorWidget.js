"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Delete, Clock, Trash2 } from "lucide-react";
import { getCalculatorHistory, saveCalculation, clearCalculatorHistory } from "@/lib/api";

const BUTTONS = [
  { label: "C",   type: "action",   span: 1 },
  { label: "+/-", type: "action",   span: 1 },
  { label: "%",   type: "action",   span: 1 },
  { label: "÷",   type: "operator", span: 1 },

  { label: "7",   type: "number",   span: 1 },
  { label: "8",   type: "number",   span: 1 },
  { label: "9",   type: "number",   span: 1 },
  { label: "×",   type: "operator", span: 1 },

  { label: "4",   type: "number",   span: 1 },
  { label: "5",   type: "number",   span: 1 },
  { label: "6",   type: "number",   span: 1 },
  { label: "−",   type: "operator", span: 1 },

  { label: "1",   type: "number",   span: 1 },
  { label: "2",   type: "number",   span: 1 },
  { label: "3",   type: "number",   span: 1 },
  { label: "+",   type: "operator", span: 1 },

  { label: "⌫",   type: "action",   span: 1 },
  { label: "0",   type: "number",   span: 1 },
  { label: ".",   type: "number",   span: 1 },
  { label: "=",   type: "equals",   span: 1 },
];

const STORAGE_KEY = "batta_calc_history";

function formatNumber(val) {
  if (val === null || val === undefined || val === "") return "";
  const num = parseFloat(val);
  if (isNaN(num)) return val;
  // Format with commas for readability
  return num.toLocaleString("en-IN", { maximumFractionDigits: 10 });
}

function formatDisplay(val) {
  if (!val && val !== 0) return "0";
  const str = String(val);
  // Don't format while typing (ends with dot or has trailing zeros after dot)
  if (str.endsWith(".") || /\.\d*0$/.test(str)) return str;
  const num = parseFloat(str);
  if (isNaN(num)) return str;
  return num.toLocaleString("en-IN", { maximumFractionDigits: 10 });
}

export default function CalculatorWidget() {
  const [display, setDisplay]       = useState("0");
  const [expression, setExpression] = useState(""); // top small line
  const [operand1, setOperand1]     = useState(null);
  const [operator, setOperator]     = useState(null);
  const [waitNext, setWaitNext]     = useState(false); // next digit starts fresh
  const [history, setHistory]       = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const historyPanelRef = useRef(null);

  useEffect(() => {
    if (!showHistory) return;
    const handleClickOutside = (e) => {
      if (historyPanelRef.current && !historyPanelRef.current.contains(e.target)) {
        setShowHistory(false);
      }
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, [showHistory]);

  // Load history from API on mount
  useEffect(() => {
    getCalculatorHistory()
      .then((data) => {
        // Map from API response format to string equations used locally
        const historyStrings = data.map(h => `${h.expression} = ${h.result}`);
        setHistory(historyStrings);
      })
      .catch(console.error);
  }, []);

  const pushHistory = useCallback((expr, res) => {
    const eq = `${expr} = ${res}`;
    setHistory((prev) => [eq, ...prev].slice(0, 100));
    saveCalculation(expr, res).catch(console.error);
  }, []);

  const opSymbolToReal = useCallback((sym) => {
    if (sym === "÷") return "/";
    if (sym === "×") return "*";
    if (sym === "−") return "-";
    return sym;
  }, []);

  const compute = useCallback((a, op, b) => {
    const fa = parseFloat(a);
    const fb = parseFloat(b);
    if (isNaN(fa) || isNaN(fb)) return "Error";
    switch (op) {
      case "÷": return fb === 0 ? "Error" : fa / fb;
      case "×": return fa * fb;
      case "−": return fa - fb;
      case "+": return fa + fb;
      default:  return fb;
    }
  }, []);

  const handleButton = useCallback((label, type) => {
    if (type === "number") {
      if (label === "." && display.includes(".") && !waitNext) return;
      if (waitNext) {
        setDisplay(label === "." ? "0." : label);
        setWaitNext(false);
      } else {
        setDisplay((prev) => {
          if (prev === "0" && label !== ".") return label;
          if (prev.length >= 15) return prev;
          return prev + label;
        });
      }
      return;
    }

    if (type === "operator") {
      const currentVal = parseFloat(display);
      if (operator && !waitNext) {
        // Chain: compute previous first
        const result = compute(operand1, operator, display);
        setDisplay(String(result));
        setOperand1(result);
      } else {
        setOperand1(currentVal);
      }
      setOperator(label);
      setExpression(`${formatDisplay(operand1 ?? currentVal)} ${label}`);
      setWaitNext(true);
      return;
    }

    if (type === "equals") {
      if (operator === null) return;
      const a = operand1 ?? 0;
      const b = display;
      const result = compute(a, operator, b);
      const exprStr = `${formatDisplay(a)} ${operator} ${formatDisplay(b)}`;
      const resStr = formatDisplay(result);
      const eq = `${exprStr} = ${resStr}`;
      pushHistory(exprStr, resStr);
      setDisplay(String(result));
      setExpression(eq);
      setOperand1(null);
      setOperator(null);
      setWaitNext(true);
      return;
    }

    if (type === "action") {
      if (label === "C") {
        setDisplay("0");
        setExpression("");
        setOperand1(null);
        setOperator(null);
        setWaitNext(false);
        return;
      }
      if (label === "⌫") {
        if (waitNext) return;
        setDisplay((prev) => (prev.length <= 1 ? "0" : prev.slice(0, -1)));
        return;
      }
      if (label === "+/-") {
        setDisplay((prev) => {
          const n = parseFloat(prev);
          if (isNaN(n)) return prev;
          return String(-n);
        });
        return;
      }
      if (label === "%") {
        setDisplay((prev) => {
          const n = parseFloat(prev);
          if (isNaN(n)) return prev;
          return String(n / 100);
        });
        return;
      }
    }
  }, [display, operator, waitNext, operand1, compute, pushHistory]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input field elsewhere
      if (
        document.activeElement &&
        (document.activeElement.tagName === "INPUT" ||
         document.activeElement.tagName === "TEXTAREA" ||
         document.activeElement.isContentEditable)
      ) {
        return;
      }

      const key = e.key;
      if (/^[0-9]$/.test(key)) {
        handleButton(key, "number");
      } else if (key === ".") {
        handleButton(".", "number");
      } else if (key === "+") {
        handleButton("+", "operator");
      } else if (key === "-") {
        handleButton("−", "operator");
      } else if (key === "*") {
        handleButton("×", "operator");
      } else if (key === "/") {
        e.preventDefault();
        handleButton("÷", "operator");
      } else if (key === "Enter" || key === "=") {
        e.preventDefault();
        handleButton("=", "equals");
      } else if (key === "Backspace") {
        handleButton("⌫", "action");
      } else if (key === "Escape" || key.toLowerCase() === "c") {
        handleButton("C", "action");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleButton]);

  const clearHistory = () => {
    setHistory([]);
    clearCalculatorHistory().catch(console.error);
  };

  const handleHistoryClick = (eq) => {
    const parts = eq.split(" = ");
    if (parts.length === 2) {
      // Remove commas from the result so state stays clean
      const resultStr = parts[1].replace(/,/g, '');
      setDisplay(resultStr);
      if (operator) {
        setWaitNext(false);
      } else {
        setExpression("");
        setOperand1(null);
        setOperator(null);
        setWaitNext(true);
      }
    }
  };

  // Dynamic font size for large numbers
  const displayFontSize =
    display.length > 12 ? "text-3xl" :
    display.length > 8  ? "text-4xl" :
    "text-5xl";

  const btnBase =
    "flex items-center justify-center rounded-2xl font-semibold transition-all duration-100 active:scale-95 select-none cursor-pointer h-16 text-xl";

  const btnStyle = {
    number:   `${btnBase} bg-gray-700 text-white hover:bg-gray-600`,
    operator: `${btnBase} bg-blue-600 text-white hover:bg-blue-500`,
    action:   `${btnBase} bg-gray-600 text-white hover:bg-gray-500`,
    equals:   `${btnBase} bg-blue-500 text-white hover:bg-blue-400 shadow-lg shadow-blue-500/30`,
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white overflow-hidden relative">

      {/* ── Display Screen ── */}
      <div className="flex flex-col justify-end px-5 pt-6 pb-4 min-h-[140px]">
        {/* Expression / history echo */}
        <p className="text-right text-gray-400 text-sm min-h-[20px] truncate">
          {expression || "\u00a0"}
        </p>
        {/* Main number */}
        <p className={`text-right font-light tracking-tight leading-none mt-1 ${displayFontSize} transition-all duration-150`}>
          {formatDisplay(display)}
        </p>
      </div>

      {/* ── Action Bar ── */}
      <div className="flex justify-between px-5 pb-2">
        <button
          onPointerDown={(e) => {
            e.stopPropagation();
            setShowHistory((v) => !v);
          }}
          className="text-gray-400 hover:text-gray-200 transition-colors p-1 -ml-1"
        >
          <Clock size={20} />
        </button>
      </div>

      {/* ── Keypad & History Panel Wrapper ── */}
      <div className="flex-1 px-4 pb-4 relative">
        
        {/* Slide-in History Panel */}
        <div 
          ref={historyPanelRef}
          className={`absolute left-4 top-0 bottom-4 w-[calc(75%-0.375rem)] bg-gray-900 border border-gray-800 rounded-2xl z-20 flex flex-col shadow-2xl transition-transform duration-300 ease-out ${
            showHistory ? "translate-x-0" : "-translate-x-[120%]"
          }`}
        >
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {history.length === 0 ? (
              <p className="text-gray-500 text-sm">No history yet</p>
            ) : (
              history.map((eq, i) => {
                const parts = eq.split(" = ");
                const expr = parts[0];
                const res = parts[1] || "";
                return (
                  <div 
                    key={i}
                    onClick={() => handleHistoryClick(eq)}
                    className="cursor-pointer hover:bg-gray-800 p-2 rounded-xl active:bg-gray-700 transition-colors text-right"
                  >
                    <div className="text-gray-400 text-sm">{expr}</div>
                    <div className="text-green-400 text-2xl font-light">={res}</div>
                  </div>
                );
              })
            )}
          </div>
          {history.length > 0 && (
            <div className="p-3 border-t border-gray-800">
              <button
                onClick={clearHistory}
                className="w-full py-2.5 text-green-400 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                Clear history
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-3 h-full">
          {BUTTONS.map(({ label, type }) => (
            <button
              key={label}
              onPointerDown={() => handleButton(label, type)}
              className={btnStyle[type]}
            >
              {label === "÷" ? "÷" :
               label === "×" ? "×" :
               label === "−" ? "−" :
               label === "⌫" ? <Delete size={20} /> :
               label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
