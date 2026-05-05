"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ChevronDown, ChevronRight, IndianRupee, Calendar, User, Briefcase, CreditCard, Save } from "lucide-react";
import { getEmployees, getPayrollLedger, createSalaryPayment } from "@/lib/api";
import ConfirmModal from "@/components/ui/ConfirmModal";

const CATEGORIES = ["Jhokwa", "Driver", "Bharae wala", "Coal picker", "General"];

export default function PendingSalaryForm({ onBack }) {
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'info', title: '', message: '' });
  const [employees, setEmployees] = useState([]);
  const [ledgers, setLedgers] = useState({});
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [expandedEmployees, setExpandedEmployees] = useState({});
  const [payingEmployee, setPayingEmployee] = useState(null);
  
  const [selectedDues, setSelectedDues] = useState([]);
  const [paymentType, setPaymentType] = useState("Full Payment");
  const [partialAmount, setPartialAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      const emps = await getEmployees();
      setEmployees(emps);
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const ledgersMap = {};
      for (const emp of emps) {
        const res = await fetch(`${API_URL}/api/v1/payroll/ledger/${emp.id}`);
        if (res.ok) {
          ledgersMap[emp.id] = await res.json();
        }
      }
      setLedgers(ledgersMap);
    } catch (err) {
      setModalConfig({ isOpen: true, type: 'danger', title: 'Error', message: err.message || 'Operation failed' });
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getEmpDues = (empId) => {
    const l = ledgers[empId] || [];
    return l.filter(t => Number(t.due_created) > 0 && t.transaction_type === "SALARY");
  };

  useEffect(() => {
    if (payingEmployee) {
      const dues = getEmpDues(payingEmployee.id);
      setSelectedDues(dues.map(d => d.id));
      setPaymentType("Full Payment");
      setPartialAmount("");
    }
  }, [payingEmployee]);

  const toggleEmployee = (empId) => {
    setExpandedEmployees((prev) => ({ ...prev, [empId]: !prev[empId] }));
  };

  const handleToggleDue = (dueId) => {
    setSelectedDues((prev) => 
      prev.includes(dueId) ? prev.filter(id => id !== dueId) : [...prev, dueId]
    );
  };

  const getSelectedTotal = () => {
    if (!payingEmployee) return 0;
    const dues = getEmpDues(payingEmployee.id);
    return dues
      .filter((d) => selectedDues.includes(d.id))
      .reduce((sum, d) => sum + Number(d.due_created), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedTotal = getSelectedTotal();
    const actualPaid = paymentType === "Full Payment" ? selectedTotal : Number(partialAmount);
    const remainingCreated = Math.max(0, selectedTotal - actualPaid);
    
    const payload = {
      employee_id: payingEmployee.id,
      transaction_type: "CLEAR_DUES",
      amount: actualPaid,
      base_salary: Number(payingEmployee.base_salary),
      due_created: remainingCreated,
      advance_deducted: 0,
      payment_method: paymentMethod,
      transaction_date: new Date(date).toISOString(),
      cleared_dues: selectedDues,
    };

    try {
      setIsLoading(true);
      await createSalaryPayment(payload);
      setModalConfig({ isOpen: true, type: 'success', title: 'Success', message: 'Dues cleared successfully!' });
    } catch (err) {
      setModalConfig({ isOpen: true, type: 'danger', title: 'Error', message: err.message || 'Operation failed' });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (payingEmployee) {
    const selectedTotal = getSelectedTotal();
    const remaining = paymentType === "Full Payment" ? 0 : selectedTotal - Number(partialAmount);
    const empDues = getEmpDues(payingEmployee.id);

    return (
      <div className="min-h-full bg-slate-900 text-white flex flex-col pt-4">
        <ConfirmModal 
          isOpen={modalConfig.isOpen} 
          type={modalConfig.type} 
          title={modalConfig.title} 
          message={modalConfig.message} 
          onConfirm={() => {
            setModalConfig({ ...modalConfig, isOpen: false });
            if (modalConfig.type === 'success') {
              fetchData();
              setPayingEmployee(null);
              setSelectedDues([]);
              setPartialAmount("");
            }
          }} 
        />
        <div className="flex items-center px-4 mb-6">
          <button onClick={() => setPayingEmployee(null)} className="p-2 -ml-2 hover:bg-slate-800 rounded-full text-slate-300">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold ml-2">Clear Dues</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 px-4 flex flex-col gap-5 overflow-y-auto pb-6">
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 shadow-inner flex justify-between">
             <div className="space-y-1">
               <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"><Briefcase size={14}/> Category</p>
               <p className="font-medium text-slate-200">{payingEmployee.employee_category}</p>
             </div>
             <div className="text-right space-y-1">
               <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center justify-end gap-1.5"><User size={14}/> Employee</p>
               <p className="font-medium text-slate-200">{payingEmployee.full_name}</p>
             </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label className="text-sm font-medium text-slate-300">Select Dues to Clear</label>
              <span className="text-blue-400 font-bold text-sm">Selected: ₹{selectedTotal}</span>
            </div>
            <div className="space-y-2">
              {empDues.map((due) => (
                <label key={due.id} className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-xl p-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedDues.includes(due.id)}
                    onChange={() => handleToggleDue(due.id)}
                    className="w-6 h-6 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-800"
                  />
                  <span className="flex-1 text-lg font-medium text-white">₹{Number(due.due_created)} <span className="text-sm text-slate-400 font-normal">from {new Date(due.transaction_date).toLocaleDateString()}</span></span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300">Payment Amount</label>
            <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                type="button"
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${paymentType === "Full Payment" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
                onClick={() => setPaymentType("Full Payment")}
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
                <input
                  type="number"
                  value={partialAmount}
                  onChange={(e) => setPartialAmount(e.target.value)}
                  placeholder="Actual Amount Paid (₹)"
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  required
                />
                {partialAmount && (
                  <p className="text-slate-300 text-base font-medium text-center mt-2">
                    Remaining from selected: <span className="text-orange-400 font-bold">₹{remaining > 0 ? remaining : 0}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-1.5 mt-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <CreditCard size={16} className="text-blue-400" />
              Payment Method
            </label>
            <div className="relative">
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer/UPI">Bank Transfer/UPI</option>
              </select>
            </div>
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
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            >
              <Save size={20} />
              {isLoading ? "Saving..." : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-900 text-white flex flex-col pt-4">
      <ConfirmModal 
        isOpen={modalConfig.isOpen} 
        type={modalConfig.type} 
        title={modalConfig.title} 
        message={modalConfig.message} 
        onConfirm={() => setModalConfig({ ...modalConfig, isOpen: false })} 
      />
      <div className="flex items-center px-4 mb-6">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-800 rounded-full text-slate-300">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold ml-2">Pending Dues Dashboard</h1>
      </div>

      <div className="flex-1 px-4 overflow-y-auto pb-6 space-y-4">
        {isLoadingData ? <p className="text-center text-slate-500">Loading...</p> : CATEGORIES.map((category) => {
          const employeesWithDues = employees.filter(
            (emp) => emp.employee_category === category && getEmpDues(emp.id).length > 0
          );

          if (employeesWithDues.length === 0) return null;

          return (
            <div key={category} className="bg-slate-800 rounded-xl p-4 shadow-md border border-slate-700">
              <h2 className="text-lg font-bold text-slate-200 mb-3 border-b border-slate-700 pb-2">
                {category}
              </h2>

              <div className="space-y-3">
                {employeesWithDues.map((emp) => {
                  const isExpanded = !!expandedEmployees[emp.id];
                  const empDues = getEmpDues(emp.id);
                  const totalDues = empDues.reduce((sum, d) => sum + Number(d.due_created), 0);
                  const sortedDues = [...empDues].sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));

                  return (
                    <div key={emp.id} className="bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden">
                      <button
                        onClick={() => toggleEmployee(emp.id)}
                        className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-800/80 transition-colors"
                      >
                        <span className="font-semibold text-slate-200">{emp.full_name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-orange-400 font-bold flex items-center">
                            <IndianRupee size={14} className="mr-0.5" />
                            {totalDues.toLocaleString("en-IN")}
                          </span>
                          {isExpanded ? (
                            <ChevronDown size={18} className="text-slate-400" />
                          ) : (
                            <ChevronRight size={18} className="text-slate-400" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="bg-slate-900 px-3 py-3 border-t border-slate-800 space-y-3">
                          <div className="space-y-2">
                            {sortedDues.map((due) => (
                              <div
                                key={due.id}
                                className="flex justify-between items-center text-sm p-2 rounded-md bg-slate-800/40"
                              >
                                <div className="flex items-center text-slate-400 gap-1.5">
                                  <Calendar size={14} />
                                  <span>{new Date(due.transaction_date).toLocaleDateString()}</span>
                                </div>
                                <span className="text-slate-300 font-medium">₹{Number(due.due_created)}</span>
                              </div>
                            ))}
                          </div>
                          
                          <button 
                            onClick={() => setPayingEmployee(emp)}
                            className="w-full mt-2 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-bold py-2.5 rounded-lg shadow disabled:opacity-50 transition-all text-sm flex justify-center items-center gap-1"
                          >
                            <IndianRupee size={16}/>
                            Clear Pending Dues
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
