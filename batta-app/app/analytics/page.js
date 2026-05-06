"use client";

import React, { useState, useEffect } from "react";
import { getFuelSummary, getDailyProductions, getEmployees, getOrders, getPayrollLedger } from "../../lib/api";
import FuelAnalyticsDashboard from "../../components/analytics/FuelAnalyticsDashboard";
import ProductionAnalyticsDashboard from "../../components/analytics/ProductionAnalyticsDashboard";
import HistoryStatsDashboard from "../../components/payroll/HistoryStatsDashboard";
import SalesDashboardHistory from "../../components/sales/SalesDashboardHistory";
import { Fuel, Pickaxe, IndianRupee, TrendingUp, Zap, ChevronRight, LayoutDashboard, Layers, Wallet, ShoppingCart } from "lucide-react";

export default function AnalyticsDashboard() {
  const [currentView, setCurrentView] = useState('menu');
  const [data, setData] = useState({
    total_revenue: 0,
    total_payroll: 0,
    total_fuel_cost: 0,
    net_profit: 0,
    top_drivers: []
  });
  const [loading, setLoading] = useState(true);
  const isLoading = loading;

  const [fuelStats, setFuelStats] = useState({ current_stock: 0, total_consumed: 0 });
  const [bricksStats, setBricksStats] = useState({ today: 0, week: 0, month: 0 });
  const [payrollStats, setPayrollStats] = useState({ total_paid: 0, total_advances: 0, total_pending: 0 });
  const [salesStats, setSalesStats] = useState({ total_revenue: 0, total_orders: 0, active_orders: 0 });

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      try {
        const [fuelRes, prodRes, empRes, ordersRes] = await Promise.allSettled([
          getFuelSummary().catch(() => ({})),
          getDailyProductions().catch(() => []),
          getEmployees().catch(() => []),
          getOrders().catch(() => [])
        ]);

        // 1. Fuel (Using the working summary route)
        if (fuelRes.status === 'fulfilled' && fuelRes.value) {
          setFuelStats({
            current_stock: fuelRes.value.current_stock || 0,
            total_consumed: fuelRes.value.total_consumed || 0
          });
        }

        // 2. Bricks (Summing raw production data)
        if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value)) {
          const totalBricks = prodRes.value.reduce((sum, item) => sum + (item.bricks_count || 0), 0);
          setBricksStats({ today: totalBricks, week: totalBricks, month: totalBricks }); 
        }

        // 3. Payroll (Summing from employee data & ledgers)
        if (empRes.status === 'fulfilled' && Array.isArray(empRes.value)) {
          const ledgerPromises = empRes.value.map(emp => getPayrollLedger(emp.id).catch(() => []));
          const allLedgers = await Promise.all(ledgerPromises);
          
          let totalPaid = 0;
          let totalAdvances = 0;
          let totalPending = 0;
          
          allLedgers.forEach(empLedger => {
            if (Array.isArray(empLedger)) {
              totalPaid += empLedger.reduce((sum, l) => sum + Number(l.amount || 0), 0);
              totalAdvances += empLedger.filter(l => l.transaction_type === "ADVANCE_GIVEN").reduce((sum, l) => sum + Number(l.amount || 0), 0);
              totalPending += empLedger.filter(l => l.transaction_type === "SALARY" && Number(l.due_created) > 0).reduce((sum, l) => sum + Number(l.due_created || 0), 0);
            }
          });

          setPayrollStats({ total_paid: totalPaid, total_advances: totalAdvances, total_pending: totalPending });
        }

        // 4. Sales & God Mode (Summing from orders data)
        if (ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value)) {
          const revenue = ordersRes.value.reduce((sum, order) => sum + Number(order.paid_amount || 0), 0);
          const active = ordersRes.value.filter(o => o.status === 'Pending' || o.status === 'Active').length;
          
          setSalesStats({ total_revenue: revenue, total_orders: ordersRes.value.length, active_orders: active });
          
          // Set God Mode Data
          setData({ total_revenue: revenue, net_profit: revenue - (Number(fuelRes.value?.total_consumed || 0) * 80) }); // basic profit est
        }
      } catch (error) {
        console.error("Dashboard calculation error:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  const formatK = (num) => {
    if (!num) return "0";
    if (num >= 100000) return (num / 100000).toFixed(1) + 'L';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  const ANALYTICS_CARDS = [
    {
      id: "fuel",
      label: "Fuel Analytics",
      description: "Current slot progress, machine usage breakdown & historical slots",
      icon: Fuel,
      accent: "from-blue-600 to-cyan-600",
      glow: "shadow-blue-600/25",
      tag: "Live Data",
      tagColor: "bg-blue-500/20 text-blue-300",
      stats: [
        { label: "Current Slot", value: isLoading ? "—" : `${fuelStats?.current_stock || 0}L` },
        { label: "Used", value: isLoading ? "—" : `${fuelStats?.total_consumed || 0}L` },
        { label: "Remaining", value: isLoading ? "—" : `${fuelStats?.current_stock || 0}L` },
      ],
    },
    {
      id: "production",
      label: "Bricks Production Analytics",
      description: "Daily & cumulative brick counts per team with date range filters",
      icon: Layers,
      accent: "from-amber-700 to-orange-900",
      glow: "shadow-amber-700/25",
      tag: "Bricks Count",
      tagColor: "bg-emerald-500/20 text-emerald-300",
      stats: [
        { label: "Today", value: isLoading ? "—" : formatK(bricksStats?.today || 0) },
        { label: "This Week", value: isLoading ? "—" : formatK(bricksStats?.week || 0) },
        { label: "This Month", value: isLoading ? "—" : formatK(bricksStats?.month || 0) },
      ],
    },
    {
      id: "payroll",
      label: "Payroll Analytics",
      description: "Salary history, advances, pending dues & extra work payouts",
      icon: Wallet,
      accent: "from-emerald-600 to-teal-700",
      glow: "shadow-emerald-600/25",
      tag: "Payroll",
      tagColor: "bg-amber-500/20 text-amber-300",
      stats: [
        { label: "Paid", value: isLoading ? "—" : `₹${formatK(payrollStats?.total_paid || 0)}` },
        { label: "Advances", value: isLoading ? "—" : `₹${formatK(payrollStats?.total_advances || 0)}` },
        { label: "Pending", value: isLoading ? "—" : `₹${formatK(payrollStats?.total_pending || 0)}` },
      ],
    },
    {
      id: "sales",
      label: "Sales Analytics",
      description: "Revenue totals, order history, lead sources & dispatch tracking",
      icon: ShoppingCart,
      accent: "from-rose-500 to-pink-600",
      glow: "shadow-rose-500/25",
      tag: "Sales",
      tagColor: "bg-rose-500/20 text-rose-300",
      stats: [
        { label: "Revenue", value: isLoading ? "—" : `₹${formatK(salesStats?.total_revenue || 0)}` },
        { label: "Orders", value: isLoading ? "—" : (salesStats?.total_orders || 0) },
        { label: "Active", value: isLoading ? "—" : (salesStats?.active_orders || 0) },
      ],
    },
    {
      id: "god_mode",
      label: "Factory God Mode ⚡",
      description: "High-level financial overview",
      icon: Zap,
      accent: "from-violet-600 to-indigo-900",
      glow: "shadow-violet-600/25",
      tag: "Financials",
      tagColor: "bg-violet-500/20 text-violet-300",
      stats: [
        { label: "Revenue", value: isLoading ? "—" : `₹${formatK(data?.total_revenue || 0)}` },
        { label: "Profit", value: isLoading ? "—" : `₹${formatK(data?.net_profit || 0)}` },
      ],
    },
  ];

  if (currentView === 'menu') {
    return (
      <div className="min-h-[calc(100dvh-5rem)] bg-gray-900 text-white flex flex-col">
        {/* Header */}
        <div className="px-5 pt-6 pb-2">
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard size={20} className="text-indigo-400" />
            <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          </div>
          <p className="text-gray-400 text-sm">Factory insights & God Mode financial overview</p>
        </div>

        {/* Action Cards */}
        <div className="flex-1 px-4 py-4 space-y-4">
          {ANALYTICS_CARDS.map(({ id, label, description, icon: Icon, accent, glow, tag, tagColor, stats }) => (
            <button
              key={id}
              onClick={() => setCurrentView(id)}
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
                    <div>
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${tagColor}`}>
                        {tag}
                      </span>
                      <p className="text-white font-bold text-lg leading-tight mt-1">{label}</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-white/60 mt-1 flex-shrink-0" />
                </div>
                <p className="text-white/70 text-sm mt-3 leading-snug">{description}</p>
              </div>
              <div className="bg-black/20 px-5 py-3 grid grid-cols-3 gap-2">
                {stats.map((stat, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="text-white/50 text-[10px] uppercase font-bold tracking-wider">{stat.label}</span>
                    <span className="text-white font-bold text-sm">{stat.value}</span>
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (currentView === 'god_mode') {
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-[calc(100dvh-5rem)] bg-gray-900">
          <p className="text-xl text-gray-400 font-semibold animate-pulse">Loading God Mode...</p>
        </div>
      );
    }

    const totalExpenses = data.total_payroll + data.total_fuel_cost;
    const payrollRatio = totalExpenses > 0 ? (data.total_payroll / totalExpenses) * 100 : 0;
    const fuelRatio = totalExpenses > 0 ? (data.total_fuel_cost / totalExpenses) * 100 : 0;
    const drivers = data?.top_drivers || [];
    const maxDriverCount = drivers.length > 0 ? Math.max(...drivers.map(d => d.count)) : 1;

    return (
      <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-900 text-white">
        <button onClick={() => setCurrentView('menu')} className="text-gray-400 hover:text-gray-200 mb-6 flex items-center transition-colors">
          ← Back to Menu
        </button>
        <h1 className="text-3xl font-extrabold text-white mb-8 tracking-tight flex items-center gap-2">
          Factory God Mode <Zap size={24} className="text-indigo-400" />
        </h1>

        {/* Top Row: 3 Big Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-gray-800 rounded-2xl shadow-md border border-gray-700 p-6 flex flex-col justify-center">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Total Revenue</h2>
            <p className="text-4xl font-bold text-green-500">{formatCurrency(data.total_revenue)}</p>
          </div>

          <div className="bg-gray-800 rounded-2xl shadow-md border border-gray-700 p-6 flex flex-col justify-center">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Total Expenses</h2>
            <p className="text-4xl font-bold text-red-500">{formatCurrency(totalExpenses)}</p>
            <div className="text-xs text-gray-500 mt-2">Payroll + Fuel</div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl shadow-lg p-6 flex flex-col justify-center text-white border border-blue-500/30">
            <h2 className="text-sm font-medium text-blue-100 uppercase tracking-wider mb-2">Estimated Net Profit</h2>
            <p className="text-5xl font-extrabold">{formatCurrency(data.net_profit)}</p>
            <div className="text-xs text-blue-200 mt-2">Revenue - Expenses</div>
          </div>
        </div>

        {/* Middle Row: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-gray-800 rounded-2xl shadow-md border border-gray-700 p-6">
            <h3 className="text-xl font-bold text-gray-100 mb-6">Expense Breakdown</h3>
            
            {totalExpenses > 0 ? (
              <div className="space-y-6">
                <div className="w-full h-8 flex rounded-full overflow-hidden shadow-inner bg-gray-700">
                  <div 
                    className="h-full bg-emerald-500 flex items-center justify-center text-xs text-white font-bold transition-all duration-500" 
                    style={{ width: `${payrollRatio}%` }}
                    title={`Payroll: ${formatCurrency(data.total_payroll)}`}
                  >
                    {payrollRatio > 10 && `${payrollRatio.toFixed(0)}%`}
                  </div>
                  <div 
                    className="h-full bg-blue-500 flex items-center justify-center text-xs text-white font-bold transition-all duration-500" 
                    style={{ width: `${fuelRatio}%` }}
                    title={`Fuel: ${formatCurrency(data.total_fuel_cost)}`}
                  >
                    {fuelRatio > 10 && `${fuelRatio.toFixed(0)}%`}
                  </div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-500 inline-block"></span>
                    <span className="text-gray-300 font-medium">Payroll</span>
                    <span className="text-gray-500">({formatK(data.total_payroll)})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 rounded-full bg-blue-500 inline-block"></span>
                    <span className="text-gray-300 font-medium">Fuel</span>
                    <span className="text-gray-500">({formatK(data.total_fuel_cost)})</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">No expenses recorded yet.</p>
            )}
          </div>

          <div className="bg-gray-800 rounded-2xl shadow-md border border-gray-700 p-6">
            <h3 className="text-xl font-bold text-gray-100 mb-6">Top Dispatch Drivers</h3>
            
            {(data?.top_drivers || []).length > 0 ? (
              <div className="space-y-5">
                {(data?.top_drivers || []).map((driver, index) => (
                  <div key={index} className="relative w-full">
                    <div className="flex justify-between items-end mb-1 z-10 relative px-1">
                      <span className="font-semibold text-gray-200">{driver.name}</span>
                      <span className="text-sm font-bold text-gray-400">{driver.count} trips</span>
                    </div>
                    <div className="w-full bg-gray-700 h-6 rounded-md overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-full rounded-md transition-all duration-1000 ease-out" 
                        style={{ width: `${(driver.count / maxDriverCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No dispatch data available yet.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render other views
  if (currentView === 'fuel') return <FuelAnalyticsDashboard onBack={() => setCurrentView('menu')} />;
  if (currentView === 'production' || currentView === 'brick') return <ProductionAnalyticsDashboard onBack={() => setCurrentView('menu')} />;
  if (currentView === 'payroll') return <HistoryStatsDashboard onBack={() => setCurrentView('menu')} />;
  if (currentView === 'sales') return <SalesDashboardHistory onBack={() => setCurrentView('menu')} />;

  return null;
}
