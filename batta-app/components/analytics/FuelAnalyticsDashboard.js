"use client";

import { useState, useMemo, useEffect } from "react";
import { ArrowLeft, Droplets, Fuel, IndianRupee, Activity } from "lucide-react";
import { getFuelStocks, getFuelUsages } from "@/lib/api";
import TabSwitcher from "@/components/ui/TabSwitcher";

const TIME_RANGES = ["7D", "1M", "Year"];

const filterByRange = (data, range, dateKey) => {
  const now = new Date();
  return data.filter(o => {
    const d = new Date(o[dateKey]);
    if (range === "7D")   return (now - d) / 86400000 <= 7;
    if (range === "1M")   return (now - d) / 86400000 <= 30;
    return true;
  });
};

export default function FuelAnalyticsDashboard({ onBack }) {
  const [modal, setModal] = useState({show: false, message: '', isError: false});
  const [fuelStocks, setFuelStocks] = useState([]);
  const [fuelUsages, setFuelUsages] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [activeTab, setActiveTab] = useState("stats");
  const [timeRange, setTimeRange] = useState("7D");

  useEffect(() => {
    Promise.all([getFuelStocks(), getFuelUsages()])
      .then(([stocks, usages]) => {
        setFuelStocks(stocks);
        setFuelUsages(usages);
      })
      .catch(err => alert("Failed to fetch fuel data: " + err.message))
      .finally(() => setIsLoadingData(false));
  }, []);

  const filteredUsage = useMemo(() => filterByRange(fuelUsages, timeRange, "usage_date"), [fuelUsages, timeRange]);
  const filteredSlots = useMemo(() => filterByRange(fuelStocks, timeRange, "purchase_date"), [fuelStocks, timeRange]);

  const currentStock  = fuelStocks.reduce((s, o) => s + Number(o.liters_remaining), 0);
  const totalSpent    = filteredSlots.reduce((s, o) => s + Number(o.total_cost), 0);
  const totalConsumed = filteredUsage.reduce((s, o) => s + Number(o.liters_used), 0);

  const machineMap = filteredUsage.reduce((acc, o) => {
    acc[o.machine_name] = (acc[o.machine_name] || 0) + Number(o.liters_used);
    return acc;
  }, {});
  const maxMachine = Math.max(...Object.values(machineMap), 1);

  const KPI = [
    { label: "Current Stock",   value: `${currentStock}L`, icon: Droplets,    accent: "from-sky-500 to-blue-600",      glow: "shadow-sky-500/20" },
    { label: "Total Spent",     value: `₹${totalSpent.toLocaleString("en-IN")}`, icon: IndianRupee, accent: "from-orange-500 to-red-600", glow: "shadow-orange-500/20" },
    { label: "Total Consumed",  value: `${totalConsumed}L`, icon: Fuel,       accent: "from-violet-600 to-purple-700", glow: "shadow-violet-600/20" },
  ];

  return (
    <div className="min-h-[calc(100dvh-5rem)] bg-gray-900 text-white flex flex-col">
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
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur border-b border-gray-800">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 active:scale-95 transition-all">
            <ArrowLeft size={18} className="text-gray-300" />
          </button>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">Fuel Analytics</h1>
            <p className="text-gray-500 text-xs">Stock, consumption & cost tracking</p>
          </div>
        </div>
        <TabSwitcher
          tabs={[
            { key: "stats", label: "Insights & Stats" },
            { key: "history", label: "Usage History" }
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
          accentColor="blue-400"
        />
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        {isLoadingData ? (
          <p className="text-center text-gray-500 text-sm py-10">Loading...</p>
        ) : activeTab === "stats" ? (
          <div className="px-4 pt-4 space-y-5">
            <div className="flex gap-2 p-1 bg-gray-800/60 rounded-xl border border-gray-700">
              {TIME_RANGES.map(r => (
                <button key={r} onClick={() => setTimeRange(r)} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${timeRange === r ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30" : "text-gray-400 hover:text-white"}`}>
                  {r}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {KPI.map(({ label, value, icon: Icon, accent, glow }) => (
                <div key={label} className={`rounded-2xl bg-gradient-to-br ${accent} shadow-lg ${glow} p-3`}>
                  <div className="bg-white/20 rounded-lg p-1.5 w-fit mb-2"><Icon size={13} className="text-white" /></div>
                  <p className="text-white font-extrabold text-base leading-tight">{value}</p>
                  <p className="text-white/60 text-[10px] mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-gray-800/70 border border-gray-700/50 p-4">
              <h3 className="text-white font-bold text-sm mb-3">Active Fuel Slots</h3>
              <div className="space-y-3">
                {fuelStocks.filter(s => Number(s.liters_remaining) > 0).map(slot => {
                  const pct = Math.round((Number(slot.liters_remaining) / Number(slot.liters_bought)) * 100);
                  return (
                    <div key={slot.id}>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-300 text-xs">{slot.station_name}</span>
                        <span className="text-blue-400 text-xs font-semibold">{Number(slot.liters_remaining)}L / {Number(slot.liters_bought)}L</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-gray-600 text-[10px] mt-0.5">{new Date(slot.purchase_date).toLocaleDateString()} · by {slot.purchaser_name}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl bg-gray-800/70 border border-gray-700/50 p-4">
              <h3 className="text-white font-bold text-sm mb-4">Fuel Usage by Machine</h3>
              {Object.keys(machineMap).length === 0 ? (
                <p className="text-gray-500 text-xs text-center py-4">No data for this period.</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(machineMap).sort((a, b) => b[1] - a[1]).map(([machine, liters]) => (
                    <div key={machine}>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-300 text-xs">{machine}</span>
                        <span className="text-gray-400 text-xs font-semibold">{liters}L</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-500 transition-all duration-500" style={{ width: `${(liters / maxMachine) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="px-4 pt-4 space-y-3">
            {fuelUsages.length === 0 && <p className="text-gray-500 text-sm text-center mt-10">No usage records.</p>}
            {[...fuelUsages].sort((a,b) => new Date(b.usage_date) - new Date(a.usage_date)).map(log => (
              <div key={log.id} className="rounded-2xl bg-gray-800/70 border border-gray-700/50 px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold text-sm">{log.machine_name}</p>
                  <p className="text-gray-500 text-xs">{new Date(log.usage_date).toLocaleString()} · by {log.given_by}</p>
                </div>
                <div className="text-right">
                  <p className="text-blue-400 font-bold text-base">{Number(log.liters_used)}L</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
