import { useEffect, useState } from "react";

interface Props {
  // "remove" asks for a reason; "restore" only whether to email
  mode: "remove" | "restore";
  // "listing" or "service", as the seller calls it
  word: string;
  title: string;
  sellerName: string;
  isPending: boolean;
  error?: string | null;
  onConfirm: (values: { reason: string; notify: boolean }) => void;
  onCancel: () => void;
}

const MIN_REASON = 3;

export default function RemoveListingDialog({ mode, word, title, sellerName, isPending, error, onConfirm, onCancel }: Props) {
  const [reason, setReason] = useState("");
  const [notify, setNotify] = useState(true);
  const [triedSubmit, setTriedSubmit] = useState(false);
  const isRemove = mode === "remove";
  const reasonMissing = isRemove && reason.trim().length < MIN_REASON;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !isPending && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPending, onCancel]);

  const submit = () => {
    setTriedSubmit(true);
    if (!reasonMissing) onConfirm({ reason, notify });
  };

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center bg-black/30 p-4 sm:items-center">
      <div role="dialog" aria-modal="true" aria-labelledby="remove-title" className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <h2 id="remove-title" className="text-[15px] font-semibold text-gray-900">
          {isRemove ? `Remove this ${word}?` : `Restore this ${word}?`}
        </h2>
        <p className="mt-0.5 truncate text-[12.5px] font-medium text-gray-700">{title}</p>
        {isRemove ? (
          <ul className="mt-2 list-disc space-y-0.5 pl-4 text-[12.5px] text-gray-600">
            <li>It disappears from browse, search, the home page and {sellerName}&apos;s profile.</li>
            <li>No new orders or bookings, and unpaid orders can&apos;t be paid. Paid orders carry on.</li>
            <li>{sellerName} still sees it, marked removed with your reason, but can&apos;t edit it.</li>
          </ul>
        ) : (
          <p className="mt-2 text-[12.5px] text-gray-600">
            It becomes visible again and {sellerName} can edit it as normal. They get a notification.
          </p>
        )}

        {isRemove && (
          <>
            <label htmlFor="remove-reason" className="mt-4 block text-xs font-semibold text-gray-700">
              Reason <span className="font-normal text-gray-500">(the seller sees this)</span>
            </label>
            <textarea
              id="remove-reason"
              rows={2}
              value={reason}
              maxLength={500}
              autoFocus
              aria-invalid={triedSubmit && reasonMissing}
              aria-describedby={triedSubmit && reasonMissing ? "remove-reason-error" : undefined}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Counterfeit goods aren't allowed on Junction"
              className={`mt-1.5 w-full resize-y rounded-xl border-[1.5px] bg-earth-100 px-3 py-2.5 text-base text-gray-900 focus:bg-white focus:outline-none sm:text-[12.5px] ${
                triedSubmit && reasonMissing ? "border-red-400" : "border-earth-200 focus:border-primary-500"
              }`}
            />
            {triedSubmit && reasonMissing && (
              <p id="remove-reason-error" className="mt-1 text-xs text-red-600">
                Give a reason the seller will see.
              </p>
            )}
          </>
        )}

        <label className="mt-3 flex items-center gap-2 text-[12.5px] text-gray-700">
          <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="accent-primary-600" />
          Email {sellerName} about this
        </label>

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
            onClick={submit}
            disabled={isPending}
            className={`h-10 rounded-xl px-4 text-[13px] font-semibold text-white disabled:opacity-60 ${
              isRemove ? "bg-red-600 hover:bg-red-700" : "bg-primary-600 hover:bg-primary-700"
            }`}
          >
            {isPending ? "Saving…" : isRemove ? "Remove" : "Restore"}
          </button>
        </div>
      </div>
    </div>
  );
}
