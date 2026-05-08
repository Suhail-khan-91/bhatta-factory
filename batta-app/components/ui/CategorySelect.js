"use client";

import Combobox from "@/components/ui/Combobox";

const DEFAULT_CATEGORIES = ["Jhokwa", "Driver", "Bharae wala", "Coal picker", "General", "Rabbis spreader"];

/**
 * Reusable CategorySelect component - dropdown for employee categories
 *
 * @param {string} value - Selected category
 * @param {Function} onChange - Change handler
 * @param {Array} options - Category options (default: common categories)
 * @param {string} placeholder - Placeholder text
 * @param {string} accentClass - Focus ring classes
 * @param {string} className - Additional wrapper classes
 */
export default function CategorySelect({
  value,
  onChange,
  options = DEFAULT_CATEGORIES,
  placeholder = "Select or type a category",
  accentClass = "focus:ring-blue-500/40 focus:border-blue-500",
  className = "",
}) {
  return (
    <div className={className}>
      <Combobox
        id="category"
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        accentClass={accentClass}
      />
    </div>
  );
}