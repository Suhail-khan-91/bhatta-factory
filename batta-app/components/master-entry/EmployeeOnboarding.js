"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, UserPlus, Upload, X, CheckCircle2, ChevronDown } from "lucide-react";
import { createEmployee } from "@/lib/api";
import ConfirmModal from "@/components/ui/ConfirmModal";

const CATEGORIES   = ["Jhokwa", "Driver", "Bharae wala", "Coal picker", "Rabbis spreader", "General"];
const GENDERS      = ["Male", "Female", "Other"];
const RELIGIONS    = ["Muslim", "Hindu", "Sikh", "Christian", "Other"];
const CONTRACTORS  = ["Master", "Pardhan", "Uncle", "Bade Abbu"];

// ── Reusable Combobox ─────────────────────────────────────────────────────────
function Combobox({ id, value, onChange, options, placeholder, accent = "focus:ring-purple-500/40 focus:border-purple-500" }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, []);

  const select = (option) => { onChange(option); setIsOpen(false); };

  return (
    <div ref={containerRef} className="relative">
      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        autoComplete="off"
        className={`
          w-full bg-gray-800 border border-gray-700 rounded-xl
          pl-4 pr-10 py-3 text-white text-base
          focus:outline-none focus:ring-2 transition-all appearance-none
          ${accent}
        `}
      />
      <button
        type="button"
        onPointerDown={(e) => { e.preventDefault(); setIsOpen((v) => !v); }}
        tabIndex={-1}
        className="absolute right-0 top-0 h-full px-3 flex items-center text-gray-400 hover:text-white transition-colors"
        aria-label="Toggle dropdown"
      >
        <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <ul className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-xl shadow-black/40">
          {options.map((opt) => (
            <li key={opt}>
              <button
                type="button"
                onPointerDown={(e) => { e.preventDefault(); select(opt); }}
                className={`w-full text-left px-4 py-3 text-base transition-colors
                  ${value === opt
                    ? "bg-purple-500/20 text-purple-300 font-medium"
                    : "text-gray-200 hover:bg-gray-700 active:bg-gray-600"}`}
              >
                {opt}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Select wrapper ────────────────────────────────────────────────────────────
function StyledSelect({ id, value, onChange, children }) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full bg-gray-800 border border-gray-700 rounded-xl
          pl-4 pr-10 py-3 text-white text-base
          focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500
          transition-all appearance-none [color-scheme:dark]
        "
      >
        {children}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
    </div>
  );
}

// ── Main Form ─────────────────────────────────────────────────────────────────
export default function EmployeeOnboarding({ onBack }) {
  const [form, setForm] = useState({
    full_name:             "",
    employee_category:     "",
    pay_frequency:         "weekly",
    base_salary:           "",
    gender:                "",
    religion:              "",
    age:                   "",
    boss_contractor_name:  "",
    home_city:             "",
    joining_date:          new Date().toISOString().slice(0, 10),
    aadhar_file:           null,
    secondary_doc_file:    null,
  });
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'info', title: '', message: '' });
  const [aadharPreview,      setAadharPreview]      = useState(null);
  const [secondaryPreview,   setSecondaryPreview]   = useState(null);
  const [errors,             setErrors]             = useState({});
  const [submitted,          setSubmitted]          = useState(false);
  const [isLoading,          setIsLoading]          = useState(false);
  const aadharRef      = useRef(null);
  const secondaryRef   = useRef(null);

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleAadhar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    set("aadhar_file", file);
    setAadharPreview(URL.createObjectURL(file));
  };

  const removeAadhar = () => {
    set("aadhar_file", null);
    setAadharPreview(null);
    if (aadharRef.current) aadharRef.current.value = "";
  };

  const handleSecondary = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    set("secondary_doc_file", file);
    setSecondaryPreview(URL.createObjectURL(file));
  };

  const removeSecondary = () => {
    set("secondary_doc_file", null);
    setSecondaryPreview(null);
    if (secondaryRef.current) secondaryRef.current.value = "";
  };

  const validate = () => {
    const errs = {};
    if (!form.full_name.trim())         errs.full_name         = "Required";
    if (!form.employee_category.trim()) errs.employee_category = "Required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const payload = {
      full_name:            form.full_name.trim(),
      employee_category:    form.employee_category.trim(),
      pay_frequency:        form.pay_frequency,
      base_salary:          form.base_salary ? Number(form.base_salary) : 0,
      gender:               form.gender.trim() || null,
      religion:             form.religion.trim() || null,
      age:                  form.age ? Number(form.age) : null,
      boss_contractor_name: form.boss_contractor_name.trim() || null,
      home_city:            form.home_city.trim() || null,
      joining_date:         form.joining_date,
      document_url:         null,
      is_active:            true,
    };

    try {
      setIsLoading(true);
      await createEmployee(payload);
      setSubmitted(true);
      setModalConfig({ isOpen: true, type: 'success', title: 'Success', message: 'Employee onboarding complete!' });
      setTimeout(() => { setSubmitted(false); onBack(); }, 1000);
    } catch (err) {
      console.error(err);
      setModalConfig({ isOpen: true, type: 'danger', title: 'Error', message: err.message || 'Failed to save employee' });
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = (field) =>
    `w-full bg-gray-800 border rounded-xl px-4 py-3 text-white text-base
     placeholder-gray-500 focus:outline-none focus:ring-2 transition-all
     ${errors[field]
       ? "border-red-500 focus:ring-red-500/40"
       : "border-gray-700 focus:ring-purple-500/40 focus:border-purple-500"}`;

  const labelCls  = "block text-gray-400 text-xs font-medium uppercase tracking-wider mb-1.5";
  const sectionCls = "text-gray-500 text-[10px] font-semibold uppercase tracking-widest pt-2 pb-1 border-t border-gray-800";

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
        <CheckCircle2 size={64} className="text-green-400 animate-bounce" />
        <p className="text-white text-xl font-semibold">Employee saved!</p>
        <p className="text-gray-400 text-sm">Returning to menu…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4 border-b border-gray-800">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 active:scale-95 transition-all"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <UserPlus size={20} className="text-purple-400" />
          <h1 className="text-lg font-semibold">New Employee</h1>
        </div>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 py-5 space-y-5">

        {/* ── Section: Work Details ── */}
        <p className={sectionCls}>Work Details</p>

        {/* Full Name */}
        <div>
          <label className={labelCls}>Full Name <span className="text-red-400">*</span></label>
          <input
            type="text"
            placeholder="e.g. Raju Kumar"
            value={form.full_name}
            onChange={(e) => set("full_name", e.target.value)}
            className={inputCls("full_name")}
          />
          {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name}</p>}
        </div>

        {/* Employee Category — Combobox */}
        <div>
          <label className={labelCls}>Employee Category <span className="text-red-400">*</span></label>
          <Combobox
            id="employee_category"
            value={form.employee_category}
            onChange={(v) => set("employee_category", v)}
            options={CATEGORIES}
            placeholder="Select or type a category"
          />
          {errors.employee_category && <p className="text-red-400 text-xs mt-1">{errors.employee_category}</p>}
        </div>

        {/* Pay Frequency */}
        <div>
          <label className={labelCls}>Pay Frequency</label>
          <StyledSelect id="pay_frequency" value={form.pay_frequency} onChange={(v) => set("pay_frequency", v)}>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </StyledSelect>
        </div>

        {/* Base Salary */}
        <div>
          <label className={labelCls}>Base Salary (₹)</label>
          <input
            type="number"
            inputMode="numeric"
            placeholder="e.g. 2000"
            value={form.base_salary}
            onChange={(e) => set("base_salary", e.target.value)}
            className={inputCls("base_salary")}
          />
        </div>

        {/* Boss / Contractor Name — Combobox */}
        <div>
          <label className={labelCls}>Boss / Contractor Name</label>
          <Combobox
            id="boss_contractor_name"
            value={form.boss_contractor_name}
            onChange={(v) => set("boss_contractor_name", v)}
            options={CONTRACTORS}
            placeholder="Who brought them to the factory?"
          />
        </div>

        {/* Joining Date */}
        <div>
          <label className={labelCls}>Joining Date</label>
          <input
            type="date"
            value={form.joining_date}
            onChange={(e) => set("joining_date", e.target.value)}
            className={`${inputCls("joining_date")} [color-scheme:dark]`}
          />
        </div>

        {/* ── Section: Personal Details ── */}
        <p className={sectionCls}>Personal Details</p>

        {/* Gender — Combobox */}
        <div>
          <label className={labelCls}>Gender</label>
          <Combobox
            id="gender"
            value={form.gender}
            onChange={(v) => set("gender", v)}
            options={GENDERS}
            placeholder="Select or type"
          />
        </div>

        {/* Religion — Combobox */}
        <div>
          <label className={labelCls}>Religion</label>
          <Combobox
            id="religion"
            value={form.religion}
            onChange={(v) => set("religion", v)}
            options={RELIGIONS}
            placeholder="Select or type"
          />
        </div>

        {/* Age */}
        <div>
          <label className={labelCls}>Age</label>
          <input
            type="number"
            inputMode="numeric"
            placeholder="e.g. 28"
            value={form.age}
            onChange={(e) => set("age", e.target.value)}
            className={inputCls("age")}
          />
        </div>

        {/* Home City / Village */}
        <div>
          <label className={labelCls}>Home City / Village</label>
          <input
            type="text"
            placeholder="e.g. Azamgarh, UP"
            value={form.home_city}
            onChange={(e) => set("home_city", e.target.value)}
            className={inputCls("home_city")}
          />
        </div>

        {/* ── Section: Document Upload ── */}
        <p className={sectionCls}>Document Upload</p>

        {/* Zone 1 — Aadhar Card */}
        <div>
          <label className={labelCls}>Aadhar Card (Optional)</label>
          {aadharPreview ? (
            <div className="relative">
              <img src={aadharPreview} alt="Aadhar preview"
                className="w-full max-h-48 object-cover rounded-xl border border-gray-700" />
              <button type="button" onClick={removeAadhar}
                className="absolute top-2 right-2 bg-gray-900/80 rounded-full p-1 hover:bg-red-600 transition-colors">
                <X size={16} />
              </button>
              <p className="text-gray-500 text-xs mt-1 truncate">{form.aadhar_file?.name}</p>
            </div>
          ) : (
            <button type="button" onClick={() => aadharRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-700 rounded-xl py-7
                flex flex-col items-center gap-2 text-gray-500
                hover:border-purple-500 hover:text-purple-400 transition-all">
              <Upload size={22} />
              <span className="text-sm">Tap to attach Aadhar Card</span>
            </button>
          )}
          <input ref={aadharRef} type="file" accept="image/*"
            onChange={handleAadhar} className="hidden" />
        </div>

        {/* Zone 2 — PAN / Bank Passbook */}
        <div>
          <label className={labelCls}>PAN Card / Bank Passbook (Optional)</label>
          {secondaryPreview ? (
            <div className="relative">
              <img src={secondaryPreview} alt="Secondary doc preview"
                className="w-full max-h-48 object-cover rounded-xl border border-gray-700" />
              <button type="button" onClick={removeSecondary}
                className="absolute top-2 right-2 bg-gray-900/80 rounded-full p-1 hover:bg-red-600 transition-colors">
                <X size={16} />
              </button>
              <p className="text-gray-500 text-xs mt-1 truncate">{form.secondary_doc_file?.name}</p>
            </div>
          ) : (
            <button type="button" onClick={() => secondaryRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-700 rounded-xl py-7
                flex flex-col items-center gap-2 text-gray-500
                hover:border-purple-500 hover:text-purple-400 transition-all">
              <Upload size={22} />
              <span className="text-sm">Tap to attach PAN / Passbook</span>
            </button>
          )}
          <input ref={secondaryRef} type="file" accept="image/*"
            onChange={handleSecondary} className="hidden" />
        </div>

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={isLoading}
          className="
            w-full py-4 rounded-2xl
            bg-purple-600 hover:bg-purple-500 active:scale-95 disabled:opacity-50
            text-white font-semibold text-lg
            transition-all shadow-lg shadow-purple-600/30
            flex items-center justify-center gap-2
          "
        >
          {isLoading ? (
            "Saving..."
          ) : (
            <>
              <UserPlus size={20} />
              Save Employee
            </>
          )}
        </button>

        <div className="h-2" />
      </form>
      <ConfirmModal 
        isOpen={modalConfig.isOpen} 
        type={modalConfig.type} 
        title={modalConfig.title} 
        message={modalConfig.message} 
        onConfirm={() => setModalConfig({ ...modalConfig, isOpen: false })} 
      />
    </div>
  );
}
