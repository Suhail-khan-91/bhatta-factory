"use client";

import { PlusCircle, History } from "lucide-react";

/**
 * Reusable TabSwitcher component
 * Supports two variants: "border" (default) and "pill"
 *
 * @param {Array} tabs - Array of tab objects: [{ key: string, label: string, icon?: ReactNode }]
 * @param {string} activeTab - Currently active tab key
 * @param {Function} onChange - Callback when tab changes
 * @param {string} variant - "border" | "pill" (default: "border")
 * @param {string} accentColor - Color for active state (e.g., "blue-400", "orange-400", "purple-400")
 * @param {string} activeBgColor - Background color for pill variant (e.g., "bg-blue-600")
 * @param {string} className - Additional wrapper classes
 */
export default function TabSwitcher({
  tabs,
  activeTab,
  onChange,
  variant = "border",
  accentColor = "blue-400",
  activeBgColor = "bg-blue-600",
  className = ""
}) {
  const isBorder = variant === "border";

  // Common classes
  const baseClasses = "flex-1 py-3 text-sm font-semibold transition-all";

  // Border variant classes
  const borderActiveClasses = `text-${accentColor} border-${accentColor} bg-${accentColor}/10`;
  const borderInactiveClasses = "text-gray-500 border-transparent hover:bg-gray-800";

  // Pill variant classes
  const pillActiveClasses = `${activeBgColor} text-white shadow-lg ${activeBgColor.replace('bg-', 'shadow-')}/20`;
  const pillInactiveClasses = "text-slate-400 hover:text-slate-200";

  if (isBorder) {
    return (
      <div className={`flex ${className}`}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`${baseClasses} border-b-2 ${activeTab === tab.key ? borderActiveClasses : borderInactiveClasses}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    );
  }

  // Pill variant
  return (
    <div className={`flex p-1 bg-slate-800/50 rounded-xl border border-slate-700 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`${baseClasses} flex items-center justify-center gap-2 py-2.5 rounded-lg ${activeTab === tab.key ? pillActiveClasses : pillInactiveClasses}`}
        >
          {tab.icon && <tab.icon size={16} />}
          {tab.label}
        </button>
      ))}
    </div>
  );
}