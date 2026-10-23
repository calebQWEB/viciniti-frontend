import LevelBadge from "@/components/admin/LevelBadge";
import { timeAgo } from "@/lib/adminLogs";
import type { LogListItem, PaginatedLogs } from "@/types/app_log";

// Only unresolved problems can be resolved, so only they get a checkbox
export const isSelectable = (item: LogListItem) => item.level !== "info" && !item.resolved_at;

const subline = (item: LogListItem) =>
  item.request_path ? `${item.request_method} ${item.request_path} · ${item.message}` : item.message;

interface Props {
  data: PaginatedLogs;
  selectedId: string | null;
  checkedIds: Set<string>;
  onToggleChecked: (id: string) => void;
  onToggleAll: (ids: string[], checked: boolean) => void;
  onOpen: (id: string) => void;
  onPage: (page: number) => void;
}

export default function LogList({ data, selectedId, checkedIds, onToggleChecked, onToggleAll, onOpen, onPage }: Props) {
  const selectableIds = data.items.filter(isSelectable).map((item) => item.id);
  const allChecked = selectableIds.length > 0 && selectableIds.every((id) => checkedIds.has(id));
  const first = (data.page - 1) * data.limit + 1;
  const last = Math.min(data.page * data.limit, data.total);

  return (
    <section aria-label="Log entries" className="overflow-hidden rounded-2xl border border-earth-200 bg-white max-md:border-0 max-md:bg-transparent">
      {/* Desktop: table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-190 border-collapse text-[12.5px]">
          <thead>
            <tr className="bg-earth-50 text-left text-[11px] font-semibold tracking-wide text-gray-500">
              <th scope="col" className="w-9 py-2.5 pl-4">
                <input
                  type="checkbox"
                  aria-label="Select all open entries on this page"
                  checked={allChecked}
                  disabled={selectableIds.length === 0}
                  onChange={(e) => onToggleAll(selectableIds, e.target.checked)}
                  className="accent-primary-600"
                />
              </th>
              <th scope="col" className="w-23 px-3 py-2.5">LEVEL</th>
              <th scope="col" className="px-3 py-2.5">EVENT</th>
              <th scope="col" className="w-40 px-3 py-2.5">USER</th>
              <th scope="col" className="w-30 py-2.5 pl-3 pr-4 text-right">WHEN</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => {
              const isSelected = item.id === selectedId;
              return (
                <tr
                  key={item.id}
                  onClick={() => onOpen(item.id)}
                  className={`cursor-pointer border-t border-earth-100 align-top ${
                    isSelected ? "bg-primary-50 shadow-[inset_3px_0_0_var(--color-primary-500)]" : "hover:bg-earth-50"
                  } ${item.resolved_at ? "opacity-70" : ""}`}
                >
                  <td className="py-2.75 pl-4" onClick={(e) => e.stopPropagation()}>
                    {isSelectable(item) && (
                      <input
                        type="checkbox"
                        aria-label={`Select ${item.event}`}
                        checked={checkedIds.has(item.id)}
                        onChange={() => onToggleChecked(item.id)}
                        className="accent-primary-600"
                      />
                    )}
                  </td>
                  <td className="px-3 py-2.75">
                    <LevelBadge level={item.level} />
                  </td>
                  <td className="max-w-0 px-3 py-2.75">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpen(item.id);
                        }}
                        className="font-mono text-xs font-medium text-gray-900 hover:text-primary-600"
                      >
                        {item.event}
                      </button>
                      {item.error_ref && (
                        <span className="rounded-md bg-gray-100 px-1.5 font-mono text-[11px] text-gray-700">
                          {item.error_ref}
                        </span>
                      )}
                      {item.resolved_at && (
                        <span className="text-[11px] font-semibold text-primary-600">Resolved</span>
                      )}
                    </div>
                    <div className="mt-0.5 truncate text-gray-600">{subline(item)}</div>
                  </td>
                  <td className="truncate px-3 py-2.75 text-gray-700">{item.user?.name ?? "—"}</td>
                  <td className="whitespace-nowrap py-2.75 pl-3 pr-4 text-right text-gray-500">
                    {timeAgo(item.created_at)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Phones: cards */}
      <ul className="flex flex-col gap-2 md:hidden">
        {data.items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onOpen(item.id)}
              className={`flex w-full flex-col gap-1 rounded-2xl border bg-white px-3.5 py-3 text-left ${
                item.id === selectedId ? "border-primary-300" : "border-earth-200"
              } ${item.resolved_at ? "opacity-70" : ""}`}
            >
              <span className="flex w-full items-center justify-between gap-2">
                <LevelBadge level={item.level} className="min-w-0" />
                <span className="text-[11px] text-gray-500">
                  {item.resolved_at ? "Resolved · " : ""}
                  {timeAgo(item.created_at)}
                </span>
              </span>
              <span className="font-mono text-xs font-medium text-gray-900">{item.event}</span>
              <span className="w-full truncate text-xs text-gray-600">
                {item.error_ref ? `${item.error_ref} · ` : ""}
                {subline(item)}
              </span>
              {item.user && <span className="text-[11px] text-gray-500">{item.user.name}</span>}
            </button>
          </li>
        ))}
      </ul>

      {data.total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-earth-100 px-4 py-2.5 text-xs text-gray-500 max-md:mt-3 max-md:border-0 max-md:px-0">
          <span>
            Showing {first}–{last} of {data.total}
          </span>
          <nav aria-label="Pages" className="flex items-center gap-2">
            <button
              type="button"
              disabled={data.page <= 1}
              onClick={() => onPage(data.page - 1)}
              className="h-9 rounded-lg border border-earth-200 bg-white px-3 text-gray-700 disabled:text-gray-400 md:h-7.5"
            >
              Previous
            </button>
            <span>
              Page {data.page} of {data.total_pages}
            </span>
            <button
              type="button"
              disabled={data.page >= data.total_pages}
              onClick={() => onPage(data.page + 1)}
              className="h-9 rounded-lg border border-earth-200 bg-white px-3 text-gray-700 disabled:text-gray-400 md:h-7.5"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </section>
  );
}
