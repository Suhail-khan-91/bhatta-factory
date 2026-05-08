"use client";

import { ChevronDown, ChevronRight } from "lucide-react";

/**
 * Reusable ExpandableSection component - collapsible card
 *
 * @param {boolean} isExpanded - Whether section is expanded
 * @param {Function} onToggle - Toggle handler
 * @param {ReactNode} header - Header content (title, summary)
 * @param {ReactNode} children - Expanded content
 * @param {string} className - Additional wrapper classes
 * @param {string} headerClassName - Additional header classes
 */
export default function ExpandableSection({
  isExpanded,
  onToggle,
  header,
  children,
  className = "",
  headerClassName = "",
}) {
  return (
    <div className={`bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden ${className}`}>
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3 ${headerClassName}`}
      >
        {header}
        {isExpanded ? (
          <ChevronDown size={18} className="text-slate-400 flex-shrink-0" />
        ) : (
          <ChevronRight size={18} className="text-slate-400 flex-shrink-0" />
        )}
      </button>
      {isExpanded && (
        <div className="bg-slate-900 px-4 py-3 border-t border-slate-800">
          {children}
        </div>
      )}
    </div>
  );
}