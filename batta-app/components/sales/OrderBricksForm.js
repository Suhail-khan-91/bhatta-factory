"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ShoppingCart, User, ClipboardList, IndianRupee, CheckCircle2 } from "lucide-react";
import Combobox from "@/components/ui/Combobox";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { createOrder, getAllSettings, getSettings, getOrders } from "@/lib/api";
import { jsPDF } from "jspdf";

const today = new Date().toISOString().split("T")[0];

const SECTION = ({ icon: Icon, title, accent, children }) => (
  <div className="rounded-2xl bg-gray-800/70 border border-gray-700/50 mb-4">
    <div className={`flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r ${accent} border-b border-white/10 rounded-t-2xl`}>
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

const CustomDropdown = ({ label, options, value, onChange, placeholder, zIndex = "z-50" }) => (
  <div className={`relative ${zIndex}`}>
    <Field label={label}>
      <Combobox id={label.replace(/\s+/g, '')} options={options} value={value} onChange={onChange} placeholder={placeholder} />
    </Field>
  </div>
);

const inp = "w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500/60 focus:border-orange-500/60 transition-all";
const sel = "w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/60 focus:border-orange-500/60 transition-all appearance-none";

export default function OrderBricksForm({ onBack }) {
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'info', title: '', message: '' });
  const [activeTab, setActiveTab] = useState('new_order');
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState({
    lead_sources: [],
    salespersons: [],
    brick_categories: []
  });

  const [pricePerTrawli, setPricePerTrawli] = useState(14000);

  useEffect(() => {
    getOrders().then(setOrders).catch(console.error);

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
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

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

  const generateInvoice = async (order, action = 'preview') => {
    // Helper: load image via Canvas → Base64 Data URL (avoids jsPDF HTMLImageElement issues)
    const getBase64Image = (url) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          canvas.getContext('2d').drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg'));
        };
        img.onerror = (err) => reject(err);
        img.src = url;
      });

    try {
      const doc = new jsPDF();

      // Watermark — skip cleanly if image fails for any reason
      let watermarkDataUrl = null;
      try {
        watermarkDataUrl = await getBase64Image('/images/sk-bricks.jpg');
      } catch (imgErr) {
        console.warn("Watermark skipped:", imgErr);
      }

      // ── Watermark helper (called for every new page) ─────────────────
      const applyWatermark = () => {
        if (watermarkDataUrl) {
          doc.setGState(new doc.GState({ opacity: 0.28 }));
          doc.addImage(watermarkDataUrl, 'JPEG', 0, 0, 210, 297);
          doc.setGState(new doc.GState({ opacity: 1.0 }));
        }
      };

      // Apply to page 1
      applyWatermark();

      // Header
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("RECEIPT / BILL", 105, 15, { align: "center" });

      doc.setLineDash([2, 2], 0);
      doc.line(20, 18, 190, 18);
      doc.setLineDash([]);

      let currentY = 18;
      currentY += 8;

      doc.setFontSize(24);
      doc.text("SK BRICKS", 105, currentY + 7, { align: "center" });
      currentY += 17;

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Owner: Akbar Ali Khan (Pardhan)", 105, currentY, { align: "center" });
      currentY += 8;
      doc.text("Mobile No: 9984850786 / 9369218372", 105, currentY, { align: "center" });
      currentY += 8;
      doc.text("Address: Daldi, Bhadni Chafa UP", 105, currentY, { align: "center" });
      currentY += 6;

      // ── Layout constants ──────────────────────────────────────────────
      const leftX        = 35;   // label X
      const rightX       = 135;  // value X
      const rightMaxW    = 60;   // max width of right-column text (mm)
      const lineH        = 6;    // height per line of text (mm)
      const rowPad       = 4;    // extra padding after each row (mm)

      // Helper: add page if we're close to the bottom
      const checkPage = () => {
        if (currentY > 265) { doc.addPage(); applyWatermark(); currentY = 20; }
      };

      // Helper: print a 2-column row with dynamic wrapping, returns nothing
      const row = (label, value) => {
        const lines = doc.splitTextToSize(String(value || 'N/A'), rightMaxW);
        doc.text(label, leftX, currentY);
        doc.text(lines, rightX, currentY);
        currentY += (lines.length * lineH) + rowPad;
      };

      // ── Horizontal Line ───────────────────────────────────────────────
      checkPage();
      doc.line(15, currentY, 195, currentY);
      currentY += 11;

      // ── Customer Details ──────────────────────────────────────────────
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Customer Details:", leftX, currentY);
      doc.setFont("helvetica", "normal");
      currentY += 10;

      row("Name:",    order.customer_name);
      row("Mobile:",  order.customer_mobile);
      row("Address:", order.customer_address);
      row("Date:",    order.order_date);
      currentY += 2; // small extra gap before next line

      // ── Horizontal Line ───────────────────────────────────────────────
      checkPage();
      doc.line(15, currentY, 195, currentY);
      currentY += 12;

      // ── Order Details ─────────────────────────────────────────────────
      doc.setFont("helvetica", "bold");
      doc.text("Order Details:", leftX, currentY);
      doc.setFont("helvetica", "normal");
      currentY += 10;

      row("Brick Type:", order.brick_category);

      const qtyText = order.order_mode === 'trawli'
        ? `${order.total_qty} Trawli(s)`
        : `${order.total_qty} Bricks`;
      row("Quantity:", qtyText);

      if (order.order_mode === 'trawli') {
        row("Fixed Trawli Rate:", `Rs. ${Number(pricePerTrawli).toLocaleString('en-IN')}`);
        row("Sold Trawli Rate:",  `Rs. ${Number(order.price_per_trawli).toLocaleString('en-IN')}`);
      }

      // ── Horizontal Line ───────────────────────────────────────────────
      checkPage();
      doc.line(15, currentY + 2, 195, currentY + 2);
      currentY += 15;

      // ── Financial Summary ─────────────────────────────────────────────
      checkPage();
      doc.setFont("helvetica", "bold");
      doc.text("Financial Summary:", leftX, currentY);
      doc.setFont("helvetica", "normal");
      currentY += 10;

      const pending = Math.round(Number(order.total_amount)) - Math.round(Number(order.paid_amount));
      row("Total Bill:",      `Rs. ${Math.round(Number(order.total_amount)).toLocaleString('en-IN')}`);
      row("Amount Paid:",     `Rs. ${Math.round(Number(order.paid_amount)).toLocaleString('en-IN')}`);
      row("Pending Balance:", `Rs. ${Math.max(0, pending).toLocaleString('en-IN')}`);
      currentY += 5;

      // ── Footer — locked to bottom of final page ───────────────────────
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.text("Thank you for buying bricks", 105, 275, { align: "center" });
      doc.text("Happy Construction",          105, 282, { align: "center" });

      // ── Universal page numbers ────────────────────────────────────────
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(`Page ${i} of ${pageCount}`, 195, 285, { align: "right" });
      }

      if (action === 'preview') {
        const pdfBlob = doc.output('blob');
        return URL.createObjectURL(pdfBlob);
      } else {
        doc.save(`SK_Bricks_Bill_${order.customer_name}.pdf`);
      }
    } catch (error) {
      alert("PDF Error: " + error.message);
      console.error(error);
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

      {/* TABS */}
      <div className="flex p-1 bg-gray-800/50 mx-4 mt-4 rounded-xl border border-gray-700">
        <button
          onClick={() => setActiveTab('new_order')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'new_order' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-gray-400 hover:text-gray-200'}`}
        >
          New Order
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-gray-400 hover:text-gray-200'}`}
        >
          Order History
        </button>
      </div>

      <div className="flex-1 px-4 py-4 pb-48 overflow-y-auto">
        {activeTab === 'new_order' && (
          <>
            <SECTION icon={User} title="Customer Details" accent="from-sky-600/80 to-blue-700/80">
              <Field label="Customer Name">
                <input type="text" placeholder="Full name" value={form.customerName} onChange={set("customerName")} className={inp} />
              </Field>
              <Field label="Mobile Number">
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="+91 XXXXX XXXXX"
                  value={form.customerMobile}
                  onChange={(e) => {
                    const sanitizedValue = e.target.value.replace(/[^0-9+]/g, '');
                    setForm({ ...form, customerMobile: sanitizedValue });
                  }}
                  className={inp}
                />
              </Field>
              <Field label="Delivery Address">
                <textarea rows={2} placeholder="Village / town / landmark" value={form.customerAddress} onChange={set("customerAddress")} className={`${inp} resize-none`} />
              </Field>
            </SECTION>

            <SECTION icon={ClipboardList} title="Internal / Sales Details" accent="from-violet-600/80 to-purple-700/80">
              <CustomDropdown label="Lead Source" options={settings.lead_sources} value={form.leadSource} onChange={set("leadSource")} placeholder="Search or type name…" zIndex="z-[60]" />
              <CustomDropdown label="Salesperson" options={settings.salespersons} value={form.salesperson} onChange={set("salesperson")} placeholder="Search or type name…" zIndex="z-50" />
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
              <CustomDropdown label="Brick Category" options={settings.brick_categories} value={form.brickCategory} onChange={set("brickCategory")} placeholder="Select category…" zIndex="z-40" />
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
              <CustomDropdown label="Payment Status" options={["Full Payment", "Partial Advance", "Pending/Udhaar"]} value={form.paymentStatus} onChange={set("paymentStatus")} placeholder="Select status…" zIndex="z-30" />
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
          </>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <p className="text-center text-gray-500 py-10">No orders found.</p>
            ) : (
              orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map(order => {
                const pending = Math.round(Number(order.total_amount)) - Math.round(Number(order.paid_amount));
                return (
                  <div key={order.id} className="bg-gray-800 border border-gray-700 rounded-2xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-white text-lg">{order.customer_name}</h3>
                        <p className="text-gray-400 text-xs">{new Date(order.order_date).toLocaleDateString()}</p>
                      </div>
                      <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded-full font-semibold">
                        ₹{Math.round(Number(order.total_amount)).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <p className="text-sm text-gray-300">
                        Pending: <span className="text-orange-400 font-bold">₹{Math.max(0, pending).toLocaleString('en-IN')}</span>
                      </p>
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const url = await generateInvoice(order, 'preview');
                          setPreviewUrl(url);
                          setSelectedOrder(order);
                        }}
                        className="bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        Bill 📄
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* PDF Preview Modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) { setPreviewUrl(null); setSelectedOrder(null); } }}
        >
          <div className="w-full sm:max-w-2xl bg-gray-900 border border-gray-700 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90dvh]">
            {/* Modal header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <p className="text-white font-semibold text-sm">📄 Bill Preview — {selectedOrder?.customer_name}</p>
              <button
                type="button"
                onClick={() => { setPreviewUrl(null); setSelectedOrder(null); }}
                className="text-gray-500 hover:text-gray-300 text-xl leading-none px-1"
              >
                ✕
              </button>
            </div>

            {/* PDF iframe */}
            <div className="flex-1 overflow-hidden">
              <iframe
                src={previewUrl}
                title="Bill Preview"
                className="w-full h-[60vh] bg-white"
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 p-4 border-t border-gray-800">
              <button
                type="button"
                onClick={() => { setPreviewUrl(null); setSelectedOrder(null); }}
                className="flex-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => { generateInvoice(selectedOrder, 'download'); setPreviewUrl(null); setSelectedOrder(null); }}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 transition-all"
              >
                ⬇ Download Bill
              </button>
            </div>
          </div>
        </div>
      )}

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
