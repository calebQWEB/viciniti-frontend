import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { shortOrderId } from "@/lib/adminOrders";

interface Props {
  orderId: string;
  amount: number;
  buyerName: string;
  isPending: boolean;
  error?: string | null;
  onConfirm: (reference: string, note: string) => void;
  onCancel: () => void;
}

// Records a refund the admin already made outside the app; the buyer is notified
export default function RefundDialog({ orderId, amount, buyerName, isPending, error, onConfirm, onCancel }: Props) {
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !isPending && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPending, onCancel]);

  const fieldClass =
    "mt-1.5 w-full rounded-xl border-[1.5px] border-earth-200 bg-earth-100 px-3 py-2.5 text-base text-gray-900 focus:border-primary-500 focus:bg-white focus:outline-none sm:text-[12.5px]";

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center bg-black/30 p-4 sm:items-center">
      <div role="dialog" aria-modal="true" aria-labelledby="refund-title" className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <h2 id="refund-title" className="text-[15px] font-semibold text-gray-900">
          Mark order {shortOrderId(orderId)} refunded
        </h2>
        <p className="mt-1 text-[12.5px] text-gray-600">
          Only do this after you&apos;ve sent <b>{formatPrice(amount)}</b> back to {buyerName}. The order becomes
          &ldquo;refunded&rdquo; and they get a notification that the refund is on its way.
        </p>

        <label htmlFor="refund-reference" className="mt-4 block text-xs font-semibold text-gray-700">
          Transfer reference <span className="font-normal text-gray-500">(optional)</span>
        </label>
        <input
          id="refund-reference"
          value={reference}
          maxLength={100}
          autoFocus
          onChange={(e) => setReference(e.target.value)}
          placeholder="e.g. the bank transfer reference"
          className={fieldClass}
        />

        <label htmlFor="refund-note" className="mt-3 block text-xs font-semibold text-gray-700">
          Note <span className="font-normal text-gray-500">(optional)</span>
        </label>
        <textarea
          id="refund-note"
          rows={2}
          value={note}
          maxLength={2000}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Sent from the business account"
          className={`${fieldClass} resize-y`}
        />
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="h-10 rounded-xl border border-earth-200 px-4 text-[13px] font-semibold text-gray-700 hover:bg-earth-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reference, note)}
            disabled={isPending}
            className="h-10 rounded-xl bg-primary-600 px-4 text-[13px] font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
          >
            {isPending ? "Saving…" : "Mark refunded"}
          </button>
        </div>
      </div>
    </div>
  );
}
