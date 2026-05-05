"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ChevronDown, ChevronRight, IndianRupee, CheckCircle2, AlertCircle, Clock, Wrench, BarChart2, TrendingDown } from "lucide-react";
import { getEmployees } from "@/lib/api";
import ConfirmModal from "@/components/ui/ConfirmModal";

const CATEGORIES = ["Jhokwa", "Driver", "Bharae wala", "Coal picker", "General"];

const STATUS_BADGE = (status) => {
  if (status === "Active") return "bg-orange-500/20 text-orange-400 border-orange-500/30";
  if (status.startsWith("Cleared") || status === "Paid" || status.startsWith("Deducted")) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  return "bg-slate-700 text-slate-400 border-slate-600";
};

const SALARY_STATUS_COLOR = (status) => {
  if (status.includes("Partial")) return "text-orange-400";
  if (status.includes("Full")) return "text-emerald-400";
  return "text-slate-300";
};

export default function HistoryStatsDashboard({ onBack }) {
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'info', title: '', message: '' });
  const [employees, setEmployees] = useState([]);
  const [ledgers, setLedgers] = useState({});
  const [extraWorks, setExtraWorks] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [view, setView] = useState("dashboard");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [activeTab, setActiveTab] = useState("give_salary");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const emps = await getEmployees();
        setEmployees(emps);
        
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const ledgersMap = {};
        for (const emp of emps) {
          const res = await fetch(`${API_URL}/api/v1/payroll/ledger/${emp.id}`);
          if (res.ok) ledgersMap[emp.id] = await res.json();
        }
        setLedgers(ledgersMap);

        const exRes = await fetch(`${API_URL}/api/v1/payroll/extra-work`);
        if (exRes.ok) setExtraWorks(await exRes.json());
      } catch (err) {
        setModalConfig({ isOpen: true, type: 'danger', title: 'Error', message: err.message || 'Operation failed' });
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const toggleCategory = (cat) => setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));

  const handleSelectEmployee = (emp) => {
    setSelectedEmployee(emp);
    setActiveTab("give_salary");
    setView("ledger");
  };

  const getEmpData = (empId) => {
    const empLedger = ledgers[empId] || [];
    const salaryHistory = empLedger.filter(l => l.transaction_type === "SALARY").map(l => ({
      id: l.id,
      date: new Date(l.transaction_date).toLocaleDateString(),
      base: Number(l.base_salary),
      advanceDeducted: Number(l.advance_deducted),
      pendingCleared: 0,
      finalPaid: Number(l.amount),
      dueCreated: Number(l.due_created),
      status: Number(l.amount) >= Number(l.base_salary) ? "Full Payment" : "Partial Payment"
    }));
    const pendingHistory = empLedger.filter(l => l.transaction_type === "SALARY" && Number(l.due_created) > 0).map(l => ({
      id: l.id, date: new Date(l.transaction_date).toLocaleDateString(), amount: Number(l.due_created), status: "Active"
    }));
    const advanceHistory = empLedger.filter(l => l.transaction_type === "ADVANCE_GIVEN").map(l => ({
      id: l.id, date: new Date(l.transaction_date).toLocaleDateString(), amount: Number(l.amount), status: "Active"
    }));
    const extraWorkHistory = extraWorks.filter(e => e.employee_id === empId).map(e => ({
      id: e.id, date: new Date(e.date_logged).toLocaleDateString(), work: e.work_name, amount: Number(e.amount), status: e.is_paid ? "Paid" : "Pending"
    }));

    const paidThisMonth = empLedger.reduce((sum, l) => sum + Number(l.amount), 0);
    const activeDues = pendingHistory.reduce((sum, d) => sum + d.amount, 0);
    const activeAdvances = advanceHistory.reduce((sum, a) => sum + a.amount, 0);

    return { salaryHistory, pendingHistory, advanceHistory, extraWorkHistory, paidThisMonth, activeDues, activeAdvances };
  };

  if (view === "ledger" && selectedEmployee) {
    const empData = getEmpData(selectedEmployee.id);
    const TABS = [
      { key: "give_salary", label: "Give Salary" },
      { key: "pending",     label: "Pending" },
      { key: "advanced",    label: "Advances" },
      { key: "extra",       label: "Extra Work" },
    ];

    return (
      <div className="min-h-full bg-slate-900 text-white flex flex-col pt-4">
        <ConfirmModal 
          isOpen={modalConfig.isOpen} 
          type={modalConfig.type} 
          title={modalConfig.title} 
          message={modalConfig.message} 
          onConfirm={() => setModalConfig({ ...modalConfig, isOpen: false })} 
        />
        <div className="flex items-center px-4 mb-4">
          <button onClick={() => setView("dashboard")} className="p-2 -ml-2 hover:bg-slate-800 rounded-full text-slate-300">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold ml-2">{selectedEmployee.full_name}'s Ledger</h1>
        </div>

        <div className="mx-4 mb-4 bg-slate-800 border border-slate-700 rounded-2xl p-4 grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-slate-400 text-xs mb-1">Fixed Salary</p>
            <p className="text-white font-bold">₹{Number(selectedEmployee.base_salary).toLocaleString("en-IN")}</p>
          </div>
          <div className="border-x border-slate-700">
            <p className="text-slate-400 text-xs mb-1">Pending Dues</p>
            <p className={`font-bold ${empData.activeDues > 0 ? "text-orange-400" : "text-emerald-400"}`}>
              ₹{empData.activeDues.toLocaleString("en-IN")}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-1">Advances</p>
            <p className={`font-bold ${empData.activeAdvances > 0 ? "text-red-400" : "text-emerald-400"}`}>
              ₹{empData.activeAdvances.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="flex gap-2 px-4 overflow-x-auto pb-2 scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.key ? "bg-blue-600 text-white shadow shadow-blue-600/40" : "bg-slate-800 text-slate-400 border border-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 px-4 pt-3 overflow-y-auto pb-8 space-y-3">
          {activeTab === "give_salary" && (
            empData.salaryHistory.length === 0 ? (
              <p className="text-slate-500 text-sm italic text-center pt-10">No salary records yet.</p>
            ) : (
              empData.salaryHistory.map((rec) => (
                <div key={rec.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-slate-400 text-sm font-medium">{rec.date}</p>
                    <span className={`text-xs font-semibold ${SALARY_STATUS_COLOR(rec.status)}`}>{rec.status}</span>
                  </div>
                  <div className="bg-slate-900/60 rounded-xl p-3 space-y-2 border border-slate-700/50">
                    <div className="flex justify-between text-sm text-slate-300">
                      <span>Base Salary</span>
                      <span className="font-medium">₹{rec.base.toLocaleString("en-IN")}</span>
                    </div>
                    {rec.advanceDeducted > 0 && (
                      <div className="flex justify-between text-sm text-red-400">
                        <span>Advance Deducted</span>
                        <span className="font-medium">− ₹{rec.advanceDeducted.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    <div className="border-t border-slate-700 pt-2 flex justify-between items-center">
                      <span className="text-slate-300 text-sm font-semibold">Final Payout</span>
                      <span className="text-2xl font-bold text-white">₹{rec.finalPaid.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                  {rec.dueCreated > 0 && (
                    <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2">
                      <AlertCircle size={15} className="text-orange-400 shrink-0" />
                      <span className="text-orange-400 text-sm font-medium">Created New Due: ₹{rec.dueCreated.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                </div>
              ))
            )
          )}

          {activeTab === "pending" && (
            empData.pendingHistory.length === 0 ? (
              <div className="flex items-center gap-2 bg-emerald-900/30 text-emerald-400 border border-emerald-800/50 rounded-xl p-4 mt-4">
                <CheckCircle2 size={18} />
                <span className="text-sm font-medium">No pending dues on record.</span>
              </div>
            ) : (
              empData.pendingHistory.map((rec) => (
                <div key={rec.id} className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-xs mb-1">{rec.date}</p>
                    <p className="text-white font-bold text-lg">₹{rec.amount.toLocaleString("en-IN")}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_BADGE(rec.status)}`}>{rec.status}</span>
                </div>
              ))
            )
          )}

          {activeTab === "advanced" && (
            empData.advanceHistory.length === 0 ? (
              <div className="flex items-center gap-2 bg-emerald-900/30 text-emerald-400 border border-emerald-800/50 rounded-xl p-4 mt-4">
                <CheckCircle2 size={18} />
                <span className="text-sm font-medium">No advance records found.</span>
              </div>
            ) : (
              empData.advanceHistory.map((rec) => (
                <div key={rec.id} className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-xs mb-1">{rec.date}</p>
                    <p className="text-red-400 font-bold text-lg flex items-center gap-1"><TrendingDown size={16} />₹{rec.amount.toLocaleString("en-IN")}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_BADGE(rec.status)}`}>{rec.status}</span>
                </div>
              ))
            )
          )}

          {activeTab === "extra" && (
            empData.extraWorkHistory.length === 0 ? (
              <div className="flex items-center gap-2 bg-emerald-900/30 text-emerald-400 border border-emerald-800/50 rounded-xl p-4 mt-4">
                <CheckCircle2 size={18} />
                <span className="text-sm font-medium">No extra work records found.</span>
              </div>
            ) : (
              empData.extraWorkHistory.map((rec) => (
                <div key={rec.id} className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-xs mb-0.5">{rec.date}</p>
                    <p className="text-slate-200 font-medium text-base">{rec.work}</p>
                    <p className="text-purple-400 font-bold text-lg">₹{rec.amount.toLocaleString("en-IN")}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_BADGE(rec.status)}`}>{rec.status}</span>
                </div>
              ))
            )
          )}
        </div>
      </div>
    );
  }

  let totalPaid = 0;
  let totalDues = 0;
  employees.forEach(e => {
    const data = getEmpData(e.id);
    totalPaid += data.paidThisMonth;
    totalDues += data.activeDues;
  });

  return (
    <div className="min-h-full bg-slate-900 text-white flex flex-col pt-4">
      <ConfirmModal 
        isOpen={modalConfig.isOpen} 
        type={modalConfig.type} 
        title={modalConfig.title} 
        message={modalConfig.message} 
        onConfirm={() => setModalConfig({ ...modalConfig, isOpen: false })} 
      />
      <div className="flex items-center px-4 mb-5">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-800 rounded-full text-slate-300">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold ml-2">Payroll History & Stats</h1>
      </div>

      <div className="flex-1 px-4 overflow-y-auto pb-8 space-y-4">
        <div className="bg-gradient-to-br from-indigo-900/70 to-slate-800 border border-indigo-700/40 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={18} className="text-indigo-400" />
            <p className="text-sm font-semibold text-indigo-300 uppercase tracking-wider">Factory Snapshot</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
              <p className="text-emerald-400 text-xs font-medium mb-1">Total Paid</p>
              <p className="text-white text-xl font-bold flex items-center">
                <IndianRupee size={18} className="mr-0.5" />
                {totalPaid.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
              <p className="text-orange-400 text-xs font-medium mb-1">Factory Pending Dues</p>
              <p className="text-white text-xl font-bold flex items-center">
                <IndianRupee size={18} className="mr-0.5" />
                {totalDues.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>

        {isLoadingData ? <p className="text-center text-slate-500">Loading...</p> : CATEGORIES.map((cat) => {
          const emps = employees.filter((e) => e.employee_category === cat);
          if (emps.length === 0) return null;
          const isOpen = !!expandedCategories[cat];

          return (
            <div key={cat} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <button
                onClick={() => toggleCategory(cat)}
                className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-700/50 transition-colors"
              >
                <span className="font-bold text-slate-200">{cat}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{emps.length} employee{emps.length > 1 ? "s" : ""}</span>
                  <ChevronRight size={18} className={`text-slate-400 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-slate-700 divide-y divide-slate-700/60">
                  {emps.map((emp) => {
                    const empData = getEmpData(emp.id);
                    return (
                      <button
                        key={emp.id}
                        onClick={() => handleSelectEmployee(emp)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-700/40 transition-colors text-left"
                      >
                        <div>
                          <p className="font-semibold text-slate-200 text-sm">{emp.full_name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            <span className="text-emerald-400 font-medium">Paid: ₹{empData.paidThisMonth.toLocaleString("en-IN")}</span>
                            {empData.activeDues > 0 && (
                              <span className="text-orange-400 font-medium"> · Dues: ₹{empData.activeDues.toLocaleString("en-IN")}</span>
                            )}
                          </p>
                        </div>
                        <ChevronRight size={16} className="text-slate-500 shrink-0" />
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
