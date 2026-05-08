"use client";

/**
 * Reusable SnapshotCard component - displays summary/overview
 *
 * @param {ReactNode} icon - Icon component
 * @param {string} title - Card title
 * @param {Array} items - Array of {label, value, color} objects
 * @param {string} accent - Accent gradient classes
 * @param {string} className - Additional wrapper classes
 */
export default function SnapshotCard({
  icon: Icon,
  title,
  items = [],
  accent = "from-gray-700/80 to-gray-600/80",
  className = "",
}) {
  return (
    <div className={`rounded-2xl bg-gray-800/70 border border-gray-700/50 ${className}`}>
      <div className={`flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r ${accent} border-b border-white/10 rounded-t-2xl`}>
        {Icon && <Icon size={16} className="text-white/80" />}
        <span className="text-white font-semibold text-sm tracking-wide uppercase">{title}</span>
      </div>
      <div className="px-4 py-4 space-y-2">
        {items.map((item, index) => (
          <div key={item.label || index} className="flex justify-between items-center">
            <p className="text-gray-500 text-sm">{item.label}</p>
            <p className={`font-medium ${item.color || "text-white"}`}>{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * SnapshotCardGrid - grid layout for multiple snapshot cards
 *
 * @param {Array} items - Array of {label, value, color}
 * @param {string} className - Additional wrapper classes
 */
export function SnapshotCardGrid({ items, className = "" }) {
  return (
    <div className={`px-4 py-4 grid grid-cols-2 gap-3 ${className}`}>
      {items.map((item, index) => (
        <div key={item.label || index} className="bg-gray-900/60 rounded-xl px-3 py-3">
          <p className="text-gray-400 text-xs mb-1">{item.label}</p>
          <p className={`font-bold text-base ${item.color || "text-white"}`}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}