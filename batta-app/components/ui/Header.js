"use client";

import { ArrowLeft } from "lucide-react";

/**
 * Reusable Header component - page header with back button
 *
 * @param {Function} onBack - Back button handler
 * @param {string} title - Page title
 * @param {string} subtitle - Optional subtitle
 * @param {ReactNode} icon - Optional icon component
 * @param {string} iconClass - Icon color class (default: "text-emerald-400")
 * @param {ReactNode} rightContent - Optional right side content
 * @param {string} className - Additional wrapper classes
 */
export default function Header({
  onBack,
  title,
  subtitle,
  icon: Icon,
  iconClass = "text-emerald-400",
  rightContent,
  className = "",
}) {
  return (
    <div className={`flex items-center gap-3 px-4 pt-5 pb-4 border-b border-gray-800 flex-shrink-0 ${className}`}>
      <button
        onClick={onBack}
        className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 active:scale-95 transition-all"
        aria-label="Go back"
      >
        <ArrowLeft size={20} />
      </button>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={18} className={iconClass} />}
          <h1 className="text-lg font-semibold leading-tight">{title}</h1>
        </div>
        {subtitle && <p className="text-gray-400 text-xs mt-0.5">{subtitle}</p>}
      </div>
      {rightContent && <div>{rightContent}</div>}
    </div>
  );
}