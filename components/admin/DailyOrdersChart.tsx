import { useState } from "react";
import { formatNairaCompact } from "@/lib/adminOrders";
import { formatPrice } from "@/lib/utils";
import type { AdminOverview } from "@/types/admin";

// Validated single-series bar colour (passes chroma and 3:1 contrast on white)
const BAR_COLOR = "#3a8f68";
const CHART_HEIGHT = 160;

// Round the axis top up to a clean number: 1, 2 or 5 times a power of ten
const niceMax = (value: number): number => {
  if (value <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 5, 10].find((m) => m * power >= value)!;
  return step * power;
};

const dayLabel = (day: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-NG", { ...options, timeZone: "UTC" }).format(new Date(`${day}T00:00:00Z`));

export default function DailyOrdersChart({ daily }: { daily: AdminOverview["daily"] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const top = niceMax(Math.max(...daily.map((d) => d.value)));
  const ticks = [top, top / 2, 0];
  const total = daily.reduce((sum, d) => sum + d.value, 0);
  const point = hovered !== null ? daily[hovered] : null;

  return (
    <figure className="m-0">
      <figcaption className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-[13.5px] font-semibold text-gray-900">Order value per day · last 30 days</span>
        <span className="text-xs text-gray-500">{formatPrice(total)} in total</span>
      </figcaption>

      <div className="flex gap-2" aria-hidden="true">
        {/* Y axis */}
        <div className="relative w-11 shrink-0 text-right text-[10.5px] text-gray-500" style={{ height: CHART_HEIGHT }}>
          {ticks.map((tick, i) => (
            <span key={tick} className="absolute right-0 -translate-y-1/2" style={{ top: `${(i / 2) * 100}%` }}>
              {formatNairaCompact(tick)}
            </span>
          ))}
        </div>

        <div className="relative min-w-0 flex-1">
          {/* Recessive gridlines */}
          {ticks.map((tick, i) => (
            <div
              key={tick}
              className={`absolute inset-x-0 border-t ${i === 2 ? "border-earth-300" : "border-earth-100"}`}
              style={{ top: `${(i / 2) * 100}%` }}
            />
          ))}

          <div className="relative flex items-end gap-0.5" style={{ height: CHART_HEIGHT }} onMouseLeave={() => setHovered(null)}>
            {daily.map((d, i) => (
              <div
                key={d.day}
                onMouseEnter={() => setHovered(i)}
                className="flex h-full flex-1 items-end"
              >
                <div
                  className="w-full rounded-t-sm transition-opacity"
                  style={{
                    height: `${(d.value / top) * 100}%`,
                    minHeight: d.value > 0 ? 2 : 0,
                    background: BAR_COLOR,
                    opacity: hovered === null || hovered === i ? 1 : 0.45,
                  }}
                />
              </div>
            ))}

            {point && hovered !== null && (
              <div
                className="pointer-events-none absolute bottom-full z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1.5 text-[11px] text-white shadow-lg"
                style={{ left: `${((hovered + 0.5) / daily.length) * 100}%` }}
              >
                <div className="font-semibold">{dayLabel(point.day, { weekday: "short", day: "numeric", month: "short" })}</div>
                <div>
                  {formatPrice(point.value)} · {point.orders} order{point.orders === 1 ? "" : "s"}
                </div>
              </div>
            )}
          </div>

          {/* X axis: first, middle and last day */}
          <div className="mt-1.5 flex justify-between text-[10.5px] text-gray-500">
            {[0, Math.floor(daily.length / 2), daily.length - 1].map((i) => (
              <span key={i}>{dayLabel(daily[i].day, { day: "numeric", month: "short" })}</span>
            ))}
          </div>
        </div>
      </div>

      {/* The same numbers for screen readers */}
      <table className="sr-only">
        <caption>Order value per day, last 30 days</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Orders</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          {daily.map((d) => (
            <tr key={d.day}>
              <td>{dayLabel(d.day, { day: "numeric", month: "short" })}</td>
              <td>{d.orders}</td>
              <td>{formatPrice(d.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
