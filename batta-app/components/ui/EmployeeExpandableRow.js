"use client";

import { ChevronDown, ChevronRight, User } from "lucide-react";

/**
 * Reusable EmployeeExpandableRow component - expandable employee row
 *
 * @param {boolean} isExpanded - Expanded state
 * @param {Function} onToggle - Toggle handler
 * @param {Object} employee - Employee data
 * @param {ReactNode} summary - Summary content (right side)
 * @param {ReactNode} children - Expanded content
 * @param {string} className - Additional wrapper classes
 */
export default function EmployeeExpandableRow({
  isExpanded,
  onToggle,
  employee,
  summary,
  children,
  className = "",
}) {
  return (
    <div className={`bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden ${className}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
            <User size={16} className="text-slate-400" />
          </div>
          <div className="text-left">
            <p className="text-white font-medium text-sm">{employee.full_name}</p>
            <p className="text-slate-500 text-xs">{employee.employee_category}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {summary}
          {isExpanded ? (
            <ChevronDown size={18} className="text-slate-400" />
          ) : (
            <ChevronRight size={18} className="text-slate-400" />
          )}
        </div>
      </button>
      {isExpanded && (
        <div className="bg-slate-900 px-4 py-3 border-t border-slate-800">
          {children}
        </div>
      )}
    </div>
  );
}