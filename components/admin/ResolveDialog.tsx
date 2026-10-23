import { useEffect, useState } from "react";

interface Props {
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  isPending: boolean;
  error?: string | null;
  onConfirm: (note: string) => void;
  onCancel: () => void;
}

// Asks for an optional note before resolving several entries at once
export default function ResolveDialog({ title, description, confirmLabel, isPending, error, onConfirm, onCancel }: Props) {
  const [note, setNote] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !isPending && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPending, onCancel]);

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center bg-black/30 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="resolve-dialog-title"
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
      >
        <h2 id="resolve-dialog-title" className="text-[15px] font-semibold text-gray-900">
          {title}
        </h2>
        <div className="mt-1 text-[12.5px] text-gray-600">{description}</div>

        <label htmlFor="bulk-note" className="mt-4 block text-xs font-semibold text-gray-700">
          Resolution note <span className="font-normal text-gray-500">(optional)</span>
        </label>
        <textarea
          id="bulk-note"
          rows={3}
          value={note}
          maxLength={2000}
          autoFocus
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Whitelisted the server IP on Flutterwave"
          className="mt-1.5 w-full resize-y rounded-xl border-[1.5px] border-earth-200 bg-earth-100 px-3 py-2.5 text-base text-gray-900 focus:border-primary-500 focus:bg-white focus:outline-none sm:text-[12.5px]"
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
            onClick={() => onConfirm(note)}
            disabled={isPending}
            className="h-10 rounded-xl bg-primary-600 px-4 text-[13px] font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
          >
            {isPending ? "Resolving…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
