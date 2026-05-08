"use client";

/**
 * Reusable SubmitButton component
 *
 * @param {boolean} isLoading - Loading state
 * @param {string} label - Button label (default: "Save")
 * @param {ReactNode} icon - Optional icon
 * @param {string} color - Color variant (default: "blue-600")
 * @param {string} hoverColor - Hover color (default: "blue-500")
 * @param {string} accentClass - Additional accent classes
 * @param {string} className - Additional wrapper classes
 * @param {boolean} disabled - Disabled state
 */
export default function SubmitButton({
  isLoading = false,
  label = "Save",
  icon: Icon,
  color = "bg-blue-600",
  hoverColor = "bg-blue-500",
  accentClass = "shadow-blue-600/30",
  className = "",
  disabled = false,
}) {
  return (
    <button
      type="submit"
      disabled={disabled || isLoading}
      className={`
        w-full py-4 rounded-2xl disabled:opacity-50
        ${color} hover:${hoverColor} active:scale-95
        text-white font-semibold text-lg
        transition-all shadow-lg ${accentClass}
        flex items-center justify-center gap-2
        ${className}
      `}
    >
      {isLoading ? (
        "Saving..."
      ) : (
        <>
          {Icon && <Icon size={20} />}
          {label}
        </>
      )}
    </button>
  );
}