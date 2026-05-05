"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, User, Briefcase, CreditCard, Calendar, IndianRupee, Save, CheckCircle2, Trash2, Clock, History, PlusCircle } from "lucide-react";
import { getEmployees, createAdvancePayment, deletePayrollRecord } from "@/lib/api";
import ConfirmModal from "@/components/ui/ConfirmModal";

const CATEGORIES = ["Jhokwa", "Driver", "Bharae wala", "Coal picker", "General"];

export default function AdvancePaymentForm({ onBack }) {
  const [activeTab, setActiveTab] = useState('form'); // form, history
  const [modalConfig, setModalConfig] = useState({ isOpen: false, idToDelete: null, message: '' });
  const [employees, setEmployees] = useState([]);
  const [recentAdvances, setRecentAdvances] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [category, setCategory] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
      setRecentAdvances(ledgerData.filter(l => l.transaction_type === "ADVANCE_GIVEN"));
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const filteredEmployees = employees.filter((emp) => emp.employee_category === category);
  const selectedEmployee = employees.find((emp) => emp.id.toString() === employeeId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    const payload = {
      employee_id: selectedEmployee.id,
      transaction_type: "ADVANCE_GIVEN",
      amount: Number(advanceAmount),
      payment_method: paymentMethod,
      transaction_date: new Date(date).toISOString(),
    };

    try {
      setIsLoading(true);
      await createAdvancePayment(payload);
      setSubmitted(true);
      setTimeout(() => { 
        setSubmitted(false); 
        setAdvanceAmount("");
        setEmployeeId("");
        fetchData();
        setActiveTab('history');
      }, 1000);
    } catch (err) {
      alert("Failed to record advance: " + err.message);
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

  const remainingExpected = selectedEmployee ? Number(selectedEmployee.base_salary) - Number(advanceAmount) : 0;

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6 bg-slate-900">
        <CheckCircle2 size={64} className="text-green-400 animate-bounce" />
        <p className="text-white text-xl font-semibold">Advance Recorded!</p>
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
          <h1 className="text-xl font-bold ml-2">Advanced Payment</h1>
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
          <form onSubmit={handleSubmit} className="px-4 py-6 flex flex-col gap-5">
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
                onChange={(e) => setEmployeeId(e.target.value)}
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
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <IndianRupee size={16} className="text-blue-400" />
                    Advance Amount (₹)
                  </label>
                  <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                    <input
                      type="number"
                      value={advanceAmount}
                      onChange={(e) => setAdvanceAmount(e.target.value)}
                      placeholder="e.g. 5000"
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 text-white mb-2"
                      required
                    />
                    {advanceAmount && (
                      <p className="text-slate-300 text-lg font-medium text-center mt-2">
                        Remaining Salary will be: <span className="text-blue-400 font-bold">₹{remainingExpected}</span>
                      </p>
                    )}
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
                {isLoading ? "Saving..." : "Record Advance"}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'history' && (
          <div className="px-4 py-6 space-y-4">
            <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
              <History size={14} />
              Recent Advance Payments
            </h2>
            {recentAdvances.length === 0 ? (
              <p className="text-center text-slate-500 py-10">No recent advances found.</p>
            ) : (
              recentAdvances.sort((a,b) => new Date(b.transaction_date) - new Date(a.transaction_date)).map((adv) => {
                const emp = employees.find(e => e.id === adv.employee_id);
                return (
                  <div key={adv.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex items-center justify-between group">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-blue-400">{emp?.full_name || "Unknown"}</span>
                        <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full font-bold uppercase">{emp?.employee_category}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-xl font-extrabold text-white flex items-center gap-1">
                          <IndianRupee size={16} />
                          {Number(adv.amount).toLocaleString('en-IN')}
                        </p>
                        <div className="flex items-center gap-1 text-slate-500 text-xs">
                          <Clock size={12} />
                          {new Date(adv.transaction_date).toLocaleDateString()}
                        </div>
                      </div>
                      <p className="text-slate-500 text-[10px] mt-1 italic">{adv.payment_method}</p>
                    </div>
                    <button
                      onClick={() => setModalConfig({ isOpen: true, idToDelete: adv.id, message: `Delete this ₹${adv.amount} advance for ${emp?.full_name}? The available balance will be recalculated.` })}
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
