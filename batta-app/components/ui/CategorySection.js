"use client";

/**
 * Reusable CategorySection component - section header for grouped content
 *
 * @param {ReactNode} icon - Optional icon component
 * @param {string} title - Section title text
 * @param {string} className - Additional wrapper classes
 */
export default function CategorySection({ icon: Icon, title, className = "" }) {
  return (
    <div className={`flex items-center gap-2 pb-2 ${className}`}>
      {Icon && <Icon size={14} className="text-gray-500" />}
      <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-widest">
        {title}
      </p>
    </div>
  );
}