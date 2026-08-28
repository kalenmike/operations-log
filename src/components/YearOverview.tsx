import { useState } from "react";
import type { WeekEntry } from "../types";
import { formatDate, getMonday, getWeekStartsInYear } from "../lib/dates";
import { weekStatus, type WeekStatus } from "../lib/weekStatus";

interface YearOverviewProps {
  weeks: WeekEntry[];
}

export function YearOverview({ weeks }: YearOverviewProps) {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const byStart = new Map(weeks.map((w) => [w.startDate, w]));
  const weekStarts = getWeekStartsInYear(year);
  const currentStart = formatDate(getMonday(new Date()));

  const counts = weekStarts.reduce(
    (acc, start) => {
      acc[weekStatus(byStart.get(start))] += 1;
      return acc;
    },
    { missing: 0, incomplete: 0, complete: 0 },
  );

  const cellCls: Record<WeekStatus, string> = {
    missing: "border-parchment-200 bg-parchment-100/50 text-ink-300",
    incomplete: "border-gold-500 bg-gold-500/10 text-gold-700",
    complete: "border-olive-600 bg-olive-600 text-parchment-50",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm uppercase tracking-widest font-mono text-ink-800">Annual Log</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setYear((y) => y - 1)}
            aria-label="Previous year"
            className="w-7 h-7 border border-parchment-300 text-ink-600 hover:border-ink-800 hover:text-ink-800 transition-colors cursor-pointer"
          >
            ‹
          </button>
          <span className="w-16 text-center text-sm font-mono font-bold text-ink-800">{year}</span>
          <button
            type="button"
            onClick={() => setYear((y) => y + 1)}
            aria-label="Next year"
            className="w-7 h-7 border border-parchment-300 text-ink-600 hover:border-ink-800 hover:text-ink-800 transition-colors cursor-pointer"
          >
            ›
          </button>
        </div>
      </div>

      <p className="text-xs font-mono text-ink-600 mb-3">
        {counts.complete} of {weekStarts.length} weeks complete
      </p>

      <div className="grid grid-cols-[repeat(13,minmax(0,1fr))] gap-1">
        {weekStarts.map((start, i) => {
          const status = weekStatus(byStart.get(start));
          const isCurrent = start === currentStart;
          return (
            <div
              key={start}
              title={`W${i + 1} · ${status}`}
              className={`aspect-square flex flex-col items-center justify-center border font-mono leading-none ${cellCls[status]} ${
                isCurrent ? "ring-1 ring-ink-700" : ""
              }`}
            >
              <span className="text-[8px] opacity-80">{i + 1}</span>
              {status === "complete" && <span className="text-[11px] font-bold mt-0.5">✓</span>}
              {status === "incomplete" && <span className="text-[11px] mt-0.5">◔</span>}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-[10px] uppercase tracking-wider font-mono text-ink-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 border border-parchment-300 bg-parchment-100/60 inline-block" /> Missing
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 border border-gold-500 bg-gold-500/15 inline-block text-gold-700 text-center">◔</span>{" "}
          In progress
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 border border-olive-600 bg-olive-600 inline-block text-parchment-50 text-center">✓</span>{" "}
          Complete
        </span>
      </div>
    </div>
  );
}