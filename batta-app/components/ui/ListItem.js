"use client";

/**
 * Reusable ListItem component - displays history/payment items
 *
 * @param {ReactNode} leftContent - Left side content (icon, badge, etc.)
 * @param {ReactNode} mainContent - Main content (title, subtitle)
 * @param {ReactNode} rightContent - Right side content (value, action button)
 * @param {Function} onDelete - Optional delete handler
 * @param {string} accentColor - Color for left badge (default: "blue-400")
 * @param {string} className - Additional wrapper classes
 */
export default function ListItem({
  leftContent,
  mainContent,
  rightContent,
  onDelete,
  accentColor = "blue-400",
  className = "",
}) {
  return (
    <div className={`flex items-center justify-between bg-gray-800/80 border border-gray-700 rounded-xl p-4 shadow-sm ${className}`}>
      <div className="flex items-center gap-3">
        {leftContent && (
          <div className={`text-${accentColor} font-bold text-base`}>
            {leftContent}
          </div>
        )}
        <div className="text-left">
          {mainContent}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {rightContent}
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}