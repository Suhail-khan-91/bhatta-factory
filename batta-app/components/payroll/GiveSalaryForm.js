"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, User, Briefcase, CreditCard, Calendar, IndianRupee, Save, Calculator, CheckCircle2, Trash2, Clock, History, PlusCircle } from "lucide-react";
import { getEmployees, createSalaryPayment, deletePayrollRecord } from "@/lib/api";
import ConfirmModal from "@/components/ui/ConfirmModal";

const CATEGORIES = ["Jhokwa", "Driver", "Bharae wala", "Coal picker", "General"];

export default function GiveSalaryForm({ onBack }) {
  const [activeTab, setActiveTab] = useState('form'); // form, history
  const [modalConfig, setModalConfig] = useState({ isOpen: false, idToDelete: null, message: '' });
  const [employees, setEmployees] = useState([]);
  const [recentSalaries, setRecentSalaries] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [category, setCategory] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [selectedPastDues, setSelectedPastDues] = useState([]);
  const [selectedPastAdvances, setSelectedPastAdvances] = useState([]);
  const [paymentType, setPaymentType] = useState("Full Payment");
  const [partialAmount, setPartialAmount] = useState("");
  const [calculatedPending, setCalculatedPending] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [employeeLedger, setEmployeeLedger] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      const [empData, ledgerData] = await Promise.all([
        getEmployees(),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/payroll/ledger`).then(res => res.json())
      ]);
      setEmployees(empData);
      setRecentSalaries(ledgerData.filter(l => l.transaction_type === "SALARY"));
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const filteredEmployees = employees.filter((emp) => emp.employee_category === category);
  const selectedEmployee = employees.find((emp) => emp.id.toString() === employeeId);

  useEffect(() => {
    if (employeeId) {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      fetch(`${API_URL}/api/v1/payroll/ledger/${employeeId}`)
        .then(res => res.json())
        .then(data => {
            setEmployeeLedger(data);
            setSelectedPastDues([]);
            setSelectedPastAdvances([]);
        })
        .catch(err => console.error(err));
    }
  }, [employeeId]);

  const pastDues = employeeLedger.filter(l => Number(l.due_created) > 0 && l.transaction_type === "SALARY");
  const pastAdvances = employeeLedger.filter(l => l.transaction_type === "ADVANCE_GIVEN");

  const handleEmployeeChange = (e) => {
    const empId = e.target.value;
    setEmployeeId(empId);
    setPaymentType("Full Payment");
    setPartialAmount("");
    setCalculatedPending(null);
  };

  const handleTogglePastDue = (dueId) => {
    setSelectedPastDues((prev) => 
      prev.includes(dueId) ? prev.filter(id => id !== dueId) : [...prev, dueId]
    );
  };

  const handleTogglePastAdvance = (advId) => {
    setSelectedPastAdvances((prev) => 
      prev.includes(advId) ? prev.filter(id => id !== advId) : [...prev, advId]
    );
  };

  const calculatePending = () => {
    if (selectedEmployee && paymentType === "Partial Payment") {
      const remaining = Number(selectedEmployee.base_salary) - Number(partialAmount);
      setCalculatedPending(remaining > 0 ? remaining : 0);
    }
  };

  const getDuesSum = () => {
    return pastDues
      .filter((d) => selectedPastDues.includes(d.id))
      .reduce((sum, d) => sum + Number(d.due_created), 0);
  };

  const getAdvancesSum = () => {
    return pastAdvances
      .filter((a) => selectedPastAdvances.includes(a.id))
      .reduce((sum, a) => sum + Number(a.amount), 0);
  };

  const getTodayPaid = () => {
    if (!selectedEmployee) return 0;
    return paymentType === "Full Payment" ? Number(selectedEmployee.base_salary) : Number(partialAmount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    const fixedSalary = Number(selectedEmployee.base_salary) || 0;
    const paidToday = getTodayPaid();
    const sumDues = getDuesSum();
    const sumAdvances = getAdvancesSum();
    const finalPayout = Math.max(0, paidToday + sumDues - sumAdvances);
    const pendingCreated = paymentType === "Full Payment" ? 0 : fixedSalary - paidToday;
    
    const payload = {
      employee_id: selectedEmployee.id,
      transaction_type: "SALARY",
      amount: finalPayout,
      base_salary: fixedSalary,
      due_created: pendingCreated,
      advance_deducted: sumAdvances,
      payment_method: paymentMethod,
      transaction_date: new Date(date).toISOString(),
    };

    try {
      setIsLoading(true);
      await createSalaryPayment(payload);
      setSubmitted(true);
      setTimeout(() => { 
        setSubmitted(false); 
        fetchData();
        setActiveTab('history');
      }, 1000);
    } catch (err) {
      alert("Failed to record salary: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!modalConfig.idToDelete) return;
    try {
      setIsLoading(true);
      await deletePayrollRecord(modalConfig.idToDelete);
      setModalConfig({ ...modalConfig, isOpen: false });
      fetchData();
    } catch (err) {
      alert("Failed to delete record: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6 bg-slate-900">
        <CheckCircle2 size={64} className="text-green-400 animate-bounce" />
        <p className="text-white text-xl font-semibold">Salary Recorded!</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-900 text-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center px-4 py-4">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-800 rounded-full text-slate-300">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold ml-2">Give Salary</h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-800/50 mx-4 mb-4 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('form')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'form' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <PlusCircle size={16} />
            Log Entry
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <History size={16} />
            Recent History
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'form' && (
          <form onSubmit={handleSubmit} className="px-4 py-6 flex flex-col gap-5 pb-10">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Briefcase size={16} className="text-blue-400" />
                Employee Category
              </label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setEmployeeId(""); }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                required
              >
                <option value="" disabled>Select category...</option>
                {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <User size={16} className="text-blue-400" />
                Employee Name
              </label>
              <select
                value={employeeId}
                onChange={handleEmployeeChange}
                disabled={!category || isLoadingData}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-white"
                required
              >
                <option value="" disabled>{isLoadingData ? "Loading..." : "Select employee..."}</option>
                {filteredEmployees.map((emp) => <option key={emp.id} value={emp.id}>{emp.full_name}</option>)}
              </select>
            </div>

            {selectedEmployee && (
              <>
                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 flex justify-between items-center shadow-inner">
                  <div>
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Pay Type</p>
                    <p className="font-medium text-slate-200">{selectedEmployee.pay_frequency} Paid</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Fixed Salary</p>
                    <p className="text-xl font-bold text-green-400 flex items-center gap-1 justify-end">
                      <IndianRupee size={18} />
                      {Number(selectedEmployee.base_salary).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Past Pending Dues</label>
                  {pastDues.length === 0 ? (
                    <div className="flex items-center gap-2 bg-emerald-900/30 text-emerald-400 border border-emerald-800/50 rounded-xl p-3">
                      <CheckCircle2 size={18} />
                      <span className="text-sm font-medium">No Pending Dues</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {pastDues.map((due) => (
                        <label key={due.id} className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-xl p-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedPastDues.includes(due.id)}
                            onChange={() => handleTogglePastDue(due.id)}
                            className="w-6 h-6 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-800"
                          />
                          <span className="flex-1 text-lg font-medium">₹{Number(due.due_created)} from {new Date(due.transaction_date).toLocaleDateString()}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Past Advances (To Deduct)</label>
                  {pastAdvances.length === 0 ? (
                    <div className="flex items-center gap-2 bg-emerald-900/30 text-emerald-400 border border-emerald-800/50 rounded-xl p-3">
                      <CheckCircle2 size={18} />
                      <span className="text-sm font-medium">No Advances Taken</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {pastAdvances.map((adv) => (
                        <label key={adv.id} className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-3 cursor-pointer text-red-400">
                          <input
                            type="checkbox"
                            checked={selectedPastAdvances.includes(adv.id)}
                            onChange={() => handleTogglePastAdvance(adv.id)}
                            className="w-6 h-6 rounded border-red-600/50 bg-slate-700 text-red-500 focus:ring-red-500 focus:ring-offset-slate-800"
                          />
                          <span className="flex-1 text-lg font-medium">-₹{Number(adv.amount)} from {new Date(adv.transaction_date).toLocaleDateString()}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-300">Today's Salary</label>
                  <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
                    <button
                      type="button"
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${paymentType === "Full Payment" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
                      onClick={() => { setPaymentType("Full Payment"); setCalculatedPending(null); }}
                    >
                      Full Payment
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${paymentType === "Partial Payment" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
                      onClick={() => setPaymentType("Partial Payment")}
                    >
                      Partial Payment
                    </button>
                  </div>

                  {paymentType === "Partial Payment" && (
                    <div className="space-y-2 bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={partialAmount}
                          onChange={(e) => { setPartialAmount(e.target.value); setCalculatedPending(null); }}
                          placeholder="Actual Amount Paid (₹)"
                          className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                          required
                        />
                        <button
                          type="button"
                          onClick={calculatePending}
                          className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 rounded-lg text-sm font-medium flex items-center gap-1 transition-all"
                        >
                          <Calculator size={16} />
                          Calc
                        </button>
                      </div>
                      {calculatedPending !== null && (
                        <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-400 text-base font-semibold text-center">
                          Will create new pending due: ₹{calculatedPending}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border border-blue-800/50 rounded-xl p-5 shadow-lg flex flex-col gap-2 my-2">
                  <div className="flex justify-between items-center border-b border-blue-800/50 pb-2">
                    <span className="text-blue-300 text-sm">Today's Pay</span>
                    <span className="text-blue-200 font-medium">₹{getTodayPaid()}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-blue-800/50 pb-2">
                    <span className="text-blue-300 text-sm">Pending Dues Added</span>
                    <span className="text-green-400 font-medium">+₹{getDuesSum()}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-blue-800/50 pb-2">
                    <span className="text-blue-300 text-sm">Advances Deducted</span>
                    <span className="text-red-400 font-medium">-₹{getAdvancesSum()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-white font-bold uppercase tracking-wider text-sm">Final Payout</span>
                    <div className="text-2xl font-bold text-white flex items-center gap-1">
                      <IndianRupee size={22} />
                      {Math.max(0, getTodayPaid() + getDuesSum() - getAdvancesSum()).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5 mt-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <CreditCard size={16} className="text-blue-400" />
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer/UPI">Bank Transfer/UPI</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Calendar size={16} className="text-blue-400" />
                Payment Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 text-white [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                required
              />
            </div>

            <div className="mt-6 pb-8">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <Save size={20} />
                {isLoading ? "Saving..." : "Record Payout"}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'history' && (
          <div className="px-4 py-6 space-y-4">
            <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
              <History size={14} />
              Recent Salary Payments
            </h2>
            {recentSalaries.length === 0 ? (
              <p className="text-center text-slate-500 py-10">No recent salary payments found.</p>
            ) : (
              recentSalaries.sort((a,b) => new Date(b.transaction_date) - new Date(a.transaction_date)).map((sal) => {
                const emp = employees.find(e => e.id === sal.employee_id);
                return (
                  <div key={sal.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex items-center justify-between group">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-emerald-400">{emp?.full_name || "Unknown"}</span>
                        <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full font-bold uppercase">{emp?.employee_category}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-xl font-extrabold text-white flex items-center gap-1">
                          <IndianRupee size={16} />
                          {Number(sal.amount).toLocaleString('en-IN')}
                        </p>
                        <div className="flex items-center gap-1 text-slate-500 text-xs">
                          <Clock size={12} />
                          {new Date(sal.transaction_date).toLocaleDateString()}
                        </div>
                      </div>
                      {Number(sal.due_created) > 0 && (
                        <p className="text-orange-400 text-[10px] mt-1 font-medium">Created Due: ₹{Number(sal.due_created).toLocaleString()}</p>
                      )}
                      <p className="text-slate-500 text-[10px] mt-1 italic">{sal.payment_method}</p>
                    </div>
                    <button
                      onClick={() => setModalConfig({ isOpen: true, idToDelete: sal.id, message: `Delete this ₹${sal.amount} salary payment for ${emp?.full_name}? Pending dues and advances will be recalculated.` })}
                      className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all active:scale-90"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={handleDelete}
        title="Delete Record?"
        message={modalConfig.message}
        type="danger"
      />
    </div>
  );
}
