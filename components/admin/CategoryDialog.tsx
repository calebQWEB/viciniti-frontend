import { useEffect, useState } from "react";
import CategoryIcon from "@/components/home/CategoryIcon";
import { ICON_PATTERN } from "@/lib/adminListings";
import type { AdminCategory, ListingKind } from "@/types/admin";

// Mirrors the API's slugify: "Phones & Tablets" -> "phones-tablets"
export const slugify = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

interface Props {
  type: ListingKind;
  // Editing an existing category, or adding a new one when absent
  category?: AdminCategory;
  isPending: boolean;
  error?: string | null;
  onSave: (values: { name: string; icon: string | null }) => void;
  onCancel: () => void;
}

export default function CategoryDialog({ type, category, isPending, error, onSave, onCancel }: Props) {
  const [name, setName] = useState(category?.name ?? "");
  const [icon, setIcon] = useState(category?.icon ?? "");
  const [triedSubmit, setTriedSubmit] = useState(false);

  const trimmedIcon = icon.trim();
  const nameProblem = name.trim().length < 2 || slugify(name).length < 2 ? "Give it a name with at least two letters or numbers." : null;
  const iconProblem = trimmedIcon && !ICON_PATTERN.test(trimmedIcon) ? "Icon names are lowercase words joined by dashes, e.g. shopping-bag." : null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !isPending && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPending, onCancel]);

  const submit = () => {
    setTriedSubmit(true);
    if (!nameProblem && !iconProblem) onSave({ name: name.trim(), icon: trimmedIcon || null });
  };

  const fieldClass = (bad: boolean) =>
    `mt-1.5 w-full rounded-xl border-[1.5px] bg-earth-100 px-3 py-2.5 text-base text-gray-900 focus:bg-white focus:outline-none sm:text-[12.5px] ${
      bad ? "border-red-400" : "border-earth-200 focus:border-primary-500"
    }`;

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center bg-black/30 p-4 sm:items-center">
      <div role="dialog" aria-modal="true" aria-labelledby="category-title" className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <h2 id="category-title" className="text-[15px] font-semibold text-gray-900">
          {category ? "Edit category" : `New ${type === "item" ? "item" : "service"} category`}
        </h2>

        <label htmlFor="category-name" className="mt-4 block text-xs font-semibold text-gray-700">Name</label>
        <input
          id="category-name"
          value={name}
          maxLength={60}
          autoFocus
          aria-invalid={triedSubmit && Boolean(nameProblem)}
          onChange={(e) => setName(e.target.value)}
          placeholder={type === "item" ? "e.g. Pets & Supplies" : "e.g. Pet Care"}
          className={fieldClass(triedSubmit && Boolean(nameProblem))}
        />
        {triedSubmit && nameProblem && <p className="mt-1 text-xs text-red-600">{nameProblem}</p>}
        <p className="mt-1 text-[11.5px] text-gray-500">
          Web name:{" "}
          <span className="font-mono text-gray-700">{category ? category.slug : slugify(name) || "…"}</span>
          {category ? " (fixed, so existing links keep working)" : " (can't be changed later)"}
        </p>

        <label htmlFor="category-icon" className="mt-3 block text-xs font-semibold text-gray-700">
          Icon <span className="font-normal text-gray-500">(optional)</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            id="category-icon"
            value={icon}
            maxLength={50}
            aria-invalid={Boolean(iconProblem)}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="e.g. shopping-bag"
            className={`${fieldClass(Boolean(iconProblem))} font-mono`}
          />
          <span className="mt-1.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700" aria-label="Icon preview">
            <CategoryIcon name={trimmedIcon || null} className="h-5 w-5" />
          </span>
        </div>
        {iconProblem ? (
          <p className="mt-1 text-xs text-red-600">{iconProblem}</p>
        ) : (
          <p className="mt-1 text-[11.5px] text-gray-500">
            Any name from{" "}
            <a href="https://lucide.dev/icons/" target="_blank" rel="noreferrer" className="font-medium text-primary-600 underline">
              lucide.dev/icons
            </a>
            . A box shows when the name isn&apos;t found.
          </p>
        )}

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
            className="h-10 rounded-xl bg-primary-600 px-4 text-[13px] font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
          >
            {isPending ? "Saving…" : category ? "Save" : "Add category"}
          </button>
        </div>
      </div>
    </div>
  );
}
