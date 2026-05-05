"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Fuel, Upload, X, CheckCircle2, ChevronDown, Trash2 } from "lucide-react";
import { createFuelStock, getSettings, getFuelStocks, deleteFuelStock } from "@/lib/api";
import ConfirmModal from "../ui/ConfirmModal";

const STATIONS  = ["Petrol Pump 1", "Petrol Pump 2", "Petrol Pump 3"];
const PURCHASERS = ["Master", "Pardhan", "Uncle"];

// ── Reusable Combobox ─────────────────────────────────────────────────────────
function Combobox({ id, value, onChange, options, placeholder }) {
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

  return (
    <div ref={containerRef} className="relative">
      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        className="
          w-full bg-gray-800 border border-gray-700 rounded-xl
          pl-4 pr-10 py-3 text-white text-base
          focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
          transition-all appearance-none
        "
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
        <ul className="
          absolute left-0 right-0 top-[calc(100%+4px)] z-50
          bg-gray-800 border border-gray-700 rounded-xl
          overflow-hidden shadow-xl shadow-black/40
        ">
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
                    ? "bg-blue-500/20 text-blue-300 font-medium"
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
export default function FuelInputForm({ onBack }) {
  const [activeTab, setActiveTab] = useState('form');
  const [modal, setModal] = useState({show: false, message: '', isError: false});
  const [stations, setStations] = useState([]);
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });
  
  const fetchRecent = async () => {
    try {
      const res = await getFuelStocks();
      setRecentPurchases(res || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getSettings("gas_stations")
      .then(res => setStations(res.values || []))
      .catch(console.error);
    fetchRecent();
  }, []);

  const [form, setForm] = useState({
    liters_bought: "",
    station_name: "",
    purchaser_name: "Master",
    total_cost: "",
    purchase_date: new Date().toISOString().slice(0, 10),
    receipt_image: null,
  });
  const [preview, setPreview] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileRef = useRef(null);

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, receipt_image: file }));
    setPreview(URL.createObjectURL(file));
  };

  const removeFile = () => {
    setForm((prev) => ({ ...prev, receipt_image: null }));
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const validate = () => {
    const errs = {};
    if (!form.liters_bought || isNaN(form.liters_bought) || Number(form.liters_bought) <= 0)
      errs.liters_bought = "Enter a valid amount";
    if (!form.station_name.trim())
      errs.station_name = "Required";
    if (!form.purchaser_name.trim())
      errs.purchaser_name = "Required";
    if (!form.total_cost || isNaN(form.total_cost) || Number(form.total_cost) <= 0)
      errs.total_cost = "Enter a valid amount";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const now = new Date();
    const [year, month, day] = form.purchase_date.split("-").map(Number);
    const payload = {
      liters_bought:    Number(form.liters_bought),
      liters_remaining: Number(form.liters_bought),
      station_name:     form.station_name.trim(),
      purchaser_name:   form.purchaser_name.trim(),
      total_cost:       Number(form.total_cost),
      purchase_date:    new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds()).toISOString(),
      receipt_image_url: null,
    };

    try {
      setIsLoading(true);
      await createFuelStock(payload);
      setSubmitted(true);
      setModal({show: true, message: "Fuel entry logged successfully!", isError: false});
      fetchRecent();
      setTimeout(() => { setSubmitted(false); onBack(); }, 1500);
    } catch (err) {
      console.error(err);
      setModal({show: true, message: "Failed to log fuel: " + err.message, isError: true});
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStock = async () => {
    const id = confirmDelete.id;
    if (!id) return;
    try {
      setIsLoading(true);
      await deleteFuelStock(id);
      setConfirmDelete({ isOpen: false, id: null });
      await fetchRecent();
    } catch (err) {
      setModal({show: true, message: err.message, isError: true});
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = (field) =>
    `w-full bg-gray-800 border rounded-xl px-4 py-3 text-white text-base
     placeholder-gray-500 focus:outline-none focus:ring-2 transition-all
     ${errors[field]
       ? "border-red-500 focus:ring-red-500/40"
       : "border-gray-700 focus:ring-blue-500/40 focus:border-blue-500"}`;

  const labelCls = "block text-gray-400 text-xs font-medium uppercase tracking-wider mb-1.5";

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
        <CheckCircle2 size={64} className="text-green-400 animate-bounce" />
        <p className="text-white text-xl font-semibold">Fuel entry logged!</p>
        <p className="text-gray-400 text-sm">Returning to menu…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">

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
            <Fuel size={20} className="text-blue-400" />
            <h1 className="text-lg font-semibold">Fuel Input</h1>
          </div>
        </div>
        <div className="flex">
          <button 
            onClick={() => setActiveTab('form')} 
            className={`flex-1 py-3 text-sm font-semibold transition-all border-b-2 ${activeTab === 'form' ? 'text-blue-400 border-blue-400 bg-blue-400/10' : 'text-gray-500 border-transparent hover:bg-gray-800'}`}
          >
            Log Purchase
          </button>
          <button 
            onClick={() => setActiveTab('history')} 
            className={`flex-1 py-3 text-sm font-semibold transition-all border-b-2 ${activeTab === 'history' ? 'text-blue-400 border-blue-400 bg-blue-400/10' : 'text-gray-500 border-transparent hover:bg-gray-800'}`}
          >
            Recent Purchases
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
      {activeTab === 'form' && (
      <>
      {/* ── Form ── */}
      <form onSubmit={handleSubmit} className="px-4 py-5 space-y-5">

        {/* Liters Bought */}
        <div>
          <label className={labelCls}>Liters Bought</label>
          <input
            type="number"
            inputMode="decimal"
            placeholder="e.g. 50"
            value={form.liters_bought}
            onChange={(e) => set("liters_bought", e.target.value)}
            className={inputCls("liters_bought")}
          />
          {errors.liters_bought && (
            <p className="text-red-400 text-xs mt-1">{errors.liters_bought}</p>
          )}
        </div>

        {/* Gas Station Name */}
        <div>
          <label className={labelCls}>Gas Station Name</label>
          <Combobox
            id="station_name"
            value={form.station_name}
            onChange={(val) => set("station_name", val)}
            options={stations}
            placeholder="Select or type a station name"
          />
          {errors.station_name && (
            <p className="text-red-400 text-xs mt-1">{errors.station_name}</p>
          )}
        </div>

        {/* Purchaser Name */}
        <div>
          <label className={labelCls}>Purchaser Name</label>
          <Combobox
            id="purchaser_name"
            value={form.purchaser_name}
            onChange={(val) => set("purchaser_name", val)}
            options={PURCHASERS}
            placeholder="Select or type a name"
          />
          {errors.purchaser_name && (
            <p className="text-red-400 text-xs mt-1">{errors.purchaser_name}</p>
          )}
        </div>

        {/* Total Cost */}
        <div>
          <label className={labelCls}>Total Cost (₹)</label>
          <input
            type="number"
            inputMode="decimal"
            placeholder="e.g. 4500"
            value={form.total_cost}
            onChange={(e) => set("total_cost", e.target.value)}
            className={inputCls("total_cost")}
          />
          {errors.total_cost && (
            <p className="text-red-400 text-xs mt-1">{errors.total_cost}</p>
          )}
        </div>

        {/* Purchase Date */}
        <div>
          <label className={labelCls}>
            Purchase Date{" "}
            <span className="normal-case text-gray-500">(time auto-captured on submit)</span>
          </label>
          <input
            type="date"
            value={form.purchase_date}
            onChange={(e) => set("purchase_date", e.target.value)}
            className={`${inputCls("purchase_date")} [color-scheme:dark]`}
          />
        </div>

        {/* Receipt Photo Upload */}
        <div>
          <label className={labelCls}>Receipt / Bill Photo (Optional)</label>

          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Receipt preview"
                className="w-full max-h-48 object-cover rounded-xl border border-gray-700"
              />
              <button
                type="button"
                onClick={removeFile}
                className="absolute top-2 right-2 bg-gray-900/80 rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X size={16} />
              </button>
              <p className="text-gray-500 text-xs mt-1 truncate">{form.receipt_image?.name}</p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="
                w-full border-2 border-dashed border-gray-700 rounded-xl py-8
                flex flex-col items-center gap-2 text-gray-500
                hover:border-blue-500 hover:text-blue-400 transition-all active:scale-99
              "
            >
              <Upload size={24} />
              <span className="text-sm">Tap to attach photo</span>
            </button>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="
            w-full py-4 rounded-2xl disabled:opacity-50
            bg-blue-600 hover:bg-blue-500 active:scale-95
            text-white font-semibold text-lg
            transition-all shadow-lg shadow-blue-600/30
            flex items-center justify-center gap-2
          "
        >
          {isLoading ? "Saving..." : <><Fuel size={20} />Log Fuel Purchase</>}
        </button>

        <div className="h-2" />
      </form>
      </>
      )}

      {activeTab === 'history' && (
      <>
      {/* ── Recent Purchases ── */}
      <div className="px-4 py-5">
        <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Recent Purchases</h2>
        <div className="space-y-3">
          {recentPurchases.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4 bg-gray-800/50 rounded-xl border border-gray-700/50">No recent purchases found.</p>
          ) : (
            [...recentPurchases].sort((a, b) => new Date(b.purchase_date) - new Date(a.purchase_date)).slice(0, 5).map((stock) => (
              <div key={stock.id} className="flex items-center justify-between bg-gray-800/80 border border-gray-700 rounded-xl p-4 shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-blue-400 font-bold text-base">{stock.liters_bought}L</span>
                    <span className="text-gray-500 text-xs">({stock.liters_remaining}L remaining)</span>
                  </div>
                  <p className="text-gray-300 text-sm font-medium">{stock.station_name}</p>
                  <p className="text-gray-500 text-xs">{new Date(stock.purchase_date).toLocaleDateString()} · by {stock.purchaser_name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmDelete({ isOpen: true, id: stock.id })}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors active:scale-95"
                  title="Delete Purchase"
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
        onConfirm={handleDeleteStock}
        title="Delete Purchase?"
        message="Are you sure you want to delete this fuel purchase? This cannot be undone."
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
