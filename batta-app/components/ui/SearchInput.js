"use client";

import { Search } from "lucide-react";

/**
 * Reusable SearchInput component
 *
 * @param {string} value - Current search value
 * @param {Function} onChange - Change handler (value)
 * @param {string} placeholder - Placeholder text
 * @param {string} accentClass - Tailwind classes for focus ring
 * @param {string} className - Additional wrapper classes
 * @param {boolean} showIcon - Whether to show search icon (default: true)
 * @param {boolean} variant - "default" (bordered) | "minimal" (transparent with icon)
 */
export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  accentClass = "focus:ring-emerald-500/40 focus:border-emerald-500",
  className = "",
  showIcon = true,
  variant = "default",
}) {
  const isMinimal = variant === "minimal";

  const inputClasses = isMinimal
    ? `flex-1 bg-transparent text-white text-sm placeholder-gray-600 focus:outline-none`
    : `
        w-full bg-gray-800 border border-gray-700 rounded-xl
        px-4 py-2.5 text-white text-sm placeholder-gray-500
        focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500
        transition-all
        ${accentClass}
      `;

  if (isMinimal) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showIcon && <Search size={18} className="text-gray-500 flex-shrink-0" />}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputClasses}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClasses}
      />
    </div>
  );
}