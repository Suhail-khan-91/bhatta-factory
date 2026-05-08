"use client";

import { FileText } from "lucide-react";

/**
 * Reusable LedgerSummaryCard component - displays ledger/salary summary
 *
 * @param {string} title - Card title
 * @param {Array} rows - Array of {label, value, color} objects
 * @param {ReactNode} icon - Icon component (default: FileText)
 * @param {string} accent - Accent gradient classes
 * @param {string} className - Additional wrapper classes
 */
export default function LedgerSummaryCard({
  title,
  rows = [],
  icon: Icon = FileText,
  accent = "from-amber-600/80 to-orange-700/80",
  className = "",
}) {
  return (
    <div className={`rounded-2xl bg-gray-800/70 border border-gray-700/50 ${className}`}>
      <div className={`flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r ${accent} border-b border-white/10 rounded-t-2xl`}>
        <Icon size={16} className="text-white/80" />
        <span className="text-white font-semibold text-sm tracking-wide uppercase">{title}</span>
      </div>
      <div className="px-4 py-4 space-y-3">
        {rows.map((row, index) => (
          <div key={row.label || index} className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">{row.label}</span>
            <span className={`font-medium ${row.color || "text-white"}`}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}