"use client";

import { useState, useMemo, useEffect } from "react";
import { ArrowLeft, Search, TrendingUp, Package, Truck, Activity } from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { getOrders } from "@/lib/api";

const STATUS_STYLES = {
  "Completed":    { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30" },
  "Force_Closed": { bg: "bg-red-500/20",     text: "text-red-400",     border: "border-red-500/30" },
  "Cancelled":    { bg: "bg-red-500/20",     text: "text-red-400",     border: "border-red-500/30" },
  "Active":       { bg: "bg-orange-500/20",  text: "text-orange-400",  border: "border-orange-500/30" },
};

const TIME_RANGES = ["Today", "7D", "1M", "Year"];

const filterByRange = (data, range) => {
  const now = new Date();
  return data.filter(o => {
    const d = new Date(o.order_date);
    if (range === "Today") return o.order_date === now.toISOString().split('T')[0];
    if (range === "7D")    return (now - d) / 86400000 <= 7;
    if (range === "1M")    return (now - d) / 86400000 <= 30;
    return true;
  });
};

export default function SalesDashboardHistory({ onBack }) {
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'info', title: '', message: '' });
  const [orders, setOrders] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [activeTab, setActiveTab]   = useState("stats");
  const [timeRange, setTimeRange]   = useState("7D");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getOrders()
      .then(data => setOrders(data))
      .catch(err => setModalConfig({ isOpen: true, type: 'danger', title: 'Error', message: "Failed to fetch orders: " + err.message }))
      .finally(() => setIsLoadingData(false));
  }, []);

  const filteredByTime = useMemo(() => filterByRange(orders, timeRange), [orders, timeRange]);

  const totalRevenue      = filteredByTime.reduce((s, o) => s + Number(o.total_amount), 0);
  const totalBricks       = filteredByTime.reduce((s, o) => s + (o.order_mode === "trawli" ? o.total_qty * 2000 : o.total_qty), 0);
  const totalTrawlis      = filteredByTime.filter(o => o.order_mode === "trawli").reduce((s, o) => s + o.total_qty, 0);
  const activeOrdersCount = orders.filter(o => o.status === "Active").length;

  const leadSourceMap = filteredByTime.reduce((acc, o) => {
    const src = o.lead_source || "Direct";
    acc[src] = (acc[src] || 0) + Number(o.total_amount);
    return acc;
  }, {});
  const maxLeadVal = Math.max(...Object.values(leadSourceMap), 1);

  const revByDate = filteredByTime.reduce((acc, o) => {
    acc[o.order_date] = (acc[o.order_date] || 0) + Number(o.total_amount);
    return acc;
  }, {});
  const sortedDates = Object.keys(revByDate).sort();
  const revValues   = sortedDates.map(d => revByDate[d]);
  const maxRev      = Math.max(...revValues, 1);

  const historyData = orders.filter(o => {
    const q = searchQuery.toLowerCase();
    return o.customer_name.toLowerCase().includes(q) || (o.lead_source || "").toLowerCase().includes(q);
  });

  const KPI_CARDS = [
    { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: TrendingUp, accent: "from-orange-500 to-red-600",    glow: "shadow-orange-500/20" },
    { label: "Bricks Sold",   value: totalBricks.toLocaleString("en-IN"),         icon: Package,   accent: "from-violet-600 to-purple-700",  glow: "shadow-violet-600/20" },
    { label: "Trawlis",       value: totalTrawlis,                                 icon: Truck,     accent: "from-sky-500 to-blue-600",       glow: "shadow-sky-500/20" },
    { label: "Active Orders", value: activeOrdersCount,                            icon: Activity,  accent: "from-emerald-500 to-teal-600",   glow: "shadow-emerald-500/20" },
  ];

  return (
    <div className="min-h-[calc(100dvh-5rem)] bg-gray-900 text-white flex flex-col">
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur border-b border-gray-800">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 active:scale-95 transition-all">
            <ArrowLeft size={18} className="text-gray-300" />
          </button>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">Sales Analytics</h1>
            <p className="text-gray-500 text-xs">Revenue, trends & order history</p>
          </div>
        </div>

        <div className="flex border-t border-gray-800">
          {[{ key: "stats", label: "Insights & Stats" }, { key: "history", label: "Order History" }].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} className={`flex-1 py-3 text-sm font-semibold transition-all border-b-2 ${activeTab === t.key ? "text-orange-400 border-orange-400 bg-orange-400/10" : "text-gray-500 border-transparent hover:bg-gray-800"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        {isLoadingData ? (
          <p className="text-center text-gray-500 text-sm py-10">Loading...</p>
        ) : activeTab === "stats" ? (
          <div className="px-4 pt-4 space-y-5">
            <div className="flex gap-2 p-1 bg-gray-800/60 rounded-xl border border-gray-700">
              {TIME_RANGES.map(r => (
                <button key={r} onClick={() => setTimeRange(r)} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${timeRange === r ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30" : "text-gray-400 hover:text-white"}`}>
                  {r}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {KPI_CARDS.map(({ label, value, icon: Icon, accent, glow }) => (
                <div key={label} className={`rounded-2xl bg-gradient-to-br ${accent} shadow-lg ${glow} p-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/70 text-xs font-medium">{label}</span>
                    <div className="bg-white/20 rounded-lg p-1.5"><Icon size={14} className="text-white" /></div>
                  </div>
                  <p className="text-white font-extrabold text-xl leading-tight">{value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-gray-800/70 border border-gray-700/50 p-4">
              <h3 className="text-white font-bold text-sm mb-4">Sales by Lead Source</h3>
              {Object.keys(leadSourceMap).length === 0 ? (
                <p className="text-gray-500 text-xs text-center py-4">No data for this period.</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(leadSourceMap).sort((a, b) => b[1] - a[1]).map(([source, amt]) => (
                    <div key={source}>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-300 text-xs">{source}</span>
                        <span className="text-gray-400 text-xs font-semibold">₹{amt.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500" style={{ width: `${(amt / maxLeadVal) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-gray-800/70 border border-gray-700/50 p-4">
              <h3 className="text-white font-bold text-sm mb-4">Revenue Trend</h3>
              {sortedDates.length === 0 ? (
                <p className="text-gray-500 text-xs text-center py-4">No data for this period.</p>
              ) : (
                <div className="relative h-32">
                  <svg viewBox={`0 0 ${sortedDates.length * 40} 100`} preserveAspectRatio="none" className="w-full h-full">
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#f97316" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                    {sortedDates.length > 1 && (() => {
                      const pts = revValues.map((v, i) => `${i * 40 + 20},${100 - (v / maxRev) * 85}`);
                      const areaPath = `M${pts[0]} ${pts.slice(1).map(p => `L${p}`).join(" ")} L${(revValues.length - 1) * 40 + 20},100 L20,100 Z`;
                      const linePath = `M${pts.join(" L")}`;
                      return (
                        <>
                          <path d={areaPath} fill="url(#areaGrad)" />
                          <path d={linePath} fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          {pts.map((p, i) => {
                            const [x, y] = p.split(",");
                            return <circle key={i} cx={x} cy={y} r="3" fill="#f97316" />;
                          })}
                        </>
                      );
                    })()}
                    {sortedDates.length === 1 && <circle cx="20" cy={100 - (revValues[0] / maxRev) * 85} r="4" fill="#f97316" />}
                  </svg>
                  <div className="flex justify-between mt-1 px-1">
                    {sortedDates.map(d => <span key={d} className="text-gray-600 text-[9px]">{d.slice(5)}</span>)}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="px-4 pt-4 space-y-3">
            <div className="flex items-center gap-3 bg-gray-800/80 border border-gray-700 rounded-xl px-4 py-3">
              <Search size={16} className="text-gray-500 flex-shrink-0" />
              <input type="text" placeholder="Search customer or lead source…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 bg-transparent text-white text-sm placeholder-gray-600 focus:outline-none" />
            </div>

            {historyData.length === 0 && <p className="text-gray-500 text-sm text-center mt-10">No orders found.</p>}

            {historyData.map(order => {
              const s = STATUS_STYLES[order.status] || STATUS_STYLES["Active"];
              const dispLabel = order.order_mode === "trawli" ? "Trawlis" : "Bricks";
              const pending = Number(order.total_amount) - Number(order.paid_amount);
              return (
                <div key={order.id} className="rounded-2xl bg-gray-800/70 border border-gray-700/50 px-4 py-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-white font-bold text-sm">{order.customer_name}</p>
                      <p className="text-gray-500 text-xs">{order.order_date} · via {order.lead_source || "Direct"}</p>
                    </div>
                    <span className={`text-xs border rounded-full px-2.5 py-0.5 font-semibold whitespace-nowrap ${s.bg} ${s.text} ${s.border}`}>
                      {order.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="flex gap-4 text-xs mt-2">
                    <span className="text-gray-400">
                      Paid: <span className="text-white font-semibold">₹{Number(order.paid_amount).toLocaleString("en-IN")}</span>
                      <span className="text-gray-600">/₹{Number(order.total_amount).toLocaleString("en-IN")}</span>
                    </span>
                    <span className="text-gray-400">
                      {dispLabel}: <span className="text-white font-semibold">{order.dispatched_qty}</span>
                      <span className="text-gray-600">/{order.total_qty}</span>
                    </span>
                  </div>

                  {pending > 0 && order.status !== "Force_Closed" && order.status !== "Cancelled" && (
                    <p className="text-red-400/80 text-xs mt-1.5">Balance: ₹{pending.toLocaleString("en-IN")}</p>
                  )}
                  {(order.status === "Force_Closed" || order.status === "Cancelled") && order.close_reason && (
                    <p className="text-gray-500 text-xs italic mt-1.5">Reason: {order.close_reason}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={() => setModalConfig({ ...modalConfig, isOpen: false })}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </div>
  );
}
