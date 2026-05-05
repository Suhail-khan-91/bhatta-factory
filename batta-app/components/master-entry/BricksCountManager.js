"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft, Layers, MapPin, CheckCircle2,
  Clock, ChevronRight, Plus, Trash2,
} from "lucide-react";
import { getBrickTeams, createBrickTeam, createDailyProduction, getDailyProductions, deleteDailyProduction } from "@/lib/api";

// ── Location colour mapping ───────────────────────────────────────────────────
const LOCATION_COLORS = {
  "Near Chimni": "bg-amber-500/20 text-amber-300",
  "Near Jungle": "bg-emerald-500/20 text-emerald-300",
  "South Field": "bg-blue-500/20 text-blue-300",
  "East Block":  "bg-purple-500/20 text-purple-300",
  "North Side":  "bg-cyan-500/20 text-cyan-300",
  "West Block":  "bg-pink-500/20 text-pink-300",
};
const locationColor = (tag) => LOCATION_COLORS[tag] ?? "bg-gray-600/30 text-gray-400";

// ─────────────────────────────────────────────────────────────────────────────
// Shared header component
// ─────────────────────────────────────────────────────────────────────────────
function Header({ onBack, title, subtitle, icon: Icon, iconClass = "text-emerald-400" }) {
  return (
    <div className="flex items-center gap-3 px-4 pt-5 pb-4 border-b border-gray-800 flex-shrink-0">
      <button
        onClick={onBack}
        className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 active:scale-95 transition-all"
        aria-label="Go back"
      >
        <ArrowLeft size={20} />
      </button>
      <div>
        <div className="flex items-center gap-2">
          {Icon && <Icon size={18} className={iconClass} />}
          <h1 className="text-lg font-semibold leading-tight">{title}</h1>
        </div>
        {subtitle && <p className="text-gray-400 text-xs mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// View A — Team List
// ─────────────────────────────────────────────────────────────────────────────
function TeamList({ teams, onBack, onSelectTeam, onAddTeam, isLoadingData }) {
  const [search, setSearch] = useState("");

  const filtered = teams.filter(
    (t) =>
      t.team_name.toLowerCase().includes(search.toLowerCase()) ||
      (t.location_tag && t.location_tag.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <div className="flex items-center gap-3 px-4 pt-5 pb-4 border-b border-gray-800 flex-shrink-0">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 active:scale-95 transition-all"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <Layers size={20} className="text-emerald-400" />
          <h1 className="text-lg font-semibold">Bricks Count</h1>
        </div>
        <span className="ml-auto text-gray-500 text-sm">{teams.length} teams</span>
      </div>

      {/* Search */}
      <div className="px-4 pt-3 pb-2 flex-shrink-0">
        <input
          type="text"
          placeholder="Search team or location…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
            w-full bg-gray-800 border border-gray-700 rounded-xl
            px-4 py-2.5 text-white text-sm placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500
            transition-all
          "
        />
      </div>

      {/* Team list */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {isLoadingData ? (
          <p className="text-center text-gray-500 text-sm mt-8">Loading teams...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-500 text-sm mt-8">No teams found</p>
        ) : (
          filtered.map((team, index) => (
            <button
              key={team.id}
              onClick={() => onSelectTeam(team)}
              className="
                w-full flex items-center justify-between
                bg-gray-800 border border-gray-700
                hover:border-emerald-600/50 active:scale-[0.98]
                rounded-2xl px-4 py-3.5
                transition-all duration-150 group
              "
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-400 font-bold text-sm">{index + 1}</span>
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold text-sm leading-tight">{team.team_name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin size={10} className="text-gray-500 flex-shrink-0" />
                    <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${locationColor(team.location_tag)}`}>
                      {team.location_tag || "No location"}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-600 group-hover:text-emerald-400 transition-colors flex-shrink-0" />
            </button>
          ))
        )}

        {/* Add New Team button */}
        <button
          onClick={onAddTeam}
          className="
            w-full flex items-center justify-center gap-2
            border-2 border-dashed border-emerald-700/60
            hover:border-emerald-500 hover:bg-emerald-500/5
            rounded-2xl py-4 mt-2
            text-emerald-500 hover:text-emerald-400
            font-semibold text-sm
            active:scale-95 transition-all
          "
        >
          <Plus size={18} />
          Add New Team
        </button>

        <div className="h-2" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// View C — Create Team Form
// ─────────────────────────────────────────────────────────────────────────────
function CreateTeamForm({ teams, onBack, onTeamCreated }) {
  const [teamName,    setTeamName]    = useState("");
  const [locationTag, setLocationTag] = useState("");
  const [errors,      setErrors]      = useState({});
  const [isLoading,   setIsLoading]   = useState(false);

  const validate = () => {
    const errs = {};
    if (!teamName.trim())    errs.teamName    = "Team name is required";
    if (!locationTag.trim()) errs.locationTag = "Location is required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const maxNumber = teams.reduce((max, t) => Math.max(max, t.team_number), 0);
    const newTeam = {
      team_number:  maxNumber + 1,
      team_name:    teamName.trim(),
      location_tag: locationTag.trim(),
    };

    try {
      setIsLoading(true);
      const createdTeam = await createBrickTeam(newTeam);
      alert("Team created successfully!");
      onTeamCreated(createdTeam);
    } catch (err) {
      console.error(err);
      alert("Failed to create team: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = (field) =>
    `w-full bg-gray-800 border rounded-xl px-4 py-3 text-white text-base
     placeholder-gray-500 focus:outline-none focus:ring-2 transition-all
     ${errors[field]
       ? "border-red-500 focus:ring-red-500/40"
       : "border-gray-700 focus:ring-emerald-500/40 focus:border-emerald-500"}`;

  const labelCls = "block text-gray-400 text-xs font-medium uppercase tracking-wider mb-1.5";

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <Header
        onBack={onBack}
        title="Create New Team"
        subtitle="Add a production team to the list"
        icon={Plus}
        iconClass="text-emerald-400"
      />

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 py-5 space-y-5">

        <div>
          <label className={labelCls}>Team Name</label>
          <input
            type="text"
            placeholder="e.g. Raju Team"
            value={teamName}
            onChange={(e) => { setTeamName(e.target.value); setErrors((p) => ({ ...p, teamName: undefined })); }}
            className={inputCls("teamName")}
            autoFocus
          />
          {errors.teamName && <p className="text-red-400 text-xs mt-1">{errors.teamName}</p>}
        </div>

        <div>
          <label className={labelCls}>Location Tag</label>
          <input
            type="text"
            placeholder="e.g. Near Chimni"
            value={locationTag}
            onChange={(e) => { setLocationTag(e.target.value); setErrors((p) => ({ ...p, locationTag: undefined })); }}
            className={inputCls("locationTag")}
          />
          {errors.locationTag && <p className="text-red-400 text-xs mt-1">{errors.locationTag}</p>}
          <p className="text-gray-600 text-xs mt-1">
            Suggestions: Near Chimni · Near Jungle · South Field · East Block · West Block
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="
            w-full py-4 rounded-2xl disabled:opacity-50
            bg-emerald-600 hover:bg-emerald-500 active:scale-95
            text-white font-semibold text-lg
            transition-all shadow-lg shadow-emerald-600/30
            flex items-center justify-center gap-2
          "
        >
          {isLoading ? "Saving..." : <><Plus size={20} />Create Team</>}
        </button>

        <div className="h-2" />
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// View B — Team Entry Form
// ─────────────────────────────────────────────────────────────────────────────
function TeamEntryForm({ team, history, onBack, onDeleteTeam, onEntryCreated, onEntryDeleted, setModal }) {
  const [activeTab, setActiveTab] = useState('form');
  const [bricks,    setBricks]    = useState("");
  const [date,      setDate]      = useState(new Date().toISOString().slice(0, 10));
  const [submitted, setSubmitted] = useState(false);
  const [error,     setError]     = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

  const teamHistory = history
    .filter((h) => h.team_id === team.id)
    .sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bricks || isNaN(bricks) || Number(bricks) <= 0) {
      setError("Enter a valid brick count");
      return;
    }
    setError("");

    const payload = {
      team_id:      team.id,
      bricks_count: Number(bricks),
      entry_date:   date,
      logged_by:    "Master",
    };

    try {
      setIsLoading(true);
      const newEntry = await createDailyProduction(payload);
      setModal({show: true, message: "Count saved successfully!", isError: false});
      setSubmitted(true);
      onEntryCreated(newEntry);
      setTimeout(() => { setSubmitted(false); onBack(); }, 1000);
    } catch (err) {
      console.error(err);
      setModal({show: true, message: "Failed to save count: " + err.message, isError: true});
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduction = async (id) => {
    try {
      setIsLoading(true);
      await deleteDailyProduction(id);
      onEntryDeleted(id);
      setConfirmDelete({ show: false, id: null });
      setModal({ show: true, message: "Production record deleted!", isError: false });
    } catch (err) {
      setModal({ show: true, message: "Failed to delete: " + err.message, isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRequest = () => {
    const isConfirmed = window.confirm("Are you sure you want to request deletion for this team?");
    if (!isConfirmed) return;
    setModal({show: true, message: "Deletion Request sent to Admin (Uncle) for approval.", isError: false});
    onDeleteTeam(team.id);
  };

  const inputCls =
    `w-full bg-gray-800 border rounded-xl px-4 py-3 text-white text-base
     placeholder-gray-500 focus:outline-none focus:ring-2 transition-all
     ${error
       ? "border-red-500 focus:ring-red-500/40"
       : "border-gray-700 focus:ring-emerald-500/40 focus:border-emerald-500"}`;

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6 bg-gray-900">
        <CheckCircle2 size={64} className="text-green-400 animate-bounce" />
        <p className="text-white text-xl font-semibold">Count saved!</p>
        <p className="text-gray-400 text-sm">Returning to team list…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">

      {/* Confirmation Modal */}
      {confirmDelete.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-6 mx-6 max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="text-red-500" size={32} />
            </div>
            <h2 className="text-xl font-bold mb-2">Delete Record?</h2>
            <p className="text-gray-400 text-sm mb-6">
              Are you sure you want to delete this production record? This will update your analytics.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete({ show: false, id: null })}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduction(confirmDelete.id)}
                disabled={isLoading}
                className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all"
              >
                {isLoading ? "Deleting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-3 px-4 pt-5 pb-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 active:scale-95 transition-all"
            aria-label="Back to team list"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                Team {team.team_number}
              </span>
              <h1 className="text-lg font-semibold leading-tight">{team.team_name}</h1>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin size={11} className="text-gray-500" />
              <span className="text-gray-400 text-xs">{team.location_tag}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDeleteRequest}
            className="ml-auto p-2 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-500/10 active:scale-95 transition-all"
            aria-label="Request team deletion"
          >
            <Trash2 size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex">
          <button 
            onClick={() => setActiveTab('form')} 
            className={`flex-1 py-3 text-sm font-semibold transition-all border-b-2 ${activeTab === 'form' ? 'text-emerald-400 border-emerald-400 bg-emerald-400/10' : 'text-gray-500 border-transparent hover:bg-gray-800'}`}
          >
            Log Production
          </button>
          <button 
            onClick={() => setActiveTab('history')} 
            className={`flex-1 py-3 text-sm font-semibold transition-all border-b-2 ${activeTab === 'history' ? 'text-emerald-400 border-emerald-400 bg-emerald-400/10' : 'text-gray-500 border-transparent hover:bg-gray-800'}`}
          >
            Recent History
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'form' && (
          <>
            <form onSubmit={handleSubmit} className="px-4 py-5 space-y-5">
              {/* Bricks count */}
              <div>
                <label className="block text-gray-400 text-xs font-medium uppercase tracking-wider mb-1.5">
                  Bricks Produced Today
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="e.g. 2500"
                  value={bricks}
                  onChange={(e) => { setBricks(e.target.value); setError(""); }}
                  className={inputCls}
                  autoFocus
                />
                {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
              </div>

              {/* Date */}
              <div>
                <label className="block text-gray-400 text-xs font-medium uppercase tracking-wider mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="
                    w-full bg-gray-800 border border-gray-700 rounded-xl
                    px-4 py-3 text-white text-base
                    focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500
                    transition-all [color-scheme:dark]
                  "
                />
              </div>

              {/* Save button */}
              <button
                type="submit"
                disabled={isLoading}
                className="
                  w-full py-4 rounded-2xl disabled:opacity-50
                  bg-emerald-600 hover:bg-emerald-500 active:scale-95
                  text-white font-semibold text-lg
                  transition-all shadow-lg shadow-emerald-600/30
                  flex items-center justify-center gap-2
                "
              >
                {isLoading ? "Saving..." : <><Layers size={20} />Save Daily Count</>}
              </button>
              <div className="h-2" />
            </form>
          </>
        )}

        {activeTab === 'history' && (
          <div className="px-4 py-5 space-y-4">
            <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Recent Production — {team.team_name}</h2>
            <div className="space-y-3">
              {teamHistory.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8 bg-gray-800/50 rounded-2xl border border-gray-700/50">No recent entries found.</p>
              ) : (
                teamHistory.map((h) => (
                  <div key={h.id} className="flex items-center justify-between bg-gray-800/80 border border-gray-700 rounded-2xl p-4 shadow-sm group">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-emerald-400 font-bold text-lg">{h.bricks_count.toLocaleString("en-IN")}</span>
                        <span className="text-gray-500 text-xs">bricks</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-xs">
                        <Clock size={12} />
                        <span>{h.entry_date}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete({ show: true, id: h.id })}
                      className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all active:scale-95"
                      title="Delete Entry"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="h-2" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────────────────────────────────────
export default function BricksCountManager({ onBack }) {
  const [modal, setModal] = useState({show: false, message: '', isError: false});
  const [teams,        setTeams]        = useState([]);
  const [history,      setHistory]      = useState([]);
  const [isLoadingData,setIsLoadingData]= useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isAddingTeam, setIsAddingTeam] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsData, productionsData] = await Promise.all([
          getBrickTeams(),
          getDailyProductions()
        ]);
        setTeams(teamsData);
        setHistory(productionsData);
      } catch (err) {
        console.error("Failed to load data", err);
        alert("Failed to load data: " + err.message);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleTeamCreated = (newTeam) => {
    setTeams((prev) => [...prev, newTeam]);
    setIsAddingTeam(false);
  };

  const handleDeleteTeam = (teamId) => {
    // Optimistic UI delete (real delete handled by admin approval)
    setTeams((prev) => prev.filter((t) => t.id !== teamId));
    setSelectedTeam(null);
  };

  const handleEntryCreated = (newEntry) => {
    setHistory((prev) => [...prev, newEntry]);
  };

  const handleEntryDeleted = (entryId) => {
    setHistory((prev) => prev.filter((h) => h.id !== entryId));
  };

  if (isAddingTeam) {
    return (
      <div className="h-full">
        <CreateTeamForm
          teams={teams}
          onBack={() => setIsAddingTeam(false)}
          onTeamCreated={handleTeamCreated}
        />
      </div>
    );
  }

  if (selectedTeam) {
    return (
      <div className="h-full">
        <TeamEntryForm
          team={selectedTeam}
          history={history}
          onBack={() => setSelectedTeam(null)}
          onDeleteTeam={handleDeleteTeam}
          onEntryCreated={handleEntryCreated}
          onEntryDeleted={handleEntryDeleted}
          setModal={setModal}
        />
      </div>
    );
  }

  return (
    <div className="h-full">
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
      <TeamList
        teams={teams}
        isLoadingData={isLoadingData}
        onBack={onBack}
        onSelectTeam={setSelectedTeam}
        onAddTeam={() => setIsAddingTeam(true)}
      />
    </div>
  );
}
