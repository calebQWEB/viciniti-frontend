import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, Copy, X } from "lucide-react";
import LevelBadge from "@/components/admin/LevelBadge";
import { apiErrorDetail } from "@/lib/auth";
import { fetchLog, fetchOpenCountForEvent, formatLogTime, reopenLog, resolveLog, timeAgo } from "@/lib/adminLogs";
import type { LogDetail } from "@/types/app_log";

const formatValue = (value: unknown): string =>
  value === null || value === undefined
    ? "—"
    : typeof value === "object"
      ? JSON.stringify(value)
      : String(value);

const alertLine = (entry: LogDetail): string | null => {
  if (entry.level !== "critical") return null;
  return entry.alert_sent ? "Sent to admins" : "Not sent (one per event per hour, or email failed)";
};

interface Props {
  id: string;
  onClose: () => void;
  onShowEvent: (event: string) => void;
  onResolveEvent: (event: string) => void;
}

export default function LogDetailPanel({ id, onClose, onShowEvent, onResolveEvent }: Props) {
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");
  const [showFullTrace, setShowFullTrace] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: entry, isLoading, isError } = useQuery({
    queryKey: ["admin-log", id],
    queryFn: () => fetchLog(id),
  });

  const isIssue = entry ? entry.level !== "info" : false;
  const { data: openForEvent } = useQuery({
    queryKey: ["admin-log-event-count", entry?.event],
    queryFn: () => fetchOpenCountForEvent(entry!.event),
    enabled: isIssue,
  });

  const onSaved = (updated: LogDetail) => {
    queryClient.setQueryData(["admin-log", id], updated);
    queryClient.invalidateQueries({ queryKey: ["admin-logs"] });
    queryClient.invalidateQueries({ queryKey: ["admin-logs-summary"] });
    queryClient.invalidateQueries({ queryKey: ["admin-log-event-count"] });
    setNote("");
  };
  const resolve = useMutation({ mutationFn: () => resolveLog(id, note), onSuccess: onSaved });
  const reopen = useMutation({ mutationFn: () => reopenLog(id), onSuccess: onSaved });
  const actionError = apiErrorDetail(resolve.error ?? reopen.error);

  const copyTraceback = async () => {
    if (!entry?.traceback) return;
    try {
      await navigator.clipboard.writeText(entry.traceback);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the text is still selectable
    }
  };

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex items-start justify-between gap-3 border-b border-earth-100 px-4 py-3.5 lg:px-5">
        <button
          type="button"
          aria-label="Back to logs"
          onClick={onClose}
          className="-ml-2 flex h-11 w-11 items-center justify-center rounded-xl text-gray-700 hover:bg-earth-100 lg:hidden"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {entry && (
            <>
              <div className="flex flex-wrap items-center gap-1.5">
                <LevelBadge level={entry.level} className="min-w-0" />
                <span className="rounded-full bg-earth-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                  {entry.category}
                </span>
                {entry.error_ref && (
                  <span className="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-[11px] text-gray-700">
                    {entry.error_ref}
                  </span>
                )}
                {isIssue && (
                  <span className={`text-[11px] font-semibold ${entry.resolved_at ? "text-primary-600" : "text-red-700"}`}>
                    ● {entry.resolved_at ? "Resolved" : "Open"}
                  </span>
                )}
              </div>
              <h2 className="break-all font-mono text-[14.5px] font-medium text-gray-900">{entry.event}</h2>
              <p className="text-[13px] text-gray-700">{entry.message}</p>
            </>
          )}
        </div>
        <button
          type="button"
          aria-label="Close detail"
          onClick={onClose}
          className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-earth-100 text-gray-600 hover:bg-earth-200 lg:flex"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {isLoading && <p className="px-5 py-6 text-[12.5px] text-gray-500">Loading…</p>}
      {isError && <p className="px-5 py-6 text-[12.5px] text-red-600">Couldn&apos;t load this entry.</p>}

      {entry && (
        <div className="flex flex-1 flex-col gap-4.5 px-4 py-4 lg:px-5">
          <dl className="grid grid-cols-[88px_minmax(0,1fr)] gap-x-3 gap-y-2 text-[12.5px]">
            <dt className="text-gray-500">When</dt>
            <dd className="text-gray-900">
              {formatLogTime(entry.created_at)} <span className="text-gray-500">({timeAgo(entry.created_at)})</span>
            </dd>
            {entry.request_path && (
              <>
                <dt className="text-gray-500">Request</dt>
                <dd className="text-gray-900">
                  <span className="break-all font-mono text-[11.5px]">
                    {entry.request_method} {entry.request_path}
                  </span>
                  {entry.status_code && <> · {entry.status_code}</>}
                </dd>
              </>
            )}
            {entry.user && (
              <>
                <dt className="text-gray-500">User</dt>
                <dd className="text-gray-900">
                  {entry.user.name}
                  <br />
                  <span className="break-all text-gray-500">{entry.user.email}</span>
                </dd>
              </>
            )}
            {alertLine(entry) && (
              <>
                <dt className="text-gray-500">Alert email</dt>
                <dd className="text-gray-900">{alertLine(entry)}</dd>
              </>
            )}
          </dl>

          {entry.details && Object.keys(entry.details).length > 0 && (
            <div>
              <h3 className="mb-2 text-[11px] font-semibold tracking-wide text-gray-500">DETAILS</h3>
              <dl className="overflow-hidden rounded-xl border border-earth-200 text-xs">
                {Object.entries(entry.details).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-[130px_minmax(0,1fr)] gap-2.5 border-b border-earth-100 px-3 py-2 last:border-b-0">
                    <dt className="break-all font-mono text-[11.5px] text-gray-500">{key}</dt>
                    <dd className="break-words text-gray-900">{formatValue(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {entry.traceback ? (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-[11px] font-semibold tracking-wide text-gray-500">TRACEBACK</h3>
                <button
                  type="button"
                  onClick={copyTraceback}
                  className="flex h-8 items-center gap-1.5 rounded-[10px] border border-earth-200 bg-white px-2.5 text-[11.5px] font-semibold text-gray-700 hover:bg-earth-50"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <pre
                className={`overflow-auto rounded-xl bg-gray-900 p-3 font-mono text-[10.5px] leading-relaxed text-gray-200 ${
                  showFullTrace ? "" : "max-h-64"
                }`}
              >
                {entry.traceback}
              </pre>
              <button
                type="button"
                onClick={() => setShowFullTrace((v) => !v)}
                className="mt-1.5 text-xs font-semibold text-primary-600 hover:text-primary-800"
              >
                {showFullTrace ? "Show less" : "Show full traceback"}
              </button>
            </div>
          ) : (
            isIssue && (
              <p className="rounded-xl border border-dashed border-earth-300 bg-earth-50 px-3 py-2.5 text-xs text-gray-500">
                No traceback: this failure was handled, not a crash.
              </p>
            )
          )}

          {isIssue && openForEvent !== undefined && openForEvent > 1 && (
            <p className="flex gap-2 rounded-xl bg-primary-50 px-3 py-2.5 text-xs text-primary-700">
              <span className="font-bold">{openForEvent}</span>
              <span>
                open entries share this event.{" "}
                <button type="button" onClick={() => onShowEvent(entry.event)} className="font-semibold underline">
                  See them all
                </button>
              </span>
            </p>
          )}

          {isIssue && (
            <div className="mt-auto flex flex-col gap-2 border-t border-earth-100 pt-3.5">
              {entry.resolved_at ? (
                <div className="flex flex-col gap-1 rounded-xl border border-primary-100 bg-primary-50 px-3.5 py-3 text-[12.5px]">
                  <span className="text-primary-800">
                    <b>Resolved</b>
                    {entry.resolver && <> by {entry.resolver.name}</>} · {formatLogTime(entry.resolved_at)}
                  </span>
                  {entry.resolution_note && (
                    <span className="whitespace-pre-line text-primary-700">&ldquo;{entry.resolution_note}&rdquo;</span>
                  )}
                  <button
                    type="button"
                    onClick={() => reopen.mutate()}
                    disabled={reopen.isPending}
                    className="mt-1 self-start text-xs font-semibold text-primary-600 underline disabled:opacity-60"
                  >
                    {reopen.isPending ? "Reopening…" : "Reopen"}
                  </button>
                </div>
              ) : (
                <>
                  <label htmlFor="resolve-note" className="text-xs font-semibold text-gray-700">
                    Resolution note <span className="font-normal text-gray-500">(optional)</span>
                  </label>
                  <textarea
                    id="resolve-note"
                    rows={3}
                    value={note}
                    maxLength={2000}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="What did you do about it?"
                    className="w-full resize-y rounded-xl border-[1.5px] border-earth-200 bg-earth-100 px-3 py-2.5 text-base text-gray-900 focus:border-primary-500 focus:bg-white focus:outline-none sm:text-[12.5px]"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => resolve.mutate()}
                      disabled={resolve.isPending}
                      className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary-600 text-[13px] font-semibold text-white hover:bg-primary-700 disabled:opacity-60 lg:h-10"
                    >
                      <Check className="h-3.5 w-3.5" />
                      {resolve.isPending ? "Resolving…" : "Mark resolved"}
                    </button>
                    {openForEvent !== undefined && openForEvent > 1 && (
                      <button
                        type="button"
                        onClick={() => onResolveEvent(entry.event)}
                        className="h-11 rounded-xl border border-earth-200 bg-white px-3.5 text-[12.5px] font-semibold text-gray-700 hover:border-primary-300 hover:text-primary-600 lg:h-10"
                      >
                        Resolve all {openForEvent}
                      </button>
                    )}
                  </div>
                </>
              )}
              {actionError && <p className="text-xs text-red-600">{actionError}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
