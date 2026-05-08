"use client";

/**
 * Reusable TimeRangeSelector component for analytics dashboards
 *
 * @param {string} value - Selected time range
 * @param {Function} onChange - Change handler
 * @param {Array} options - Array of time range options (default: ["7D", "1M", "Year"])
 * @param {string} activeBgColor - Background color for active state (default: "bg-blue-500")
 * @param {string} activeShadow - Shadow for active state (default: "shadow-blue-500/30")
 * @param {string} className - Additional wrapper classes
 */
export default function TimeRangeSelector({
  value,
  onChange,
  options = ["7D", "1M", "Year"],
  activeBgColor = "bg-blue-500",
  activeShadow = "shadow-blue-500/30",
  className = "",
}) {
  return (
    <div className={`flex gap-2 p-1 bg-gray-800/60 rounded-xl border border-gray-700 ${className}`}>
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`
            flex-1 py-2 rounded-lg text-xs font-bold transition-all
            ${value === option
              ? `${activeBgColor} text-white shadow-lg ${activeShadow}`
              : "text-gray-400 hover:text-white"
            }
          `}
        >
          {option}
        </button>
      ))}
    </div>
  );
}