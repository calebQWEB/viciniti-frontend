"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import CategoryDialog from "@/components/admin/CategoryDialog";
import CategoryIcon from "@/components/home/CategoryIcon";
import { apiErrorDetail } from "@/lib/auth";
import {
  createCategory,
  deleteCategory,
  fetchAdminCategories,
  reorderCategories,
  updateCategory,
} from "@/lib/adminListings";
import type { AdminCategory, ListingKind } from "@/types/admin";

const SECTIONS: { type: ListingKind; title: string; hint: string }[] = [
  { type: "item", title: "Item categories", hint: "For things people sell" },
  { type: "service", title: "Service categories", hint: "For services people offer" },
];

type DialogState = { type: ListingKind; category?: AdminCategory } | null;

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const { data, isError } = useQuery({ queryKey: ["admin-categories"], queryFn: fetchAdminCategories });
  const [dialog, setDialog] = useState<DialogState>(null);
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null);

  // Public pages (home chips, sell forms, browse filters) cache categories under "categories"
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  const save = useMutation({
    mutationFn: (values: { name: string; icon: string | null }) =>
      dialog?.category
        ? updateCategory(dialog.category.id, values)
        : createCategory({ ...values, type: dialog!.type }),
    onSuccess: () => {
      refresh();
      setDialog(null);
    },
  });
  const closeDialog = () => {
    setDialog(null);
    save.reset();
  };

  const toggle = useMutation({
    mutationFn: (category: AdminCategory) => updateCategory(category.id, { is_active: !category.is_active }),
    onSuccess: refresh,
    onError: (err, category) => setRowError({ id: category.id, message: apiErrorDetail(err) ?? "Couldn't save." }),
  });
  const remove = useMutation({
    mutationFn: (category: AdminCategory) => deleteCategory(category.id),
    onSuccess: refresh,
    onError: (err, category) => setRowError({ id: category.id, message: apiErrorDetail(err) ?? "Couldn't delete." }),
  });
  const reorder = useMutation({
    mutationFn: ({ type, ids }: { type: ListingKind; ids: string[] }) => reorderCategories(type, ids),
    onSuccess: (categories) => {
      queryClient.setQueryData(["admin-categories"], categories);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const move = (list: AdminCategory[], index: number, offset: -1 | 1) => {
    const ids = list.map((c) => c.id);
    [ids[index], ids[index + offset]] = [ids[index + offset], ids[index]];
    reorder.mutate({ type: list[0].type, ids });
  };

  const confirmDelete = (category: AdminCategory) => {
    if (window.confirm(`Delete "${category.name}"? Nothing uses it, and this can't be undone.`)) {
      setRowError(null);
      remove.mutate(category);
    }
  };

  const busy = reorder.isPending || toggle.isPending || remove.isPending;

  return (
    <main className="flex flex-col gap-4.5 px-4 pb-10 pt-5 sm:px-7 sm:pt-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Categories</h1>
        <p className="mt-0.5 text-[13px] text-gray-500">
          The order here is the order on the home page and in the sell forms
        </p>
      </div>

      {isError && <p className="text-[13px] text-red-600">Couldn&apos;t load categories. Try refreshing.</p>}
      {reorder.isError && <p className="text-[13px] text-red-600">Couldn&apos;t save the new order. Try again.</p>}

      {SECTIONS.map((section) => {
        const list = (data ?? []).filter((c) => c.type === section.type);
        return (
          <section key={section.type} aria-labelledby={`${section.type}-heading`} className="overflow-hidden rounded-2xl border border-earth-200 bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-earth-100 px-4 py-3">
              <div>
                <h2 id={`${section.type}-heading`} className="text-[13.5px] font-semibold text-gray-900">{section.title}</h2>
                <p className="text-[11.5px] text-gray-500">{section.hint}</p>
              </div>
              <button
                type="button"
                onClick={() => setDialog({ type: section.type })}
                className="flex h-9 items-center gap-1.5 rounded-[10px] bg-primary-600 px-3 text-xs font-semibold text-white hover:bg-primary-700"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>

            {!data ? (
              <p className="px-4 py-6 text-center text-[13px] text-gray-500">Loading…</p>
            ) : list.length === 0 ? (
              <p className="px-4 py-6 text-center text-[13px] text-gray-500">No categories yet.</p>
            ) : (
              <ol>
                {list.map((category, index) => (
                  <li key={category.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-earth-100 px-4 py-2.5 last:border-b-0">
                    <span className="flex flex-col">
                      <button
                        type="button"
                        aria-label={`Move ${category.name} up`}
                        disabled={index === 0 || busy}
                        onClick={() => move(list, index, -1)}
                        className="rounded p-0.5 text-gray-500 hover:bg-earth-100 hover:text-gray-900 disabled:opacity-30"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Move ${category.name} down`}
                        disabled={index === list.length - 1 || busy}
                        onClick={() => move(list, index, 1)}
                        className="rounded p-0.5 text-gray-500 hover:bg-earth-100 hover:text-gray-900 disabled:opacity-30"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </span>
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        category.is_active ? "bg-primary-50 text-primary-700" : "bg-gray-100 text-gray-400"
                      }`}
                      aria-hidden="true"
                    >
                      <CategoryIcon name={category.icon} className="h-4.5 w-4.5" />
                    </span>
                    <span className="min-w-0 flex-[1_1_180px]">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <span className={`text-[13px] font-medium ${category.is_active ? "text-gray-900" : "text-gray-500"}`}>
                          {category.name}
                        </span>
                        {!category.is_active && (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10.5px] font-semibold text-gray-600">Retired</span>
                        )}
                      </span>
                      <span className="block font-mono text-[11px] text-gray-500">{category.slug}</span>
                    </span>
                    <Link
                      href={`/admin/listings?${category.type === "service" ? "kind=service&" : ""}category=${category.id}`}
                      className="text-xs text-gray-600 hover:text-primary-600 hover:underline"
                    >
                      {category.usage_count} {category.type === "item" ? "listing" : "service"}
                      {category.usage_count === 1 ? "" : "s"}
                    </Link>
                    <span className="flex items-center gap-1">
                      <button
                        type="button"
                        aria-label={`Edit ${category.name}`}
                        onClick={() => setDialog({ type: category.type, category })}
                        className="rounded-lg p-2 text-gray-500 hover:bg-earth-100 hover:text-gray-900"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          setRowError(null);
                          toggle.mutate(category);
                        }}
                        className="h-8 rounded-lg border border-earth-200 px-2.5 text-xs font-semibold text-gray-700 hover:border-earth-300 disabled:opacity-50"
                      >
                        {category.is_active ? "Retire" : "Reactivate"}
                      </button>
                      {category.usage_count === 0 && (
                        <button
                          type="button"
                          aria-label={`Delete ${category.name}`}
                          disabled={busy}
                          onClick={() => confirmDelete(category)}
                          className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </span>
                    {rowError?.id === category.id && (
                      <p className="w-full text-xs text-red-600">{rowError.message}</p>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </section>
        );
      })}

      <p className="text-[11.5px] text-gray-500">
        Retired categories disappear from the sell forms and the home page, but listings already in them stay visible.
        A category can only be deleted while nothing uses it.
      </p>

      {dialog && (
        <CategoryDialog
          type={dialog.type}
          category={dialog.category}
          isPending={save.isPending}
          error={save.isError ? (apiErrorDetail(save.error) ?? "Couldn't save. Try again.") : null}
          onSave={(values) => save.mutate(values)}
          onCancel={closeDialog}
        />
      )}
    </main>
  );
}
