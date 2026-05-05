"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function Combobox({ id, value, onChange, options, placeholder, accentClass = "focus:ring-orange-500/40 focus:border-orange-500" }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, []);

  const select = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  const inputBase =
    `w-full bg-slate-800 border rounded-xl pl-4 pr-10 py-3 text-white text-base
     focus:outline-none focus:ring-2 transition-all appearance-none
     border-slate-700 ${accentClass}`;

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        className={inputBase}
        autoComplete="off"
      />

      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          setIsOpen((prev) => !prev);
        }}
        className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        tabIndex={-1}
        aria-label="Toggle dropdown"
      >
        <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <ul className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl shadow-black/40">
          {options.map((option) => (
            <li key={option}>
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  select(option);
                }}
                className={`w-full text-left px-4 py-3 text-base transition-colors ${value === option ? "bg-blue-500/20 text-blue-300 font-medium" : "text-slate-200 hover:bg-slate-700 active:bg-slate-600"}`}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
