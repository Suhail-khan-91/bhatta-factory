"use client";

import { X, AlertTriangle, CheckCircle2, Info } from "lucide-react";

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  message = "This action cannot be undone.", 
  type = "danger" 
}) {
  if (!isOpen) return null;

  const isSuccess = type === "success";
  const isDanger = type === "danger";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 text-center">
          {/* Icon */}
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            isSuccess ? "bg-emerald-500/20 text-emerald-400" : 
            isDanger ? "bg-red-500/20 text-red-400" : 
            "bg-blue-500/20 text-blue-400"
          }`}>
            {isSuccess ? <CheckCircle2 size={32} /> : 
             isDanger ? <AlertTriangle size={32} /> : 
             <Info size={32} />}
          </div>

          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">
            {message}
          </p>

          <div className="flex gap-3">
            {!isSuccess && (
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold transition-all active:scale-95"
              >
                Cancel
              </button>
            )}
            <button
              onClick={() => {
                if (typeof onConfirm === 'function') onConfirm();
                if (isSuccess && typeof onClose === 'function') onClose();
              }}
              className={`flex-1 px-4 py-3 rounded-xl text-white font-semibold transition-all active:scale-95 ${
                isSuccess ? "bg-emerald-600 hover:bg-emerald-500" : 
                isDanger ? "bg-red-600 hover:bg-red-500 shadow-lg shadow-red-600/20" : 
                "bg-blue-600 hover:bg-blue-500"
              }`}
            >
              {isSuccess ? "OK" : "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
