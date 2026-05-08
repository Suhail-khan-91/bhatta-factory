"use client";

/**
 * Reusable FormInput component
 *
 * @param {string} id - Input ID
 * @param {string} label - Label text
 * @param {string} type - Input type (text, number, date, time, etc.)
 * @param {string} value - Current value
 * @param {Function} onChange - Change handler
 * @param {string} placeholder - Placeholder text
 * @param {string} error - Error message to display
 * @param {string} accentClass - Tailwind classes for focus ring (e.g., "focus:ring-orange-500/40 focus:border-orange-500")
 * @param {string} inputMode - Input mode for mobile (numeric, decimal, etc.)
 * @param {string} className - Additional wrapper classes
 * @param {boolean} required - Whether field is required (shows red asterisk)
 * @param {string} helperText - Optional helper text below input
 */
export default function FormInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  accentClass = "focus:ring-blue-500/40 focus:border-blue-500",
  inputMode,
  className = "",
  required = false,
  helperText,
}) {
  const inputClasses = `
    w-full bg-gray-800 border rounded-xl px-4 py-3 text-white text-base
    placeholder-gray-500 focus:outline-none focus:ring-2 transition-all appearance-none
    ${error
      ? "border-red-500 focus:ring-red-500/40"
      : "border-gray-700 " + accentClass}
    ${type === "date" || type === "time" ? "[color-scheme:dark]" : ""}
  `;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-gray-400 text-xs font-medium uppercase tracking-wider mb-1.5">
          {label}
          {required && <span className="text-red-400"> *</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={inputClasses}
      />
      {error && (
        <p className="text-red-400 text-xs mt-1">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-gray-600 text-xs mt-1">{helperText}</p>
      )}
    </div>
  );
}