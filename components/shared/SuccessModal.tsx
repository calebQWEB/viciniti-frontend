"use client";

import { CheckCircle } from "lucide-react";

interface SuccessModalProps {
  title: string;
  message: string;
  buttonText: string;
  onClose: () => void;
}

export default function SuccessModal({
  title,
  message,
  buttonText,
  onClose,
}: SuccessModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-[32px] p-10 max-w-sm w-full text-center shadow-2xl">
        {/* Animated checkmark */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 bg-emerald-100 rounded-3xl animate-ping opacity-30" />
          <div className="relative w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center border border-emerald-100">
            <CheckCircle className="w-9 h-9 text-emerald-500" />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest mb-4">
          Success
        </div>

        <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
          {title}
        </h2>
        <p className="text-gray-400 font-medium text-sm mb-8">{message}</p>

        <button
          onClick={onClose}
          className="w-full py-3.5 bg-[#2D6A4F] hover:bg-[#1b4332] text-white font-black rounded-2xl shadow-lg shadow-[#2D6A4F]/20 transition-all active:scale-[0.98]"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
