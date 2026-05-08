"use client";

import { IndianRupee } from "lucide-react";

/**
 * Reusable EmployeeSummaryCard component - displays selected employee info
 *
 * @param {Object} employee - Employee object with pay_frequency and base_salary
 * @param {string} label1 - Label for left field (default: "Pay Type")
 * @param {string} label2 - Label for right field (default: "Fixed Salary")
 * @param {string} valueColor - Color class for value (default: "text-green-400")
 * @param {string} className - Additional wrapper classes
 */
export default function EmployeeSummaryCard({
  employee,
  label1 = "Pay Type",
  label2 = "Fixed Salary",
  valueColor = "text-green-400",
  className = "",
}) {
  if (!employee) return null;

  return (
    <div className={`bg-slate-800/80 border border-slate-700 rounded-xl p-4 flex justify-between items-center shadow-inner ${className}`}>
      <div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">{label1}</p>
        <p className="font-medium text-slate-200">{employee.pay_frequency} Paid</p>
      </div>
      <div className="text-right">
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">{label2}</p>
        <p className={`text-xl font-bold ${valueColor} flex items-center gap-1 justify-end`}>
          <IndianRupee size={18} />
          {Number(employee.base_salary).toLocaleString('en-IN')}
        </p>
      </div>
    </div>
  );
}