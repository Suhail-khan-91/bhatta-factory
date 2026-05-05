"use client";

import { useState, useEffect } from "react";
import { Truck, PlusCircle, LayoutDashboard, BarChart3, ChevronRight, TrendingUp, Users, Package, History, CheckCircle2, Search, ArrowLeft, IndianRupee, Trash2, Clock } from "lucide-react";
import OrderBricksForm from "@/components/sales/OrderBricksForm";
import DispatchManager from "@/components/sales/DispatchManager";
import SalesDashboardHistory from "@/components/sales/SalesDashboardHistory";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { getOrders, getDispatches, deleteDispatch, getSettings } from "@/lib/api";

const SALES_ACTIONS = [
  {
    id: "order-bricks",
    label: "1. Order Bricks",
    description: "Create a new sale order — customer, quantity, price & payment status",
    icon: PlusCircle,
    accent: "from-orange-500 to-red-600",
    glow: "shadow-orange-500/25",
    highlights: [
      { icon: Package,    text: "Trawli & brick qty" },
      { icon: Users,      text: "Customer details" },
      { icon: TrendingUp, text: "Udhaar tracking" },
    ],
  },
  {
    id: "dispatch-payments",
    label: "2. Dispatch & Payments",
    description: "Manage active orders — log dispatches & record incoming payments",
    icon: Truck,
    accent: "from-violet-600 to-purple-700",
    glow: "shadow-violet-600/25",
    highlights: [
      { icon: Truck,          text: "Log dispatches" },
      { icon: TrendingUp,     text: "Record payments" },
      { icon: Package,        text: "Pending orders" },
    ],
  },
  {
    id: "sales-dashboard",
    label: "3. Sales Dashboard & History",
    description: "Leaderboard, revenue totals, pricing analytics & time-range filters",
    icon: BarChart3,
    accent: "from-rose-500 to-pink-600",
    glow: "shadow-rose-500/25",
    highlights: [
      { icon: TrendingUp,     text: "Revenue & totals" },
      { icon: Users,          text: "Sales leaderboard" },
      { icon: LayoutDashboard, text: "Price analytics" },
    ],
  },
];

export default function SalesPage() {
  const [currentView, setCurrentView] = useState("menu"); // menu, order-bricks, dispatch-payments, dashboard-history
  const [pricePerTrawli, setPricePerTrawli] = useState(14000);

  useEffect(() => {
    getSettings("pricing")
      .then(res => {
        if (res?.values?.price_per_trawli) {
          setPricePerTrawli(res.values.price_per_trawli);
        }
      })
      .catch(console.error);
  }, []);

  if (currentView === "menu") {
    return (
      <div className="min-h-[calc(100dvh-5rem)] bg-gray-900 text-white flex flex-col">
        {/* Header */}
        <div className="px-5 pt-6 pb-2">
          <div className="flex items-center gap-2 mb-1">
            <Truck size={20} className="text-orange-400" />
            <h1 className="text-2xl font-bold tracking-tight">Sales</h1>
          </div>
          <p className="text-gray-400 text-sm">Brick dispatch, revenue & customer records</p>
        </div>

        {/* Action Cards */}
        <div className="flex-1 px-4 py-4 space-y-4">
          {SALES_ACTIONS.map(({ id, label, description, icon: Icon, accent, glow, highlights }) => (
            <button
              key={id}
              onClick={() => setCurrentView(id === "sales-dashboard" ? "dashboard-history" : id)}
              className={`
                w-full text-left rounded-2xl overflow-hidden
                bg-gradient-to-br ${accent}
                shadow-xl ${glow}
                active:scale-[0.98] transition-all duration-150
              `}
            >
              <div className="px-5 pt-5 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 rounded-xl p-2.5">
                      <Icon size={22} className="text-white" />
                    </div>
                    <p className="text-white font-bold text-lg leading-tight">{label}</p>
                  </div>
                  <ChevronRight size={20} className="text-white/60 mt-1 flex-shrink-0" />
                </div>
                <p className="text-white/70 text-sm mt-3 leading-snug">{description}</p>
              </div>
              <div className="bg-black/20 px-5 py-3 flex items-center gap-3 flex-wrap">
                {highlights.map(({ icon: HIcon, text }) => (
                  <div key={text} className="flex items-center gap-1.5">
                    <HIcon size={12} className="text-white/60" />
                    <span className="text-white/60 text-xs">{text}</span>
                  </div>
                ))}
              </div>
            </button>
          ))}

          {/* Quick-reference note */}
          <div className="rounded-2xl bg-gray-800/60 border border-gray-700/60 px-5 py-4">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Default Pricing</p>
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Price per Trawli</span>
              <span className="text-white font-bold text-base">₹{Number(pricePerTrawli).toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === "order-bricks") {
    return <OrderBricksForm onBack={() => setCurrentView("menu")} />;
  }

  if (currentView === "dashboard-history") {
    return <SalesDashboardHistory onBack={() => setCurrentView("menu")} />;
  }

  // If currentView is dispatch-payments, render the 3-tab layout logic
  return <DispatchPaymentsView onBack={() => setCurrentView("menu")} />;
}

// Sub-component for the refactored 3-tab Dispatch view
function DispatchPaymentsView({ onBack }) {
  const [view, setView] = useState("active"); // active, completed, history
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'info', title: '', message: '', id: null, action: null });
  
  const [orders, setOrders] = useState([]);
  const [dispatches, setDispatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [ordersData, dispatchesData] = await Promise.all([
        getOrders(),
        getDispatches()
      ]);
      setOrders(ordersData);
      setDispatches(dispatchesData);
    } catch (err) {
      setModalConfig({ isOpen: true, type: 'danger', title: 'Error', message: 'Failed to load data: ' + err.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteDispatch = async (id) => {
    try {
      await deleteDispatch(id);
      setModalConfig({ isOpen: true, type: 'success', title: 'Deleted', message: 'Dispatch record deleted!' });
      fetchData();
    } catch (err) {
      setModalConfig({ isOpen: true, type: 'danger', title: 'Error', message: 'Failed to delete: ' + err.message });
    }
  };

  const onModalConfirm = () => {
    if (modalConfig.action === 'delete_dispatch') {
      handleDeleteDispatch(modalConfig.id);
    }
    setModalConfig({ ...modalConfig, isOpen: false });
  };

  if (selectedOrder) {
    return (
      <DispatchManager 
        orderToManage={selectedOrder} 
        onBack={() => { setSelectedOrder(null); fetchData(); }} 
      />
    );
  }

  const filteredOrders = orders.filter(o => {
    const isStatusMatch = view === "active" ? o.status === "Active" : (o.status === "Completed" || o.status === "Force_Closed" || o.status === "Cancelled");
    if (!searchQuery) return isStatusMatch;
    return isStatusMatch && o.customer_name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-[calc(100dvh-5rem)] bg-gray-900 text-white flex flex-col">
      {/* Top Header with Back Button */}
      <div className="sticky top-0 z-30 bg-gray-900 px-4 py-3 flex items-center gap-3 border-b border-gray-800">
        <button onClick={onBack} className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 active:scale-95 transition-all">
          <ArrowLeft size={18} className="text-gray-300" />
        </button>
        <div>
          <h1 className="text-white font-bold text-lg leading-tight">Dispatch & Payments</h1>
          <p className="text-gray-500 text-xs">Manage active & completed orders</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-[53px] z-20 bg-gray-900 border-b border-gray-800">
        <div className="flex p-1 gap-1">
          {[
            { id: "active", label: "Active Orders", icon: Package },
            { id: "completed", label: "Completed", icon: CheckCircle2 },
            { id: "history", label: "History", icon: History },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setView(tab.id); setSearchQuery(""); }}
              className={`
                flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all
                ${view === tab.id 
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20" 
                  : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/50"}
              `}
            >
              <tab.icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.id === 'active' ? 'Active' : tab.id === 'completed' ? 'Done' : 'History'}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Search Bar */}
        <div className="px-4 pt-4">
          <div className="flex items-center gap-3 bg-gray-800/80 border border-gray-700 rounded-xl px-4 py-2.5">
            <Search size={16} className="text-gray-500 flex-shrink-0" />
            <input 
              type="text" 
              placeholder={view === 'history' ? "Search drivers..." : "Search customers..."}
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="flex-1 bg-transparent text-white text-sm placeholder-gray-600 focus:outline-none" 
            />
          </div>
        </div>

        {view === "active" && (
          <div className="px-4 py-4 space-y-4">
            <h2 className="text-lg font-bold">Active Orders</h2>
            <OrderList orders={filteredOrders} isLoading={isLoading} onManage={setSelectedOrder} />
          </div>
        )}

        {view === "completed" && (
          <div className="px-4 py-4 space-y-4">
            <h2 className="text-lg font-bold">Completed & History</h2>
            <OrderList orders={filteredOrders} isLoading={isLoading} onManage={setSelectedOrder} />
          </div>
        )}

        {view === "history" && (
          <div className="px-4 py-4 space-y-4">
            <h2 className="text-lg font-bold">Recent Dispatches</h2>
            <DispatchHistoryList 
              dispatches={dispatches.filter(d => d.driver_name.toLowerCase().includes(searchQuery.toLowerCase()))} 
              isLoading={isLoading} 
              onDelete={(id) => setModalConfig({ isOpen: true, type: 'danger', title: 'Delete Dispatch?', message: 'Return bricks to pending order?', id, action: 'delete_dispatch' })} 
            />
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={onModalConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </div>
  );
}

function OrderList({ orders, isLoading, onManage }) {
  if (isLoading) return <p className="text-center text-gray-500 py-10 text-sm">Loading orders...</p>;
  if (orders.length === 0) return <p className="text-center text-gray-500 py-10 text-sm">No orders found.</p>;

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const pending = Number(order.total_amount) - Number(order.paid_amount);
        const isTrawli = order.order_mode === "trawli";
        const remaining = order.total_qty - order.dispatched_qty;
        const labelText = isTrawli ? "Trawlis" : "Bricks";

        return (
          <div key={order.id} className="rounded-2xl bg-gray-800/70 border border-gray-700/50 overflow-hidden shadow-sm">
            <div className="px-4 pt-4 pb-3">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-white font-bold text-base">{order.customer_name}</h2>
                <span className={`text-[10px] border rounded-full px-2 py-0.5 font-bold uppercase tracking-wider ${
                  order.status === 'Active' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
                  order.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                  'bg-gray-500/10 text-gray-400 border-gray-500/20'
                }`}>
                  {order.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-gray-500 text-xs mb-4">{order.customer_address} · ORD-{order.id}</p>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-gray-900/60 rounded-xl px-3 py-2.5">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Truck size={12} className={remaining === 0 ? "text-emerald-400" : "text-orange-400"} />
                    <span className="text-gray-500 text-[10px] uppercase font-bold tracking-tight">{labelText}</span>
                  </div>
                  <p className="text-white font-bold text-sm">
                    {order.dispatched_qty}<span className="text-gray-600 font-normal">/{order.total_qty}</span>
                  </p>
                  <p className={`text-[10px] mt-0.5 ${remaining > 0 ? 'text-orange-400/80' : 'text-emerald-400/80'}`}>
                    {remaining > 0 ? `${remaining} remaining` : 'Finished'}
                  </p>
                </div>
                <div className="bg-gray-900/60 rounded-xl px-3 py-2.5">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <IndianRupee size={12} className={pending <= 0 ? "text-emerald-400" : "text-red-400"} />
                    <span className="text-gray-500 text-[10px] uppercase font-bold tracking-tight">Payment</span>
                  </div>
                  <p className="text-white font-bold text-sm">
                    ₹{Number(order.paid_amount).toLocaleString()}<span className="text-gray-600 font-normal">/₹{Number(order.total_amount).toLocaleString()}</span>
                  </p>
                  {pending > 0 && <p className="text-red-400/80 text-[10px] mt-0.5">₹{pending.toLocaleString()} due</p>}
                </div>
              </div>
            </div>

            <button 
              onClick={() => onManage(order)} 
              className={`w-full flex items-center justify-between px-4 py-3 border-t text-sm font-bold transition-all active:scale-[0.98] ${
                order.status === 'Active' 
                ? 'bg-violet-600/10 border-violet-600/20 text-violet-400' 
                : 'bg-gray-800 border-gray-700 text-gray-500'
              }`}
            >
              <span>{order.status === 'Active' ? 'Manage Order' : 'View Details'}</span>
              <ChevronRight size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function DispatchHistoryList({ dispatches, isLoading, onDelete }) {
  if (isLoading) return <p className="text-center text-gray-500 py-10 text-sm">Loading history...</p>;
  if (dispatches.length === 0) return <p className="text-center text-gray-500 py-10 text-sm">No dispatches found.</p>;

  return (
    <div className="space-y-3">
      {dispatches.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).map((d) => (
        <div key={d.id} className="flex items-center justify-between bg-gray-800/80 border border-gray-700 rounded-2xl p-4 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-violet-400 font-bold text-lg">{d.qty_dispatched.toLocaleString()}</span>
              <span className="text-gray-500 text-xs">qty · {d.driver_name}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-[10px]">
              <Clock size={12} />
              <span>{new Date(d.timestamp).toLocaleString()}</span>
            </div>
          </div>
          <button
            onClick={() => onDelete(d.id)}
            className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all active:scale-95"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}
