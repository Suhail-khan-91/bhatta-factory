"use client";

import Combobox from "@/components/ui/Combobox";

/**
 * Reusable EmployeeSelect component - dropdown for selecting employees
 *
 * @param {string} value - Selected employee ID or name
 * @param {Function} onChange - Change handler
 * @param {Array} employees - Array of employee objects {id, full_name} or just names
 * @param {string} placeholder - Placeholder text
 * @param {string} accentClass - Focus ring classes
 * @param {string} className - Additional wrapper classes
 * @param {boolean} useId - Whether to return employee ID instead of name (default: false)
 */
export default function EmployeeSelect({
  value,
  onChange,
  employees = [],
  placeholder = "Select or type an employee",
  accentClass = "focus:ring-blue-500/40 focus:border-blue-500",
  className = "",
  useId = false,
}) {
  // Convert employee objects to options array
  const options = employees.map((emp) =>
    typeof emp === "string" ? emp : emp.full_name || emp.name || String(emp)
  );

  const handleChange = (selected) => {
    if (!useId) {
      onChange(selected);
      return;
    }
    // Find employee by name and return ID
    const emp = employees.find(
      (e) => (e.full_name || e.name) === selected
    );
    onChange(emp?.id || selected);
  };

  return (
    <div className={className}>
      <Combobox
        id="employee"
        value={value}
        onChange={handleChange}
        options={options}
        placeholder={placeholder}
        accentClass={accentClass}
      />
    </div>
  );
}