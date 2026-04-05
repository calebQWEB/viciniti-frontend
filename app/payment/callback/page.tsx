"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import api from "@/lib/api";
import {
  CheckCircle,
  XCircle,
  Loader2,
  ArrowUpRight,
  Home,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

type CallbackStatus = "verifying" | "success" | "failed";

export default function PaymentCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<CallbackStatus>("verifying");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      // Flutterwave appends ?status=successful&tx_ref=...&transaction_id=... to the redirect URL
      const flwStatus = searchParams.get("status");
      const txRef = searchParams.get("tx_ref");

      // If Flutterwave says it failed before we even verify, show failure immediately
      if (flwStatus !== "successful" || !txRef) {
        setStatus("failed");
        setErrorMessage("Payment was not completed.");
        return;
      }

      // Get the reference we stored before redirecting
      const reference = localStorage.getItem("payment_reference");

      if (!reference) {
        setStatus("failed");
        setErrorMessage("Payment reference not found. Please contact support.");
        return;
      }

      try {
        const response = await api.post("/transactions/verify-payment", {
          reference,
        });

        if (response.data.status === "success") {
          setStatus("success");
          // Clean up localStorage
          localStorage.removeItem("payment_reference");
          localStorage.removeItem("payment_type");
        } else {
          setStatus("failed");
          setErrorMessage(
            "Payment verification failed. Please contact support.",
          );
        }
      } catch (error: any) {
        setStatus("failed");
        setErrorMessage(
          error.response?.data?.detail ||
            "Something went wrong during verification.",
        );
      }
    };

    verify();
  }, [searchParams]);

  return (
    <MainLayout>
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Verifying state */}
          {status === "verifying" && (
            <div className="bg-white border border-gray-100 rounded-[32px] p-12 text-center shadow-sm">
              <div className="w-20 h-20 bg-[#2D6A4F]/8 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-9 h-9 text-[#2D6A4F] animate-spin" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
                Verifying Payment
              </h2>
              <p className="text-gray-400 font-medium text-sm">
                Please hold on while we confirm your payment with Flutterwave...
              </p>
            </div>
          )}

          {/* Success state */}
          {status === "success" && (
            <div className="bg-white border border-gray-100 rounded-[32px] p-12 text-center shadow-sm">
              {/* Animated checkmark */}
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-emerald-100 rounded-3xl animate-ping opacity-30" />
                <div className="relative w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center border border-emerald-100">
                  <CheckCircle className="w-9 h-9 text-emerald-500" />
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest mb-4">
                Payment Confirmed
              </div>

              <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
                You're all set! 🎉
              </h2>
              <p className="text-gray-400 font-medium text-sm mb-8">
                Your payment was successful. The seller has been notified and
                will be in touch shortly.
              </p>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => router.push("/dashboard/purchases")}
                  className="group w-full py-3.5 bg-[#2D6A4F] hover:bg-[#1b4332] text-white font-black rounded-2xl shadow-lg shadow-[#2D6A4F]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  View My Purchases
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </button>
                <button
                  onClick={() => router.push("/browse/items")}
                  className="w-full py-3.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Continue Browsing
                </button>
              </div>
            </div>
          )}

          {/* Failed state */}
          {status === "failed" && (
            <div className="bg-white border border-gray-100 rounded-[32px] p-12 text-center shadow-sm">
              <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-rose-100">
                <XCircle className="w-9 h-9 text-rose-400" />
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-500 text-[10px] font-bold uppercase tracking-widest mb-4">
                Payment Failed
              </div>

              <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
                Something went wrong
              </h2>
              <p className="text-gray-400 font-medium text-sm mb-2">
                {errorMessage}
              </p>
              <p className="text-gray-300 text-xs mb-8">
                No charges have been made to your account.
              </p>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => router.back()}
                  className="group w-full py-3.5 bg-[#2D6A4F] hover:bg-[#1b4332] text-white font-black rounded-2xl shadow-lg shadow-[#2D6A4F]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  Try Again
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="w-full py-3.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
