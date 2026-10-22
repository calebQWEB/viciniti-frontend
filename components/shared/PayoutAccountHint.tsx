"use client";

import { useEffect, useState } from "react";
import { CreditCard, X } from "lucide-react";
import BankAccountSection from "@/components/shared/BankAccountSection";
import { useHasPayoutAccount } from "@/hooks/usePayoutAccount";

// Gentle nudge on the create pages: listing works without a payout account, but earnings wait for one.
// The account is added in a dialog so the half-filled form isn't lost.
export default function PayoutAccountHint() {
  const { hasPayoutAccount, isLoading } = useHasPayoutAccount();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return (
    <>
      {!isLoading && !hasPayoutAccount && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-start gap-3">
            <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-bold text-amber-900">Add a payout account to get paid</p>
              <p className="mt-0.5 text-xs leading-5 text-amber-800">
                You can publish now, but your earnings wait until you add the bank account they
                should go to.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="shrink-0 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-amber-600"
          >
            Add payout account
          </button>
        </div>
      )}

      {/* Stays open after saving so the confirmation is visible, even though the note above disappears */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="payout-dialog-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="payout-dialog-title" className="text-lg font-black tracking-tight text-gray-900">
                  Add a payout account
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  Your form is still here. Close this when you&apos;re done.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <BankAccountSection />

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mt-6 w-full rounded-2xl bg-gray-900 py-3 text-sm font-bold text-white transition-colors hover:bg-gray-800"
            >
              {hasPayoutAccount ? "Done, back to my form" : "Close"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
