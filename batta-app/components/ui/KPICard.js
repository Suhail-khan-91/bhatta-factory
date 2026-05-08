"use client";

/**
 * Reusable KPICard component for analytics dashboards
 *
 * @param {string} label - Label text (e.g., "Total Revenue")
 * @param {string} value - Value to display
 * @param {ReactNode} icon - Icon component
 * @param {string} accent - Gradient classes (e.g., "from-emerald-500 to-teal-600")
 * @param {string} glow - Shadow glow class (e.g., "shadow-emerald-500/20")
 * @param {string} valueColor - Value text color class (e.g., "text-emerald-400")
 * @param {string} className - Additional wrapper classes
 */
export default function KPICard({
  label,
  value,
  icon: Icon,
  accent = "from-blue-500 to-blue-600",
  glow = "shadow-blue-500/20",
  valueColor = "text-white",
  className = "",
}) {
  return (
    <div className={`flex items-center gap-4 p-4 bg-gray-800/70 border border-gray-700/50 rounded-2xl ${className}`}>
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${accent} flex items-center justify-center shadow-lg ${glow}`}>
        {Icon && <Icon size={22} className="text-white" />}
      </div>
      <div>
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{label}</p>
        <p className={`text-xl font-bold ${valueColor}`}>{value}</p>
      </div>
    </div>
  );
}

/**
 * Reusable KPIGrid component - wrapper for multiple KPICards
 *
 * @param {ReactNode} children - KPICard components
 * @param {string} cols - Grid columns (default: "grid-cols-3")
 * @param {string} gap - Gap between items (default: "gap-3")
 * @param {string} className - Additional wrapper classes
 */
export function KPIGrid({ children, cols = "grid-cols-3", gap = "gap-3", className = "" }) {
  return (
    <div className={`grid ${cols} ${gap} ${className}`}>
      {children}
    </div>
  );
}