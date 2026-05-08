"use client";

/**
 * Reusable PillTabBar component - horizontal pill-style tabs
 *
 * @param {Array} tabs - Array of {key, label}
 * @param {string} activeTab - Currently active tab key
 * @param {Function} onChange - Tab change handler
 * @param {string} activeBgColor - Active background color (default: "bg-blue-600")
 * @param {string} className - Additional wrapper classes
 */
export default function PillTabBar({
  tabs,
  activeTab,
  onChange,
  activeBgColor = "bg-blue-600",
  className = "",
}) {
  return (
    <div className={`flex p-1 bg-slate-800/50 rounded-xl border border-slate-700 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`
            flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all
            ${activeTab === tab.key
              ? `${activeBgColor} text-white shadow-lg ${activeBgColor.replace('bg-', 'shadow-')}/20`
              : "text-slate-400 hover:text-slate-200"
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}