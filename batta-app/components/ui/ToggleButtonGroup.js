"use client";

/**
 * Reusable ToggleButtonGroup component - mutually exclusive button options
 *
 * @param {Array} options - Array of {value, label}
 * @param {string} value - Selected value
 * @param {Function} onChange - Change handler
 * @param {string} activeBgColor - Active button background (default: "bg-blue-600")
 * @param {string} className - Additional wrapper classes
 */
export default function ToggleButtonGroup({
  options,
  value,
  onChange,
  activeBgColor = "bg-blue-600",
  className = "",
}) {
  return (
    <div className={`flex rounded-xl border border-gray-700 overflow-hidden ${className}`}>
      {options.map((option, index) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            flex-1 py-3 px-4 text-sm font-medium transition-all
            ${value === option.value
              ? `${activeBgColor} text-white`
              : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
            }
            ${index > 0 ? "border-l border-gray-700" : ""}
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}