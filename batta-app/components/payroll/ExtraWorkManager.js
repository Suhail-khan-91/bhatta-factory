"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, User, Briefcase, Calendar, IndianRupee, Save, PlusCircle, CreditCard, ChevronDown, ChevronRight, Wrench } from "lucide-react";
import Combobox from "@/components/ui/Combobox";
import { getEmployees, createExtraWork } from "@/lib/api";

const CATEGORIES = ["Jhokwa", "Driver", "Bharae wala", "Coal picker", "General"];
const WORK_OPTIONS = ["Night Shift", "Coal Unloading", "Machine Repair", "Jungle Cleaning"];

export default function ExtraWorkManager({ onBack }) {
  const [modal, setModal] = useState({show: false, message: '', isError: false});
  const [view, setView] = useState('menu');
  const [selectedTask, setSelectedTask] = useState(null);
  const [expandedEmployees, setExpandedEmployees] = useState({});
  const [employees, setEmployees] = useState([]);
  const [extraWorks, setExtraWorks] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Form States (Entry)
  const [category, setCategory] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [workDesc, setWorkDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isLoading, setIsLoading] = useState(false);

  // Form States (Pay)
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      const empData = await getEmployees();
      setEmployees(empData);
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/api/v1/payroll/extra-work`);
      if (res.ok) {
        const works = await res.json();
        setExtraWorks(works.filter(w => !w.is_paid));
      }
    } catch (err) {
      alert("Failed to load data: " + err.message);
    } finally {
      setIsLoadingData(false);
    }
  };

  const toggleEmployee = (empName) => {
    setExpandedEmployees((prev) => ({ ...prev, [empName]: !prev[empName] }));
  };

  const handleEntrySubmit = async (e) => {
    e.preventDefault();
    const payload = {
      employee_id: parseInt(employeeId),
      work_name: workDesc,
      amount: Number(amount),
      date_logged: date,
      is_paid: false
    };
    
    try {
      setIsLoading(true);
      await createExtraWork(payload);
      alert("Extra work logged successfully!");
      fetchData();
      setView('menu');
    } catch (err) {
      alert("Failed to log extra work: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    const payload = {
      is_paid: true,
      payment_method: paymentMethod,
      payment_date: payDate
    };
    
    try {
      setIsLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/api/v1/payroll/extra-work/${selectedTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to update payment");
      alert("Payment confirmed!");
      fetchData();
      setView('dashboard');
    } catch (err) {
      alert("Failed to confirm payment: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (view === 'menu') {
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
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-800 rounded-full text-slate-300">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold ml-2">Extra Work Salary</h1>
        </div>

        <div className="flex flex-col gap-4 px-4 mt-4">
          <button 
            onClick={() => setView('entry')}
            className="bg-gradient-to-br from-pink-600 to-rose-700 hover:from-pink-500 hover:to-rose-600 text-white p-6 rounded-2xl shadow-lg flex flex-col items-start gap-4 active:scale-95 transition-all text-left group border border-pink-500/20"
          >
            <div className="bg-white/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <PlusCircle size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-1">1. Log New Extra Work</h2>
              <p className="text-pink-200 text-sm opacity-90">Record a new task, overtime, or custom gig completed by a worker.</p>
            </div>
          </button>

          <button 
            onClick={() => setView('dashboard')}
            className="bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white p-6 rounded-2xl shadow-lg flex flex-col items-start gap-4 active:scale-95 transition-all text-left group border border-emerald-500/20"
          >
            <div className="bg-white/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <IndianRupee size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-1">2. Pay for Extra Work</h2>
              <p className="text-emerald-200 text-sm opacity-90">View pending tasks grouped by employee and clear their payments.</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (view === 'entry') {
    const filteredEmployees = employees.filter((emp) => emp.employee_category === category);
    
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
          <button onClick={() => setView('menu')} className="p-2 -ml-2 hover:bg-slate-800 rounded-full text-slate-300">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold ml-2">Log Extra Work</h1>
        </div>

        <form onSubmit={handleEntrySubmit} className="flex-1 px-4 flex flex-col gap-5 overflow-y-auto pb-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2"><Briefcase size={16} className="text-pink-400" /> Employee Category</label>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setEmployeeId(""); }}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-pink-500 text-white"
              required
            >
              <option value="" disabled>Select category...</option>
              {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2"><User size={16} className="text-pink-400" /> Employee Name</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              disabled={!category || isLoadingData}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50 text-white"
              required
            >
              <option value="" disabled>{isLoadingData ? "Loading..." : "Select employee..."}</option>
              {filteredEmployees.map((emp) => <option key={emp.id} value={emp.id}>{emp.full_name}</option>)}
            </select>
          </div>

          <div className="space-y-1.5 relative">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2"><Wrench size={16} className="text-pink-400" /> Work Description</label>
            <Combobox 
              id="work-description"
              value={workDesc}
              onChange={(val) => setWorkDesc(val)}
              options={WORK_OPTIONS}
              placeholder="Start typing or select..."
              accentClass="focus:ring-pink-500/40 focus:border-pink-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2"><IndianRupee size={16} className="text-pink-400" /> Amount Agreed (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 500"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-pink-500 text-white"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2"><Calendar size={16} className="text-pink-400" /> Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-pink-500 text-white [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
              required
            />
          </div>

          <div className="mt-6 pb-8">
            <button type="submit" disabled={isLoading} className="w-full bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-pink-600/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
              <Save size={20} />
              {isLoading ? "Saving..." : "Log Extra Work"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (view === 'dashboard') {
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
          <button onClick={() => setView('menu')} className="p-2 -ml-2 hover:bg-slate-800 rounded-full text-slate-300">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold ml-2">Pending Extra Work</h1>
        </div>

        <div className="flex-1 px-4 overflow-y-auto pb-6 space-y-4">
          {isLoadingData ? <p className="text-center text-slate-500">Loading...</p> : CATEGORIES.map((category) => {
            const categoryEmps = employees.filter(e => e.employee_category === category);
            const empIds = categoryEmps.map(e => e.id);
            const categoryTasks = extraWorks.filter(task => empIds.includes(task.employee_id));
            
            if (categoryTasks.length === 0) return null;

            const employeeNames = [...new Set(categoryTasks.map(t => categoryEmps.find(e => e.id === t.employee_id)?.full_name))];

            return (
              <div key={category} className="bg-slate-800 rounded-xl p-4 shadow-md border border-slate-700">
                <h2 className="text-lg font-bold text-slate-200 mb-3 border-b border-slate-700 pb-2">{category}</h2>

                <div className="space-y-3">
                  {employeeNames.map(empName => {
                    const emp = categoryEmps.find(e => e.full_name === empName);
                    const empTasks = categoryTasks.filter(t => t.employee_id === emp?.id);
                    const totalAmount = empTasks.reduce((sum, t) => sum + Number(t.amount), 0);
                    const isExpanded = !!expandedEmployees[empName];

                    return (
                      <div key={empName} className="bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden">
                        <button
                          onClick={() => toggleEmployee(empName)}
                          className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-800/80 transition-colors"
                        >
                          <span className="font-semibold text-slate-200">{empName}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-emerald-400 font-bold flex items-center">
                              <IndianRupee size={14} className="mr-0.5" />
                              {totalAmount.toLocaleString('en-IN')}
                            </span>
                            {isExpanded ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="bg-slate-900 px-3 py-3 border-t border-slate-800 space-y-3">
                            {empTasks.map(task => (
                              <div key={task.id} className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <p className="text-slate-200 font-medium text-base">{task.work_name}</p>
                                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Calendar size={12}/>{task.date_logged}</p>
                                  </div>
                                  <p className="text-emerald-400 font-bold">₹{task.amount}</p>
                                </div>
                                <button 
                                  onClick={() => { setSelectedTask({...task, empName, category}); setView('pay'); }}
                                  className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-lg text-sm flex items-center justify-center gap-1.5 transition-colors"
                                >
                                  <CreditCard size={16}/> Pay Amount
                                </button>
                              </div>
                            ))}
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

  if (view === 'pay' && selectedTask) {
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
          <button onClick={() => setView('dashboard')} className="p-2 -ml-2 hover:bg-slate-800 rounded-full text-slate-300">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold ml-2">Pay Extra Work</h1>
        </div>

        <form onSubmit={handlePaySubmit} className="flex-1 px-4 flex flex-col gap-5 overflow-y-auto pb-6">
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 shadow-inner space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-700">
              <span className="text-slate-400 text-sm">Employee</span>
              <span className="font-semibold">{selectedTask.empName} ({selectedTask.category})</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-700">
              <span className="text-slate-400 text-sm">Work Description</span>
              <span className="font-semibold text-right max-w-[60%]">{selectedTask.work_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Amount to Pay</span>
              <span className="text-2xl font-bold text-emerald-400 flex items-center">
                <IndianRupee size={20}/>{selectedTask.amount}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 mt-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2"><CreditCard size={16} className="text-emerald-400" /> Payment Method</label>
            <div className="relative">
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer/UPI">Bank Transfer/UPI</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2"><Calendar size={16} className="text-emerald-400" /> Payment Date</label>
            <input
              type="date"
              value={payDate}
              onChange={(e) => setPayDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
              required
            />
          </div>

          <div className="mt-6 pb-8">
            <button type="submit" disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
              <Save size={20} />
              {isLoading ? "Saving..." : "Confirm Payment"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return null;
}
