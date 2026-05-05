"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Activity, CheckCircle2, ChevronDown, Trash2 } from "lucide-react";
import { createFuelUsage, getSettings, getFuelSummary, getFuelUsages, deleteFuelUsage } from "@/lib/api";
import ConfirmModal from "../ui/ConfirmModal";

const MACHINES = ["JCB", "Tractor_1", "Tractor_2", "Icer Machine", "Small Green Machine"];
const GIVERS   = ["Master", "Uncle", "General Worker"];

// ── Reusable Combobox ─────────────────────────────────────────────────────────
function Combobox({ id, value, onChange, options, placeholder, accentClass = "focus:ring-orange-500/40 focus:border-orange-500" }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, []);

  const select = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  const inputBase =
    `w-full bg-gray-800 border rounded-xl pl-4 pr-10 py-3 text-white text-base
     focus:outline-none focus:ring-2 transition-all appearance-none
     border-gray-700 ${accentClass}`;

  return (
    <div ref={containerRef} className="relative">
      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        className={inputBase}
        autoComplete="off"
      />

      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          setIsOpen((prev) => !prev);
        }}
        className="
          absolute right-0 top-0 h-full px-3
          flex items-center justify-center
          text-gray-400 hover:text-white transition-colors
        "
        tabIndex={-1}
        aria-label="Toggle dropdown"
      >
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <ul
          className="
            absolute left-0 right-0 top-[calc(100%+4px)] z-50
            bg-gray-800 border border-gray-700 rounded-xl
            overflow-hidden shadow-xl shadow-black/40
          "
        >
          {options.map((option) => (
            <li key={option}>
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  select(option);
                }}
                className={`
                  w-full text-left px-4 py-3 text-base transition-colors
                  ${value === option
                    ? "bg-orange-500/20 text-orange-300 font-medium"
                    : "text-gray-200 hover:bg-gray-700 active:bg-gray-600"}
                `}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Main Form ─────────────────────────────────────────────────────────────────
export default function FuelOutputForm({ onBack }) {
  const [activeTab, setActiveTab] = useState('form');
  const [machines, setMachines] = useState([]);
  const [totalStock, setTotalStock] = useState(null);
  const [modal, setModal] = useState({show: false, message: '', isError: false});
  const [recentUsages, setRecentUsages] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });
  
  const fetchRecent = async () => {
    try {
      const res = await getFuelUsages();
      setRecentUsages(res || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStock = async () => {
    try {
      const res = await getFuelSummary();
      setTotalStock(res.current_stock);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getSettings("machines")
      .then(res => setMachines(res.values || []))
      .catch(console.error);

    fetchStock();
    fetchRecent();
  }, []);

  const [form, setForm] = useState({
    machine_name: "",
    liters_used: "",
    given_by: "Master",
    usage_date: new Date().toISOString().slice(0, 10),
    usage_time: new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit", minute: "2-digit", hour12: false,
    }),
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.liters_used || isNaN(form.liters_used) || Number(form.liters_used) <= 0)
      errs.liters_used = "Enter a valid amount";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const [year, month, day] = form.usage_date.split("-").map(Number);
    const [hours, minutes]   = form.usage_time.split(":").map(Number);
    const usageTimestamp = new Date(year, month - 1, day, hours, minutes, 0).toISOString();

    const payload = {
      machine_name: form.machine_name,
      liters_used:  Number(form.liters_used),
      given_by:     form.given_by.trim() || "Master",
      usage_date:   usageTimestamp,
      logged_by:    "Master",
    };

    try {
      setIsLoading(true);
      await createFuelUsage(payload);
      setSubmitted(true);
      setModal({show: true, message: "Fuel usage logged successfully!", isError: false});
      fetchRecent();
      fetchStock();
      setTimeout(() => { setSubmitted(false); onBack(); }, 1500);
    } catch (err) {
      console.error(err);
      setModal({show: true, message: "Failed to log usage: " + err.message, isError: true});
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUsage = async () => {
    const id = confirmDelete.id;
    if (!id) return;
    try {
      setIsLoading(true);
      await deleteFuelUsage(id);
      setConfirmDelete({ isOpen: false, id: null });
      await fetchRecent();
      await fetchStock();
    } catch (err) {
      setModal({show: true, message: err.message, isError: true});
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = (field) =>
    `w-full bg-gray-800 border rounded-xl px-4 py-3 text-white text-base
     focus:outline-none focus:ring-2 transition-all appearance-none
     ${errors[field]
       ? "border-red-500 focus:ring-red-500/40"
       : "border-gray-700 focus:ring-orange-500/40 focus:border-orange-500"}`;

  const labelCls = "block text-gray-400 text-xs font-medium uppercase tracking-wider mb-1.5";

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
        <CheckCircle2 size={64} className="text-green-400 animate-bounce" />
        <p className="text-white text-xl font-semibold">Fuel usage logged!</p>
        <p className="text-gray-400 text-sm">Returning to menu…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">

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

      {/* ── Header ── */}
      <div className="flex flex-col border-b border-gray-800">
        <div className="flex items-center gap-3 px-4 pt-5 pb-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 active:scale-95 transition-all"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Activity size={20} className="text-orange-400" />
            <h1 className="text-lg font-semibold">Fuel Output</h1>
          </div>
        </div>
        <div className="flex">
          <button 
            onClick={() => setActiveTab('form')} 
            className={`flex-1 py-3 text-sm font-semibold transition-all border-b-2 ${activeTab === 'form' ? 'text-orange-400 border-orange-400 bg-orange-400/10' : 'text-gray-500 border-transparent hover:bg-gray-800'}`}
          >
            Log Usage
          </button>
          <button 
            onClick={() => setActiveTab('history')} 
            className={`flex-1 py-3 text-sm font-semibold transition-all border-b-2 ${activeTab === 'history' ? 'text-orange-400 border-orange-400 bg-orange-400/10' : 'text-gray-500 border-transparent hover:bg-gray-800'}`}
          >
            Recent Usage
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
      {activeTab === 'form' && (
      <>
      {/* ── Form ── */}
      <form onSubmit={handleSubmit} className="px-4 py-5 space-y-5">

        {/* Target Machine / Vehicle */}
        <div>
          <label className={labelCls}>Target Machine / Vehicle</label>
          <Combobox
            id="machine_name"
            value={form.machine_name}
            onChange={(val) => set("machine_name", val)}
            options={machines}
            placeholder="Select or type a machine name"
          />
        </div>

        {/* Amount Used */}
        <div>
          <label className={labelCls}>Amount Used (Liters)</label>
          <input
            type="number"
            inputMode="decimal"
            placeholder="e.g. 5"
            value={form.liters_used}
            onChange={(e) => set("liters_used", e.target.value)}
            className={inputCls("liters_used")}
          />
          {errors.liters_used && (
            <p className="text-red-400 text-xs mt-1">{errors.liters_used}</p>
          )}
          {totalStock !== null && (
            <p className="text-sm font-semibold mt-1" style={{color: totalStock < 20 ? '#ef4444' : '#22c55e'}}>
              ⛽ Available Stock: {totalStock}L
            </p>
          )}
        </div>

        {/* Given By */}
        <div>
          <label className={labelCls}>Given By</label>
          <Combobox
            id="given_by"
            value={form.given_by}
            onChange={(val) => set("given_by", val)}
            options={GIVERS}
            placeholder="Select or type a name"
          />
        </div>

        {/* Date */}
        <div>
          <label className={labelCls}>Date</label>
          <input
            type="date"
            value={form.usage_date}
            onChange={(e) => set("usage_date", e.target.value)}
            className={`${inputCls("usage_date")} [color-scheme:dark]`}
          />
        </div>

        {/* Time */}
        <div>
          <label className={labelCls}>Time</label>
          <input
            type="time"
            value={form.usage_time}
            onChange={(e) => set("usage_time", e.target.value)}
            className={`${inputCls("usage_time")} [color-scheme:dark]`}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="
            w-full py-4 rounded-2xl disabled:opacity-50
            bg-orange-500 hover:bg-orange-400 active:scale-95
            text-white font-semibold text-lg
            transition-all shadow-lg shadow-orange-500/30
            flex items-center justify-center gap-2
          "
        >
          {isLoading ? "Saving..." : <><Activity size={20} />Log Fuel Usage</>}
        </button>

        <div className="h-2" />
      </form>
      </>
      )}

      {activeTab === 'history' && (
      <>
      {/* ── Recent Usage ── */}
      <div className="px-4 py-5">
        <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Recent Usage</h2>
        <div className="space-y-3">
          {recentUsages.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4 bg-gray-800/50 rounded-xl border border-gray-700/50">No recent usage found.</p>
          ) : (
            [...recentUsages].sort((a, b) => new Date(b.usage_date) - new Date(a.usage_date)).slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-center justify-between bg-gray-800/80 border border-gray-700 rounded-xl p-4 shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-orange-400 font-bold text-base">{log.liters_used}L</span>
                    <span className="text-gray-500 text-xs">({log.machine_name})</span>
                  </div>
                  <p className="text-gray-300 text-sm font-medium">By {log.given_by}</p>
                  <p className="text-gray-500 text-xs">{new Date(log.usage_date).toLocaleString()}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmDelete({ isOpen: true, id: log.id })}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors active:scale-95"
                  title="Delete Usage"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      </>
      )}
      </div>

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null })}
        onConfirm={handleDeleteUsage}
        title="Delete Usage?"
        message="Are you sure you want to delete this usage? Fuel will be returned to stock."
      />

      {modal.show && (
        <ConfirmModal
          isOpen={modal.show}
          onClose={() => setModal({show: false, message: '', isError: false})}
          onConfirm={() => {}}
          title={modal.isError ? "Error" : "Success"}
          message={modal.message}
          type={modal.isError ? "danger" : "success"}
        />
      )}

    </div>
  );
}
