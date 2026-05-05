"use client";

import { useState, useMemo, useEffect } from "react";
import { ArrowLeft, Layers, Trophy, TrendingUp } from "lucide-react";
import { getBrickTeams, getDailyProductions } from "@/lib/api";

const TIME_RANGES = ["7D", "1M", "Year"];

const filterByRange = (data, range) => {
  const now = new Date();
  return data.filter(o => {
    const d = new Date(o.entry_date);
    if (range === "7D") return (now - d) / 86400000 <= 7;
    if (range === "1M") return (now - d) / 86400000 <= 30;
    return true;
  });
};

export default function ProductionAnalyticsDashboard({ onBack }) {
  const [modal, setModal] = useState({show: false, message: '', isError: false});
  const [teams, setTeams] = useState([]);
  const [productions, setProductions] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [activeTab, setActiveTab] = useState("stats");
  const [timeRange, setTimeRange] = useState("7D");

  useEffect(() => {
    Promise.all([getBrickTeams(), getDailyProductions()])
      .then(([teamsData, prodData]) => {
        setTeams(teamsData);
        setProductions(prodData.map(p => ({
          ...p,
          team_name: teamsData.find(t => t.id === p.team_id)?.team_name || `Team ${p.team_id}`,
          team_number: teamsData.find(t => t.id === p.team_id)?.team_number || p.team_id,
        })));
      })
      .catch(err => setModal({show: true, message: "Failed to fetch production data: " + err.message, isError: true}))
      .finally(() => setIsLoadingData(false));
  }, []);

  const filtered = useMemo(() => filterByRange(productions, timeRange), [productions, timeRange]);

  const totalBricks    = filtered.reduce((s, o) => s + o.bricks_count, 0);
  const activeTeams    = new Set(filtered.map(o => o.team_id)).size;
  const highestSingle  = filtered.length ? Math.max(...filtered.map(o => o.bricks_count)) : 0;

  const teamTotals = filtered.reduce((acc, o) => {
    if (!acc[o.team_name]) acc[o.team_name] = 0;
    acc[o.team_name] += o.bricks_count;
    return acc;
  }, {});
  const maxTeamVal = Math.max(...Object.values(teamTotals), 1);
  const rankedTeams = Object.entries(teamTotals).sort((a, b) => b[1] - a[1]);

  const dailyMap = filtered.reduce((acc, o) => {
    acc[o.entry_date] = (acc[o.entry_date] || 0) + o.bricks_count;
    return acc;
  }, {});
  const sortedDates = Object.keys(dailyMap).sort();
  const dailyValues = sortedDates.map(d => dailyMap[d]);
  const maxDaily    = Math.max(...dailyValues, 1);

  const MEDAL = ["🥇", "🥈", "🥉"];

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
            <h1 className="text-white font-bold text-lg leading-tight">Production Analytics</h1>
            <p className="text-gray-500 text-xs">Team output & brick count trends</p>
          </div>
        </div>
        <div className="flex border-t border-gray-800">
          {[{ key: "stats", label: "Insights & Stats" }, { key: "history", label: "Entry Ledger" }].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} className={`flex-1 py-3 text-sm font-semibold transition-all border-b-2 ${activeTab === t.key ? "text-emerald-400 border-emerald-400 bg-emerald-400/10" : "text-gray-500 border-transparent hover:bg-gray-800"}`}>
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
                <button key={r} onClick={() => setTimeRange(r)} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${timeRange === r ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" : "text-gray-400 hover:text-white"}`}>
                  {r}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Total Bricks",    value: totalBricks.toLocaleString("en-IN"),    icon: Layers,    accent: "from-emerald-500 to-teal-600",  glow: "shadow-emerald-500/20" },
                { label: "Active Teams",    value: activeTeams,                             icon: Trophy,    accent: "from-violet-600 to-purple-700", glow: "shadow-violet-600/20" },
                { label: "Best Single Day", value: highestSingle.toLocaleString("en-IN"),  icon: TrendingUp, accent: "from-orange-500 to-red-600",   glow: "shadow-orange-500/20" },
              ].map(({ label, value, icon: Icon, accent, glow }) => (
                <div key={label} className={`rounded-2xl bg-gradient-to-br ${accent} shadow-lg ${glow} p-3`}>
                  <div className="bg-white/20 rounded-lg p-1.5 w-fit mb-2"><Icon size={13} className="text-white" /></div>
                  <p className="text-white font-extrabold text-base leading-tight">{value}</p>
                  <p className="text-white/60 text-[10px] mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-gray-800/70 border border-gray-700/50 p-4">
              <h3 className="text-white font-bold text-sm mb-4">Production Leaderboard</h3>
              {rankedTeams.length === 0 ? (
                <p className="text-gray-500 text-xs text-center py-4">No data for this period.</p>
              ) : (
                <div className="space-y-3">
                  {rankedTeams.map(([name, total], i) => (
                    <div key={name}>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-300 text-xs">{MEDAL[i] || `#${i + 1}`} {name}</span>
                        <span className="text-gray-400 text-xs font-semibold">{total.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500" style={{ width: `${(total / maxTeamVal) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-gray-800/70 border border-gray-700/50 p-4">
              <h3 className="text-white font-bold text-sm mb-4">Daily Production Trend</h3>
              {sortedDates.length === 0 ? (
                <p className="text-gray-500 text-xs text-center py-4">No data for this period.</p>
              ) : (
                <>
                  <div className="relative h-32">
                    <svg viewBox={`0 0 ${Math.max(sortedDates.length, 1) * 40} 100`} preserveAspectRatio="none" className="w-full h-full">
                      <defs>
                        <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>
                      {sortedDates.length > 1 && (() => {
                        const pts = dailyValues.map((v, i) => `${i * 40 + 20},${100 - (v / maxDaily) * 85}`);
                        const area = `M${pts[0]} ${pts.slice(1).map(p => `L${p}`).join(" ")} L${(dailyValues.length - 1) * 40 + 20},100 L20,100 Z`;
                        const line = `M${pts.join(" L")}`;
                        return (
                          <>
                            <path d={area} fill="url(#prodGrad)" />
                            <path d={line} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            {pts.map((p, i) => {
                              const [x, y] = p.split(",");
                              return <circle key={i} cx={x} cy={y} r="3" fill="#10b981" />;
                            })}
                          </>
                        );
                      })()}
                      {sortedDates.length === 1 && <circle cx="20" cy={100 - (dailyValues[0] / maxDaily) * 85} r="4" fill="#10b981" />}
                    </svg>
                  </div>
                  <div className="flex justify-between mt-1 px-1">
                    {sortedDates.map(d => <span key={d} className="text-gray-600 text-[9px]">{d.slice(5)}</span>)}
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="px-4 pt-4 space-y-3">
            {productions.length === 0 && <p className="text-gray-500 text-sm text-center mt-10">No entries found.</p>}
            {[...productions].sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date)).map((log, i) => (
              <div key={i} className="rounded-2xl bg-gray-800/70 border border-gray-700/50 px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold text-sm">{log.team_name}</p>
                  <p className="text-gray-500 text-xs">{log.entry_date} · Team #{log.team_number}</p>
                </div>
                <p className="text-emerald-400 font-bold text-base">{log.bricks_count.toLocaleString("en-IN")}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
