"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Truck, IndianRupee, Package, ChevronRight, AlertTriangle, CheckCircle2, Clock, Trash2, Search } from "lucide-react";
import Combobox from "@/components/ui/Combobox";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { recordPayment, logDispatch, forceCloseOrder, getSettings } from "@/lib/api";

const CANCEL_REASONS = ["Payment not done", "Doesn't need remaining order", "No contact anymore"];

const inp = "w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500/60 transition-all";
const sel = "w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500/60 transition-all appearance-none";

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-gray-400 text-xs font-medium uppercase tracking-wider">{label}</label>
    {children}
  </div>
);

export default function DispatchManager({ orderToManage, onBack }) {
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'info', title: '', message: '', id: null, action: null });
  const [selectedOrder, setSelectedOrder] = useState(orderToManage);
  const [drivers, setDrivers] = useState([]);
  const [view, setView] = useState("manage"); // manage, cancel
  
  const [paymentInput, setPaymentInput] = useState({ amount: "", method: "Cash" });
  const [dispatchInput, setDispatchInput] = useState({ qty: "", driver: "" });
  const [cancelReason, setCancelReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getSettings("drivers")
      .then(data => setDrivers(data.values || []))
      .catch(console.error);
  }, []);

  const handleRecordPayment = async () => {
    const payload = {
      order_id: selectedOrder.id,
      amount_received: Math.round(Number(paymentInput.amount || 0)),
      payment_method: paymentInput.method,
      received_by: "Master",
      timestamp: new Date().toISOString(),
    };
    
    try {
      setIsLoading(true);
      await recordPayment(selectedOrder.id, payload);
      setModalConfig({ isOpen: true, type: 'success', title: 'Success', message: 'Payment recorded successfully!' });
      setSelectedOrder((p) => ({ ...p, paid_amount: Math.round(Number(p.paid_amount) + payload.amount_received) }));
      setPaymentInput({ amount: "", method: "Cash" });
    } catch (err) {
      setModalConfig({ isOpen: true, type: 'danger', title: 'Error', message: 'Failed to record payment: ' + err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogDispatch = async () => {
    const qty = parseInt(dispatchInput.qty || 0);
    const payload = {
      order_id: selectedOrder.id,
      driver_name: dispatchInput.driver,
      qty_dispatched: qty,
      timestamp: new Date().toISOString(),
    };
    
    try {
      setIsLoading(true);
      await logDispatch(selectedOrder.id, payload);
      setModalConfig({ isOpen: true, type: 'success', title: 'Success', message: 'Dispatch logged successfully!' });
      setSelectedOrder((p) => ({ ...p, dispatched_qty: Number(p.dispatched_qty) + qty }));
      setDispatchInput({ qty: "", driver: "" });
    } catch (err) {
      setModalConfig({ isOpen: true, type: 'danger', title: 'Error', message: 'Failed to log dispatch: ' + err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceClose = async () => {
    try {
      setIsLoading(true);
      await forceCloseOrder(selectedOrder.id, { close_reason: cancelReason });
      setModalConfig({ isOpen: true, type: 'success', title: 'Success', message: 'Order force closed!' });
      setCancelReason("");
      onBack(); // Go back to main list
    } catch (err) {
      setModalConfig({ isOpen: true, type: 'danger', title: 'Error', message: 'Failed to force close order: ' + err.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (view === "cancel") {
    const isTrawli = selectedOrder.order_mode === "trawli";
    const orderedQty = selectedOrder.total_qty;
    const deliveredQty = selectedOrder.dispatched_qty;
    const labelQty = isTrawli ? "Trawli(s)" : "Brick(s)";

    return (
      <div className="min-h-[calc(100dvh-5rem)] bg-gray-900 text-white flex flex-col">
        <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setView("manage")} className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 active:scale-95 transition-all">
            <ArrowLeft size={18} className="text-gray-300" />
          </button>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">Close Order Early</h1>
            <p className="text-gray-500 text-xs">ORD-{selectedOrder.id}</p>
          </div>
        </div>

        <div className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
          <div className="rounded-2xl bg-gray-800/70 border border-gray-700/50 overflow-hidden">
             <div className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-gray-700/80 to-gray-600/80 border-b border-white/10">
              <Package size={16} className="text-white/80" />
              <span className="text-white font-semibold text-sm tracking-wide uppercase">Snapshot</span>
            </div>
            <div className="px-4 py-4">
              <p className="text-gray-300 text-sm mb-2"><span className="text-gray-500">Ordered:</span> {orderedQty} {labelQty}</p>
              <p className="text-gray-300 text-sm mb-2"><span className="text-gray-500">Delivered:</span> {deliveredQty} {labelQty}</p>
              <div className="h-px w-full bg-gray-700 my-3"></div>
              <p className="text-gray-300 text-sm mb-2"><span className="text-gray-500">Total Bill:</span> ₹{Math.round(Number(selectedOrder.total_amount)).toLocaleString("en-IN")}</p>
              <p className="text-emerald-400 text-sm"><span className="text-gray-500">Paid Amount:</span> ₹{Math.round(Number(selectedOrder.paid_amount)).toLocaleString("en-IN")}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-gray-800/70 border border-gray-700/50">
            <div className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-red-600/80 to-red-800/80 border-b border-white/10 rounded-t-2xl">
              <AlertTriangle size={16} className="text-white/80" />
              <span className="text-white font-semibold text-sm tracking-wide uppercase">Closing Details</span>
            </div>
            <div className="px-4 py-5 space-y-4">
              <Field label="Reason for Closing">
                <Combobox id="cancelReason" options={CANCEL_REASONS} value={cancelReason} onChange={(e) => setCancelReason(e?.target ? e.target.value : e)} placeholder="Select or type reason..." />
              </Field>
            </div>
          </div>

          <button onClick={handleForceClose} disabled={isLoading} className="w-full py-4 rounded-2xl bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold text-lg shadow-xl shadow-gray-900 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50">
            <CheckCircle2 size={20} />
            {isLoading ? "Closing..." : "Confirm & Move to Completed"}
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

  const pendingBalance = Math.round(Number(selectedOrder.total_amount) - Number(selectedOrder.paid_amount));
  const isTrawli = selectedOrder.order_mode === "trawli";
  const remainingQty = selectedOrder.total_qty - selectedOrder.dispatched_qty;
  const labelQty = isTrawli ? "Trawlis" : "Bricks";

  return (
    <div className="min-h-[calc(100dvh-5rem)] bg-gray-900 text-white flex flex-col">
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 active:scale-95 transition-all">
          <ArrowLeft size={18} className="text-gray-300" />
        </button>
        <div>
          <h1 className="text-white font-bold text-lg leading-tight">Manage: {selectedOrder.customer_name}</h1>
          <p className="text-gray-500 text-xs">ORD-{selectedOrder.id}</p>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 pb-8 space-y-4 overflow-y-auto">
        <div className="rounded-2xl bg-gray-800/70 border border-gray-700/50 overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-gray-700/80 to-gray-600/80 border-b border-white/10">
            <Package size={16} className="text-white/80" />
            <span className="text-white font-semibold text-sm tracking-wide uppercase">Order Snapshot</span>
          </div>
          <div className="px-4 py-4 grid grid-cols-2 gap-3">
            {[
              { label: `Total ${labelQty}`, value: selectedOrder.total_qty, color: "text-white" },
              { label: "Remaining", value: remainingQty, color: remainingQty > 0 ? "text-orange-400" : "text-emerald-400" },
              { label: "Total Bill", value: `₹${Math.round(Number(selectedOrder.total_amount)).toLocaleString("en-IN")}`, color: "text-white" },
              { label: "Pending Balance", value: `₹${Math.max(0, pendingBalance).toLocaleString("en-IN")}`, color: pendingBalance > 0 ? "text-red-400" : "text-emerald-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-gray-900/60 rounded-xl px-3 py-3">
                <p className="text-gray-400 text-xs mb-1">{label}</p>
                <p className={`font-bold text-base ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {pendingBalance > 0 && selectedOrder.status === "Active" && (
          <div className="rounded-2xl bg-gray-800/70 border border-gray-700/50 overflow-hidden">
            <div className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-600/80 to-teal-700/80 border-b border-white/10">
              <IndianRupee size={16} className="text-white/80" />
              <span className="text-white font-semibold text-sm tracking-wide uppercase">Update Payment</span>
            </div>
            <div className="px-4 py-4 space-y-4">
              <p className="text-gray-400 text-xs">Balance due: <span className="text-red-400 font-semibold">₹{pendingBalance.toLocaleString("en-IN")}</span></p>
              <Field label="Amount Receiving Now (₹)">
                <input type="number" inputMode="numeric" placeholder="0" max={pendingBalance} value={paymentInput.amount} onChange={(e) => { const val = Number(e.target.value); setPaymentInput((p) => ({ ...p, amount: e.target.value === "" ? "" : Math.max(0, Math.min(val, pendingBalance)) })); }} className={inp} />
              </Field>
              <Field label="Payment Method">
                <select value={paymentInput.method} onChange={(e) => setPaymentInput((p) => ({ ...p, method: e.target.value }))} className={sel}>
                  <option>Cash</option>
                  <option>UPI Online</option>
                  <option>Cheque</option>
                </select>
              </Field>
              <button onClick={handleRecordPayment} disabled={!paymentInput.amount || isLoading} className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-40">
                {isLoading ? "Saving..." : "💰 Record Payment"}
              </button>
            </div>
          </div>
        )}

        {remainingQty > 0 && selectedOrder.status === "Active" && (
          <div className="rounded-2xl bg-gray-800/70 border border-gray-700/50 overflow-hidden">
            <div className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-orange-600/80 to-red-700/80 border-b border-white/10">
              <Truck size={16} className="text-white/80" />
              <span className="text-white font-semibold text-sm tracking-wide uppercase">Log Dispatch</span>
            </div>
            <div className="px-4 py-4 space-y-4">
              <p className="text-gray-400 text-xs">Remaining to dispatch: <span className="text-orange-400 font-semibold">{remainingQty} {labelQty.toLowerCase()}</span></p>
              <Field label={`${labelQty} Dispatching NOW (max ${remainingQty})`}>
                <input type="number" inputMode="numeric" placeholder="0" min={1} max={remainingQty} value={dispatchInput.qty} onChange={(e) => { const val = Number(e.target.value); setDispatchInput((p) => ({ ...p, qty: e.target.value === "" ? "" : Math.max(0, Math.min(val, remainingQty)) })); }} className={inp} />
              </Field>
              <Field label="Delivery Driver">
                <select value={dispatchInput.driver} onChange={(e) => setDispatchInput((p) => ({ ...p, driver: e.target.value }))} className={sel}>
                  <option value="">— Select Driver —</option>
                  {drivers.map(d => <option key={d}>{d}</option>)}
                </select>
              </Field>
              <button onClick={handleLogDispatch} disabled={!dispatchInput.qty || !dispatchInput.driver || isLoading} className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-sm shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all disabled:opacity-40">
                {isLoading ? "Saving..." : "🚛 Log Dispatch"}
              </button>
            </div>
          </div>
        )}

        {selectedOrder.status !== "Active" && (
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 px-5 py-5 text-center mb-4">
            <p className="text-emerald-400 font-bold text-base">✅ Order {selectedOrder.status.replace("_", " ")}</p>
          </div>
        )}

        {selectedOrder.status === "Active" && (
          <div className="rounded-2xl bg-gray-800/70 border border-red-500/30 overflow-hidden mt-8">
            <div className="px-4 py-5">
              <h3 className="text-red-400 font-bold text-sm mb-1 flex items-center gap-2"><AlertTriangle size={16} /> Close Order Early</h3>
              <p className="text-gray-500 text-xs mb-4">Use this if the customer cancelled the remaining order or is unreachable.</p>
              <button onClick={() => setView("cancel")} className="w-full py-2.5 rounded-xl border border-red-500/50 text-red-400 font-bold text-sm hover:bg-red-500/10 active:scale-[0.98] transition-all">
                Force Close Order
              </button>
            </div>
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
