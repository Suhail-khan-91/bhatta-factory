"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ShoppingCart, User, ClipboardList, IndianRupee, CheckCircle2 } from "lucide-react";
import Combobox from "@/components/ui/Combobox";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { createOrder, getAllSettings, getSettings } from "@/lib/api";

const today = new Date().toISOString().split("T")[0];

const SECTION = ({ icon: Icon, title, accent, children }) => (
  <div className="rounded-2xl bg-gray-800/70 border border-gray-700/50 overflow-hidden mb-4">
    <div className={`flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r ${accent} border-b border-white/10`}>
      <Icon size={16} className="text-white/80" />
      <span className="text-white font-semibold text-sm tracking-wide uppercase">{title}</span>
    </div>
    <div className="px-4 py-4 space-y-4">{children}</div>
  </div>
);

const Field = ({ label, hint, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-gray-400 text-xs font-medium uppercase tracking-wider">{label}</label>
    {children}
    {hint && <p className="text-gray-500 text-xs mt-0.5">{hint}</p>}
  </div>
);

const inp = "w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500/60 focus:border-orange-500/60 transition-all";
const sel = "w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/60 focus:border-orange-500/60 transition-all appearance-none";

export default function OrderBricksForm({ onBack }) {
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'info', title: '', message: '' });
  const [settings, setSettings] = useState({
    lead_sources: [],
    salespersons: [],
    brick_categories: []
  });

  const [pricePerTrawli, setPricePerTrawli] = useState(14000);

  useEffect(() => {
    getAllSettings()
      .then(data => {
        const settingsMap = {};
        data.forEach(s => { settingsMap[s.category] = s.values; });
        setSettings({
          lead_sources: settingsMap["lead_sources"] || [],
          salespersons: settingsMap["salespersons"] || [],
          brick_categories: settingsMap["brick_categories"] || []
        });
      })
      .catch(console.error);

    getSettings("pricing")
      .then(res => {
        if (res?.values?.price_per_trawli) {
          setPricePerTrawli(res.values.price_per_trawli);
        }
      })
      .catch(console.error);
  }, []);

  const [orderMode, setOrderMode] = useState("trawli");
  const [form, setForm] = useState({
    trawlisQty: "",
    bricksQty: "",
    brickCategory: "Red",
    customerName: "",
    customerMobile: "",
    customerAddress: "",
    orderDate: today,
    leadSource: "",
    salesperson: "Master",
    pricePerTrawli: pricePerTrawli,
    customTotalAmount: "",
    paymentStatus: "Pending/Udhaar",
    amountPaid: "",
    paymentMethod: "Cash",
    receivedBy: "",
  });

  useEffect(() => {
    setForm((p) => ({ ...p, pricePerTrawli }));
  }, [pricePerTrawli]);

  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e?.target ? e.target.value : e }));

  const totalAmount =
    orderMode === "trawli"
      ? parseFloat(form.trawlisQty || 0) * parseFloat(form.pricePerTrawli || 0)
      : parseFloat(form.customTotalAmount || 0);

  const showPaymentFields =
    form.paymentStatus === "Full Payment" || form.paymentStatus === "Partial Advance";

  const handleSubmit = async () => {
    const payload = {
      order_mode: orderMode,
      brick_category: form.brickCategory,
      customer_name: form.customerName,
      customer_mobile: form.customerMobile,
      customer_address: form.customerAddress,
      order_date: form.orderDate,
      lead_source: form.leadSource,
      salesperson: form.salesperson,
      total_qty: orderMode === "trawli" ? Number(form.trawlisQty) : Number(form.bricksQty),
      price_per_trawli: orderMode === "trawli" ? Number(form.pricePerTrawli) : null,
      total_amount: totalAmount,
      paid_amount: showPaymentFields ? Number(form.amountPaid) : 0,
      timestamp: new Date().toISOString()
    };
    
    try {
      setIsLoading(true);
      await createOrder(payload);
      setSubmitted(true);
      setModalConfig({ isOpen: true, type: 'success', title: 'Success', message: 'Order created successfully!' });
      setTimeout(() => { setSubmitted(false); onBack(); }, 1500);
    } catch (err) {
      setModalConfig({ isOpen: true, type: 'danger', title: 'Error', message: 'Failed to create order: ' + err.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6 bg-gray-900">
        <CheckCircle2 size={64} className="text-green-400 animate-bounce" />
        <p className="text-white text-xl font-semibold">Order Created!</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-5rem)] bg-gray-900 text-white flex flex-col">
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 active:scale-95 transition-all">
          <ArrowLeft size={18} className="text-gray-300" />
        </button>
        <div>
          <h1 className="text-white font-bold text-lg leading-tight">1. Order Bricks</h1>
          <p className="text-gray-500 text-xs">Create a new sale order</p>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 pb-8 overflow-y-auto">
        <SECTION icon={User} title="Customer Details" accent="from-sky-600/80 to-blue-700/80">
          <Field label="Customer Name">
            <input type="text" placeholder="Full name" value={form.customerName} onChange={set("customerName")} className={inp} />
          </Field>
          <Field label="Mobile Number">
            <input type="tel" inputMode="tel" placeholder="+91 XXXXX XXXXX" value={form.customerMobile} onChange={set("customerMobile")} className={inp} />
          </Field>
          <Field label="Delivery Address">
            <textarea rows={2} placeholder="Village / town / landmark" value={form.customerAddress} onChange={set("customerAddress")} className={`${inp} resize-none`} />
          </Field>
        </SECTION>

        <SECTION icon={ClipboardList} title="Internal / Sales Details" accent="from-violet-600/80 to-purple-700/80">
          <Field label="Lead Source">
            <Combobox id="leadSource" options={settings.lead_sources} value={form.leadSource} onChange={set("leadSource")} placeholder="Search or type name…" />
          </Field>
          <Field label="Salesperson">
            <Combobox id="salesperson" options={settings.salespersons} value={form.salesperson} onChange={set("salesperson")} placeholder="Search or type name…" />
          </Field>
        </SECTION>

        <SECTION icon={ShoppingCart} title="Order Details" accent="from-orange-600/80 to-red-700/80">
          <div className="flex gap-2 p-1 bg-gray-900/60 rounded-xl border border-gray-700">
            <button
              onClick={() => setOrderMode("trawli")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${orderMode === "trawli" ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30" : "text-gray-400 hover:text-gray-200"}`}
            >
              🚛 Order by Trawli
            </button>
            <button
              onClick={() => setOrderMode("custom")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${orderMode === "custom" ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30" : "text-gray-400 hover:text-gray-200"}`}
            >
              🧱 Custom Bricks
            </button>
          </div>
          {orderMode === "trawli" ? (
            <Field label="Number of Trawlis" hint="(Approx. 2000 bricks per Trawli)">
              <input type="number" inputMode="numeric" placeholder="e.g. 2" value={form.trawlisQty} onChange={set("trawlisQty")} className={inp} />
            </Field>
          ) : (
            <Field label="Number of Bricks">
              <input type="number" inputMode="numeric" placeholder="e.g. 1000" value={form.bricksQty} onChange={set("bricksQty")} className={inp} />
            </Field>
          )}
          <Field label="Brick Category">
            <select value={form.brickCategory} onChange={set("brickCategory")} className={sel}>
              {settings.brick_categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </SECTION>

        <SECTION icon={IndianRupee} title="Financials" accent="from-emerald-600/80 to-teal-700/80">
          {orderMode === "trawli" && (
            <Field label="Price per Trawli (₹)" hint="Editable for discounts">
              <input type="number" inputMode="numeric" value={form.pricePerTrawli} onChange={set("pricePerTrawli")} className={inp} />
            </Field>
          )}
          {orderMode === "trawli" ? (
            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-4 text-center">
              <p className="text-emerald-400 text-xs font-medium uppercase tracking-widest mb-1">Total Amount</p>
              <p className="text-white text-4xl font-extrabold tracking-tight">₹{totalAmount.toLocaleString("en-IN")}</p>
              <p className="text-emerald-400/60 text-xs mt-1">
                {form.trawlisQty || "0"} trawli × ₹{Number(form.pricePerTrawli).toLocaleString("en-IN")}
              </p>
            </div>
          ) : (
            <Field label="Total Amount (₹)" hint="Enter the negotiated price">
              <input type="number" inputMode="numeric" placeholder="e.g. 7000" value={form.customTotalAmount} onChange={set("customTotalAmount")} className={`${inp} text-xl font-bold`} />
            </Field>
          )}
          <Field label="Payment Status">
            <select value={form.paymentStatus} onChange={set("paymentStatus")} className={sel}>
              <option>Full Payment</option>
              <option>Partial Advance</option>
              <option>Pending/Udhaar</option>
            </select>
          </Field>
          {showPaymentFields && (
            <>
              <Field label="Amount Paid (₹)">
                <input type="number" inputMode="numeric" placeholder="0" value={form.amountPaid} onChange={set("amountPaid")} className={inp} />
              </Field>
              <Field label="Payment Method">
                <select value={form.paymentMethod} onChange={(e) => setForm((p) => ({ ...p, paymentMethod: e.target.value }))} className={sel}>
                  <option>Cash</option>
                  <option>UPI Online</option>
                </select>
              </Field>
              <Field label="Received By">
                <input type="text" placeholder="Name" value={form.receivedBy} onChange={set("receivedBy")} className={inp} />
              </Field>
            </>
          )}
        </SECTION>

        <div className="rounded-2xl bg-gray-800/70 border border-gray-700/50 overflow-hidden mb-4 px-4 py-4">
          <Field label="Order Date">
            <input type="date" value={form.orderDate} onChange={set("orderDate")} className={`${inp} [color-scheme:dark]`} />
          </Field>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 disabled:opacity-50 text-white font-bold text-lg shadow-xl shadow-orange-500/30 active:scale-[0.98] transition-all duration-150"
        >
          {isLoading ? "Saving..." : "🧱 Create Order"}
        </button>
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
