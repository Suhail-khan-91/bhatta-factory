"use client";

/**
 * Reusable Section component - card-like container with header
 *
 * @param {ReactNode} icon - Icon component to display
 * @param {string} title - Section title text
 * @param {string} accent - Tailwind gradient classes (e.g., "from-sky-600/80 to-blue-700/80")
 * @param {ReactNode} children - Section content
 * @param {string} className - Additional wrapper classes
 */
export default function Section({
  icon: Icon,
  title,
  accent = "from-sky-600/80 to-blue-700/80",
  children,
  className = "",
}) {
  return (
    <div className={`rounded-2xl bg-gray-800/70 border border-gray-700/50 mb-4 ${className}`}>
      <div className={`flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r ${accent} border-b border-white/10 rounded-t-2xl`}>
        {Icon && <Icon size={16} className="text-white/80" />}
        <span className="text-white font-semibold text-sm tracking-wide uppercase">{title}</span>
      </div>
      <div className="px-4 py-4 space-y-4">
        {children}
      </div>
    </div>
  );
}

/**
 * Reusable Field component - label + input wrapper
 *
 * @param {string} label - Field label text
 * @param {string} hint - Optional hint text
 * @param {ReactNode} children - Input element
 * @param {string} className - Additional wrapper classes
 */
export function Field({ label, hint, children, className = "" }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-gray-400 text-xs font-medium uppercase tracking-wider">{label}</label>
      {children}
      {hint && <p className="text-gray-500 text-xs mt-0.5">{hint}</p>}
    </div>
  );
}