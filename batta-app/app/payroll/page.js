"use client";

import { useState } from "react";
import {
  Banknote, AlertCircle, CreditCard,
  Database, Wrench, BarChart2, DollarSign,
} from "lucide-react";
import GiveSalaryForm from "@/components/payroll/GiveSalaryForm";
import PendingSalaryForm from "@/components/payroll/PendingSalaryForm";
import AdvancePaymentForm from "@/components/payroll/AdvancePaymentForm";
import SetSalaryDatabase from "@/components/payroll/SetSalaryDatabase";
import ExtraWorkManager from "@/components/payroll/ExtraWorkManager";
import HistoryStatsDashboard from "@/components/payroll/HistoryStatsDashboard";

const PAYROLL_BUTTONS = [
  {
    id: "give-salary",
    label: "Give Salary",
    description: "Regular weekly & monthly payouts",
    icon: Banknote,
    color: "from-green-600 to-emerald-700",
    glow: "shadow-green-600/30",
  },
  {
    id: "pending-salary",
    label: "Pending Salary",
    description: "Clear dues from underpayments",
    icon: AlertCircle,
    color: "from-amber-500 to-orange-600",
    glow: "shadow-amber-500/30",
  },
  {
    id: "advanced-payment",
    label: "Advanced Payment",
    description: "Issue early pay before payday",
    icon: CreditCard,
    color: "from-blue-600 to-indigo-700",
    glow: "shadow-blue-600/30",
  },
  {
    id: "set-salary-db",
    label: "Set Salary Database",
    description: "Configure fixed base salary rates",
    icon: Database,
    color: "from-purple-600 to-violet-700",
    glow: "shadow-purple-600/30",
  },
  {
    id: "extra-work",
    label: "Extra Work Salary",
    description: "Pay for overtime & custom tasks",
    icon: Wrench,
    color: "from-pink-600 to-rose-700",
    glow: "shadow-pink-600/30",
  },
  {
    id: "history-stats",
    label: "History & Stats",
    description: "Full payroll analytics dashboard",
    icon: BarChart2,
    color: "from-emerald-600 to-teal-700",
    glow: "shadow-emerald-600/30",
  },
];

export default function PayrollPage() {
  const [currentView, setCurrentView] = useState("menu");

  const handleClick = (id) => {
    if (id === "give-salary" || id === "pending-salary" || id === "advanced-payment" || id === "set-salary-db" || id === "extra-work" || id === "history-stats") {
      setCurrentView(id);
    } else {
      
    }
  };

  if (currentView === "give-salary") {
    return (
      <div className="h-[calc(100dvh-5rem)]">
        <GiveSalaryForm onBack={() => setCurrentView("menu")} />
      </div>
    );
  }

  if (currentView === "pending-salary") {
    return (
      <div className="h-[calc(100dvh-5rem)]">
        <PendingSalaryForm onBack={() => setCurrentView("menu")} />
      </div>
    );
  }

  if (currentView === "advanced-payment") {
    return (
      <div className="h-[calc(100dvh-5rem)]">
        <AdvancePaymentForm onBack={() => setCurrentView("menu")} />
      </div>
    );
  }

  if (currentView === "set-salary-db") {
    return (
      <div className="h-[calc(100dvh-5rem)]">
        <SetSalaryDatabase onBack={() => setCurrentView("menu")} />
      </div>
    );
  }

  if (currentView === "extra-work") {
    return (
      <div className="h-[calc(100dvh-5rem)]">
        <ExtraWorkManager onBack={() => setCurrentView("menu")} />
      </div>
    );
  }

  if (currentView === "history-stats") {
    return (
      <div className="h-[calc(100dvh-5rem)]">
        <HistoryStatsDashboard onBack={() => setCurrentView("menu")} />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-5rem)] bg-gray-900 text-white flex flex-col">

      {/* ── Header ── */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <DollarSign size={20} className="text-green-400" />
          <h1 className="text-2xl font-bold tracking-tight">Payroll</h1>
        </div>
        <p className="text-gray-400 text-sm">Salaries, advances & payment history</p>
      </div>

      {/* ── 2×3 Button Grid ── */}
      <div className="flex-1 px-4 pb-4">
        <div className="grid grid-cols-2 gap-4">
          {PAYROLL_BUTTONS.map(({ id, label, description, icon: Icon, color, glow }) => (
            <button
              key={id}
              onClick={() => handleClick(id)}
              className={`
                relative flex flex-col items-start justify-end
                rounded-2xl p-4 aspect-square
                bg-gradient-to-br ${color}
                shadow-xl ${glow}
                active:scale-95 transition-all duration-150
                overflow-hidden
              `}
            >
              {/* Watermark icon */}
              <Icon
                size={72}
                strokeWidth={1}
                className="absolute top-2 right-1 text-white/10"
              />

              {/* Foreground icon */}
              <div className="bg-white/20 rounded-xl p-2 mb-2.5">
                <Icon size={20} className="text-white" />
              </div>

              <span className="text-white font-bold text-sm leading-tight">{label}</span>
              <span className="text-white/65 text-[11px] mt-0.5 leading-tight">{description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
