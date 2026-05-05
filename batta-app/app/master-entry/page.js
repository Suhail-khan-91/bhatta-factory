"use client";

import { useState } from "react";
import { Fuel, Activity, Layers, UserPlus, ArrowLeft } from "lucide-react";
import FuelInputForm from "@/components/master-entry/FuelInputForm";
import FuelOutputForm from "@/components/master-entry/FuelOutputForm";
import EmployeeOnboarding from "@/components/master-entry/EmployeeOnboarding";
import BricksCountManager from "@/components/master-entry/BricksCountManager";

// ── Menu tile definitions ─────────────────────────────────────────────────────
const MENU_ITEMS = [
  {
    id: "fuel-input",
    label: "Fuel Input",
    description: "Log a new fuel purchase",
    icon: Fuel,
    color: "from-blue-600 to-blue-700",
    glow: "shadow-blue-600/30",
  },
  {
    id: "fuel-output",
    label: "Fuel Output",
    description: "Record fuel usage by machine",
    icon: Activity,
    color: "from-orange-500 to-orange-600",
    glow: "shadow-orange-500/30",
  },
  {
    id: "bricks-count",
    label: "Bricks Count",
    description: "Enter daily team production",
    icon: Layers,
    color: "from-amber-700 to-orange-900",
    glow: "shadow-amber-700/30",
  },
  {
    id: "new-employee",
    label: "New Employee",
    description: "Onboard a new worker",
    icon: UserPlus,
    color: "from-purple-600 to-purple-700",
    glow: "shadow-purple-600/30",
  },
];

// ── View renderer ─────────────────────────────────────────────────────────────
function renderView(view, setView) {
  switch (view) {
    case "fuel-input":
      return <FuelInputForm onBack={() => setView("menu")} />;

    case "fuel-output":
      return <FuelOutputForm onBack={() => setView("menu")} />;

    case "new-employee":
      return <EmployeeOnboarding onBack={() => setView("menu")} />;

    case "bricks-count":
      return <BricksCountManager onBack={() => setView("menu")} />;

    default:
      return null;
  }
}

function ComingSoon({ label, onBack }) {
  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <div className="flex items-center gap-3 px-4 pt-5 pb-4 border-b border-gray-800">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 active:scale-95 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold">{label}</h1>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
        <div className="text-5xl">🚧</div>
        <p className="text-white font-semibold text-lg">{label}</p>
        <p className="text-gray-500 text-sm">This form is coming in the next task.</p>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function MasterEntryPage() {
  const [currentView, setCurrentView] = useState("menu");

  if (currentView !== "menu") {
    return (
      <div className="h-[calc(100dvh-5rem)]">
        {renderView(currentView, setCurrentView)}
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-5rem)] bg-gray-900 text-white flex flex-col">

      {/* ── Page Header ── */}
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Master Entry</h1>
        <p className="text-gray-400 text-sm mt-1">Select an entry type to log</p>
      </div>

      {/* ── 2×2 Button Grid ── */}
      <div className="flex-1 px-4 pb-4">
        <div className="grid grid-cols-2 gap-4">
          {MENU_ITEMS.map(({ id, label, description, icon: Icon, color, glow }) => (
            <button
              key={id}
              onClick={() => setCurrentView(id)}
              className={`
                relative flex flex-col items-start justify-end
                rounded-2xl p-5 aspect-square
                bg-gradient-to-br ${color}
                shadow-xl ${glow}
                active:scale-95 transition-all duration-150
                overflow-hidden
              `}
            >
              {/* Background icon watermark */}
              <Icon
                size={80}
                strokeWidth={1}
                className="absolute top-3 right-2 text-white/10"
              />

              {/* Foreground icon */}
              <div className="bg-white/20 rounded-xl p-2.5 mb-3">
                <Icon size={24} className="text-white" />
              </div>

              <span className="text-white font-bold text-base leading-tight">{label}</span>
              <span className="text-white/70 text-xs mt-0.5 leading-tight">{description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
