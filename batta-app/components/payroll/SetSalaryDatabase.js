"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ChevronDown, ChevronRight, IndianRupee, User, Briefcase, CalendarClock, History, Save, Edit3 } from "lucide-react";
import { getEmployees, updateEmployee } from "@/lib/api";

const CATEGORIES = ["Jhokwa", "Driver", "Bharae wala", "Coal picker", "General"];

export default function SetSalaryDatabase({ onBack }) {
  const [modal, setModal] = useState({show: false, message: '', isError: false});
  const [employees, setEmployees] = useState([]);
  const [histories, setHistories] = useState({});
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [expandedEmployees, setExpandedEmployees] = useState({});
  const [editingEmployee, setEditingEmployee] = useState(null);
  
  const [payType, setPayType] = useState("Weekly");
  const [salaryAmount, setSalaryAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      const emps = await getEmployees();
      setEmployees(emps);
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const histMap = {};
      
      const res = await fetch(`${API_URL}/api/v1/payroll/salary-history`);
      if (res.ok) {
        const allHistories = await res.json();
        for (const h of allHistories) {
          if (!histMap[h.employee_id]) histMap[h.employee_id] = [];
          histMap[h.employee_id].push(h);
        }
      }
      setHistories(histMap);
    } catch (err) {
      alert("Failed to load data: " + err.message);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (editingEmployee) {
      setPayType(editingEmployee.pay_frequency);
      setSalaryAmount(editingEmployee.base_salary.toString());
    }
  }, [editingEmployee]);

  const toggleEmployee = (empId) => {
    setExpandedEmployees((prev) => ({ ...prev, [empId]: !prev[empId] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      await updateEmployee(editingEmployee.id, {
        base_salary: Number(salaryAmount),
        pay_frequency: payType
      });

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      await fetch(`${API_URL}/api/v1/payroll/salary-history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: editingEmployee.id,
          old_salary: Number(editingEmployee.base_salary),
          new_salary: Number(salaryAmount),
          old_pay_type: editingEmployee.pay_frequency,
          new_pay_type: payType,
          change_date: new Date().toISOString().split("T")[0]
        })
      });

      alert("Salary profile updated successfully!");
      fetchData();
      setEditingEmployee(null);
    } catch (err) {
      alert("Failed to update: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (editingEmployee) {
    const empHistory = histories[editingEmployee.id] || [];

    return (
      <div className="min-h-full bg-slate-900 text-white flex flex-col pt-4">
        {modal.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-white rounded-2xl shadow-2xl p-6 mx-6 max-w-sm w-full text-center">
              <p className={`text-lg font-bold mb-4 ${modal.isError ? 'text-red-500' : 'text-green-600'}`}>
                {modal.isError ? '❌ Error' : '✅ Success'}
              </p>
              <p className="text-gray-700 text-sm mb-6">{modal.message}</p>
              <button
                onClick={() => setModal({show: false, message: '', isError: false})}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-8 rounded-xl"
              >
                OK
              </button>
            </div>
          </div>
        )}
        <div className="flex items-center px-4 mb-6">
          <button onClick={() => setEditingEmployee(null)} className="p-2 -ml-2 hover:bg-slate-800 rounded-full text-slate-300">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold ml-2">Edit Salary</h1>
        </div>

        <div className="flex-1 px-4 overflow-y-auto pb-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 shadow-inner flex justify-between">
              <div className="space-y-1">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"><User size={14}/> Employee</p>
                <p className="font-medium text-slate-200">{editingEmployee.full_name}</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center justify-end gap-1.5"><Briefcase size={14}/> Category</p>
                <p className="font-medium text-slate-200">{editingEmployee.employee_category}</p>
              </div>
            </div>

            <div className="space-y-1.5 mt-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <CalendarClock size={16} className="text-purple-400" />
                Pay Frequency
              </label>
              <div className="relative">
                <select
                  value={payType}
                  onChange={(e) => setPayType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <IndianRupee size={16} className="text-purple-400" />
                Base Salary (₹)
              </label>
              <input
                type="number"
                value={salaryAmount}
                onChange={(e) => setSalaryAmount(e.target.value)}
                placeholder="Current: ₹"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                required
              />
            </div>

            <div className="mt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                <Save size={20} />
                {isLoading ? "Saving..." : "Update Salary Profile"}
              </button>
            </div>
          </form>

          <div className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
              <History size={16} /> Salary History
            </h2>
            
            {empHistory.length === 0 ? (
              <p className="text-slate-500 text-sm italic">No past salary changes recorded.</p>
            ) : (
              <div className="space-y-4">
                {[...empHistory].sort((a,b) => new Date(b.change_date) - new Date(a.change_date)).map((hist) => (
                  <div key={hist.id} className="relative pl-6 border-l-2 border-slate-700/50 pt-1 pb-1">
                    <span className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-slate-600 ring-4 ring-slate-900 border-none"></span>
                    <p className="text-xs text-slate-400 font-medium mb-1">{new Date(hist.change_date).toLocaleDateString()}</p>
                    <p className="text-sm text-slate-200">
                      <span className="line-through opacity-60 mr-2">₹{Number(hist.old_salary)}</span>
                      <span className="font-bold text-emerald-400">₹{Number(hist.new_salary)}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-900 text-white flex flex-col pt-4">
      <div className="flex items-center px-4 mb-6">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-800 rounded-full text-slate-300">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold ml-2">Salary Database</h1>
      </div>

      <div className="flex-1 px-4 overflow-y-auto pb-6 space-y-4">
        {isLoadingData ? <p className="text-center text-slate-500">Loading...</p> : CATEGORIES.map((category) => {
          const catEmployees = employees.filter(emp => emp.employee_category === category);
          if (catEmployees.length === 0) return null;

          return (
            <div key={category} className="bg-slate-800 rounded-xl p-4 shadow-md border border-slate-700">
              <h2 className="text-lg font-bold text-slate-200 mb-3 border-b border-slate-700 pb-2">
                {category}
              </h2>

              <div className="space-y-3">
                {catEmployees.map((emp) => {
                  const isExpanded = !!expandedEmployees[emp.id];

                  return (
                    <div key={emp.id} className="bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden">
                      <button
                        onClick={() => toggleEmployee(emp.id)}
                        className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-800/80 transition-colors bg-gradient-to-r hover:from-slate-800/80 hover:to-slate-800/40"
                      >
                        <span className="font-semibold text-slate-200">{emp.full_name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-purple-400 font-bold flex items-center">
                            <IndianRupee size={14} className="mr-0.5 text-purple-400/80" />
                            {Number(emp.base_salary).toLocaleString("en-IN")}
                          </span>
                          {isExpanded ? (
                            <ChevronDown size={18} className="text-slate-400" />
                          ) : (
                            <ChevronRight size={18} className="text-slate-400" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="bg-slate-900 px-4 py-3 border-t border-slate-800 flex justify-between items-center transition-all">
                          <div>
                            <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-0.5">Frequency</p>
                            <p className="text-sm font-medium text-slate-300">Paid {emp.pay_frequency}</p>
                          </div>
                          
                          <button 
                            onClick={() => setEditingEmployee(emp)}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-medium py-1.5 px-4 rounded-lg shadow disabled:opacity-50 transition-all text-sm flex items-center gap-1.5"
                          >
                            <Edit3 size={14}/>
                            Edit Salary
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
