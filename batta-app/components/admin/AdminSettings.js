"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, X, Plus, Trash2 } from "lucide-react";
import { getAllSettings, updateSettings, getSettings } from "@/lib/api";

const CATEGORIES = [
  { key: "gas_stations", label: "Gas Stations" },
  { key: "machines", label: "Machines" },
  { key: "lead_sources", label: "Lead Sources" },
  { key: "brick_categories", label: "Brick Categories" },
  { key: "salespersons", label: "Salespersons" },
  { key: "drivers", label: "Drivers" },
];

export default function AdminSettings({ onClose }) {
  const [modal, setModal] = useState({show: false, message: '', isError: false});
  const [settings, setSettings] = useState({});
  const [inputs, setInputs] = useState({});
  const [priceInput, setPriceInput] = useState("");
  const [pricingHistory, setPricingHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const data = await getAllSettings();
      const settingsMap = {};
      data.forEach((s) => {
        settingsMap[s.category] = s.values;
      });
      // Ensure all categories exist
      CATEGORIES.forEach((c) => {
        if (!settingsMap[c.key]) settingsMap[c.key] = [];
      });
      
      // Fetch pricing
      try {
        const pricingData = await getSettings("pricing");
        setPriceInput(pricingData.values?.price_per_trawli || "");
        const historyData = await getSettings("pricing_history");
        setPricingHistory(Array.isArray(historyData.values) ? historyData.values : []);
      } catch (e) {
        console.error("Failed to load pricing", e);
      }

      setSettings(settingsMap);
    } catch (error) {
      console.error("Failed to load settings", error);
      alert("Failed to load settings: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (isoStr) => {
    const d = new Date(isoStr);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleUpdatePrice = async () => {
    try {
      const val = Number(priceInput);
      await updateSettings("pricing", { price_per_trawli: val });
      alert("Price updated successfully!");
      const historyData = await getSettings("pricing_history");
      setPricingHistory(Array.isArray(historyData.values) ? historyData.values : []);
    } catch (err) {
      alert("Failed to update price: " + err.message);
    }
  };

  const handleAdd = async (category) => {
    const val = (inputs[category] || "").trim();
    if (!val) return;

    const currentValues = settings[category] || [];
    if (currentValues.includes(val)) {
      alert("Value already exists!");
      return;
    }

    const newValues = [...currentValues, val];
    setSettings((prev) => ({ ...prev, [category]: newValues }));
    setInputs((prev) => ({ ...prev, [category]: "" }));

    try {
      await updateSettings(category, newValues);
    } catch (err) {
      console.error("Update failed", err);
      // revert on failure
      setSettings((prev) => ({ ...prev, [category]: currentValues }));
      alert("Failed to save setting: " + err.message);
    }
  };

  const handleDelete = async (category, valueToRemove) => {
    const currentValues = settings[category] || [];
    const newValues = currentValues.filter((v) => v !== valueToRemove);
    setSettings((prev) => ({ ...prev, [category]: newValues }));

    try {
      await updateSettings(category, newValues);
    } catch (err) {
      console.error("Update failed", err);
      // revert on failure
      setSettings((prev) => ({ ...prev, [category]: currentValues }));
      alert("Failed to delete setting: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-900 text-white">
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
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800 bg-gray-900/95 backdrop-blur">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 -ml-2 rounded-xl bg-gray-800 hover:bg-gray-700 active:scale-95 transition-all text-gray-300">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <p className="text-gray-400 text-xs mt-0.5">Manage dropdown options</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 active:scale-95 transition-all text-gray-300"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* PRICING Section */}
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4">
              <h2 className="text-sm font-bold text-gray-200 mb-3 uppercase tracking-wider">Pricing</h2>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-gray-400">₹</span>
                  <input
                    type="number"
                    placeholder="Price per Trawli"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-7 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={handleUpdatePrice}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1 transition-all active:scale-95"
                >
                  Save
                </button>
              </div>
              {pricingHistory.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-700">
                  <p className="text-gray-400 text-xs font-semibold mb-2">History (Last 5)</p>
                  <ul className="space-y-1">
                    {[...pricingHistory]
                      .sort((a, b) => new Date(b.changed_at) - new Date(a.changed_at))
                      .slice(0, 5)
                      .map((h, i) => (
                        <li key={i} className="text-gray-300 text-xs">
                          ₹{h.price} &mdash; {formatDate(h.changed_at)}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>

            {CATEGORIES.map((cat) => {
            const values = settings[cat.key] || [];
            return (
              <div key={cat.key} className="bg-gray-800 border border-gray-700 rounded-2xl p-4">
                <h2 className="text-sm font-bold text-gray-200 mb-3 uppercase tracking-wider">{cat.label}</h2>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {values.length === 0 ? (
                    <span className="text-gray-500 text-xs italic">No items added.</span>
                  ) : (
                    values.map((v) => (
                      <div
                        key={v}
                        className="flex items-center gap-1.5 bg-gray-700 text-gray-200 text-sm px-3 py-1.5 rounded-lg border border-gray-600"
                      >
                        <span>{v}</span>
                        <button
                          onClick={() => handleDelete(cat.key, v)}
                          className="text-red-400 hover:text-red-300 transition-colors ml-1 p-0.5"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={`Add new ${cat.label.toLowerCase()}...`}
                    value={inputs[cat.key] || ""}
                    onChange={(e) => setInputs((prev) => ({ ...prev, [cat.key]: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd(cat.key)}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => handleAdd(cat.key)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1 transition-all active:scale-95"
                  >
                    <Plus size={16} /> Add
                  </button>
                </div>
              </div>
            );
          })
          }
          </>
        )}
      </div>
    </div>
  );
}
