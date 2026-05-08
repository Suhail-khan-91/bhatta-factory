"use client";

/**
 * Reusable ProgressBar component
 *
 * @param {number} value - Current value
 * @param {number} max - Maximum value
 * @param {string} color - Fill color class (default: "bg-blue-500")
 * @param {string} bgColor - Background color class (default: "bg-gray-700")
 * @param {string} height - Height class (default: "h-2")
 * @param {boolean} showLabel - Show percentage label
 * @param {string} className - Additional wrapper classes
 */
export default function ProgressBar({
  value,
  max = 100,
  color = "bg-blue-500",
  bgColor = "bg-gray-700",
  height = "h-2",
  showLabel = false,
  className = "",
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={className}>
      <div className={`w-full ${bgColor} rounded-full ${height} overflow-hidden`}>
        <div
          className={`${color} h-full rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-gray-400 text-xs mt-1 text-right">{Math.round(percentage)}%</p>
      )}
    </div>
  );
}