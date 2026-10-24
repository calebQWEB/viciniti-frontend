import { useEffect, useState } from "react";

interface Props {
  // "suspend" asks for a reason; "unsuspend" only an optional note
  mode: "suspend" | "unsuspend";
  userName: string;
  isPending: boolean;
  error?: string | null;
  onConfirm: (values: { reason: string; note: string; notify: boolean }) => void;
  onCancel: () => void;
}

const MIN_REASON = 3;

export default function SuspendDialog({ mode, userName, isPending, error, onConfirm, onCancel }: Props) {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [notify, setNotify] = useState(true);
  const [triedSubmit, setTriedSubmit] = useState(false);
  const isSuspend = mode === "suspend";
  const reasonMissing = isSuspend && reason.trim().length < MIN_REASON;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !isPending && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPending, onCancel]);

  const submit = () => {
    setTriedSubmit(true);
    if (!reasonMissing) onConfirm({ reason, note, notify });
  };

  const fieldClass =
    "mt-1.5 w-full resize-y rounded-xl border-[1.5px] bg-earth-100 px-3 py-2.5 text-base text-gray-900 focus:bg-white focus:outline-none sm:text-[12.5px]";

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center bg-black/30 p-4 sm:items-center">
      <div role="dialog" aria-modal="true" aria-labelledby="suspend-title" className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <h2 id="suspend-title" className="text-[15px] font-semibold text-gray-900">
          {isSuspend ? `Suspend ${userName}?` : `Lift ${userName}'s suspension?`}
        </h2>
        {isSuspend ? (
          <ul className="mt-2 list-disc space-y-0.5 pl-4 text-[12.5px] text-gray-600">
            <li>They&apos;re signed out everywhere and can&apos;t sign in.</li>
            <li>Their listings, services and profile are hidden. Nothing is deleted.</li>
            <li>Their payouts are held until you lift the suspension.</li>
          </ul>
        ) : (
          <p className="mt-1 text-[12.5px] text-gray-600">
            They can sign in again, their listings and services come back, and held payouts go out on the next run.
          </p>
        )}

        {isSuspend && (
          <>
            <label htmlFor="suspend-reason" className="mt-4 block text-xs font-semibold text-gray-700">
              Reason <span className="font-normal text-gray-500">(the user sees this)</span>
            </label>
            <textarea
              id="suspend-reason"
              rows={2}
              value={reason}
              maxLength={500}
              autoFocus
              aria-invalid={triedSubmit && reasonMissing}
              aria-describedby={triedSubmit && reasonMissing ? "suspend-reason-error" : undefined}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Several buyers reported items that didn't match the listing"
              className={`${fieldClass} ${triedSubmit && reasonMissing ? "border-red-400" : "border-earth-200 focus:border-primary-500"}`}
            />
            {triedSubmit && reasonMissing && (
              <p id="suspend-reason-error" className="mt-1 text-xs text-red-600">
                Give a reason the user will see.
              </p>
            )}
          </>
        )}

        <label htmlFor="suspend-note" className="mt-3 block text-xs font-semibold text-gray-700">
          Internal note <span className="font-normal text-gray-500">(optional, admins only)</span>
        </label>
        <textarea
          id="suspend-note"
          rows={2}
          value={note}
          maxLength={2000}
          autoFocus={!isSuspend}
          onChange={(e) => setNote(e.target.value)}
          className={`${fieldClass} border-earth-200 focus:border-primary-500`}
        />

        <label className="mt-3 flex items-center gap-2 text-[12.5px] text-gray-700">
          <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="accent-primary-600" />
          Email {userName} about this
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
              isSuspend ? "bg-red-600 hover:bg-red-700" : "bg-primary-600 hover:bg-primary-700"
            }`}
          >
            {isPending ? "Saving…" : isSuspend ? "Suspend" : "Lift suspension"}
          </button>
        </div>
      </div>
    </div>
  );
}
