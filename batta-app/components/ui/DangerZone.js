"use client";

import { AlertTriangle } from "lucide-react";

/**
 * Reusable DangerZone component - warning section for destructive actions
 *
 * @param {string} title - Section title (default: "Danger Zone")
 * @param {ReactNode} children - Action buttons/content
 * @param {string} className - Additional wrapper classes
 */
export default function DangerZone({
  title = "Danger Zone",
  children,
  className = "",
}) {
  return (
    <div className={`rounded-2xl bg-red-900/20 border border-red-800/50 ${className}`}>
      <div className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-red-600/80 to-red-800/80 border-b border-red-500/30 rounded-t-2xl">
        <AlertTriangle size={16} className="text-white/80" />
        <span className="text-white font-semibold text-sm tracking-wide uppercase">{title}</span>
      </div>
      <div className="px-4 py-4">
        {children}
      </div>
    </div>
  );
}