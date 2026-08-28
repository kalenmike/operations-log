import { useMemo } from "react";
import type { WeekEntry, Ratings } from "../types";

interface PerformanceProps {
  weeks: WeekEntry[];
  currentWeekId: string;
}

const DOMAINS: { key: keyof Ratings; label: string }[] = [
  { key: "spiritual", label: "SPI" },
  { key: "physical", label: "PHY" },
  { key: "intellectual", label: "INT" },
  { key: "emotional", label: "EMO" },
  { key: "social", label: "SOC" },
];

function average(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function StarBar({ value, max }: { value: number; max: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={`inline-block w-2 h-2 ${i < Math.round(value) ? "bg-gold-500" : "bg-parchment-200"}`}
        />
      ))}
    </div>
  );
}

export function Performance({ weeks, currentWeekId }: PerformanceProps) {
  const current = weeks.find((w) => w.id === currentWeekId);

  const ratedWeeks = useMemo(
    () =>
      weeks
        .filter((w) => (w.ratings?.spiritual ?? 0) > 0)
        .map((w) => ({
          startDate: w.startDate,
          label: w.startDate.slice(5).replace("-", "/"),
          domains: DOMAINS.map((d) => Number(w.ratings[d.key]) || 0),
          mood: average(w.dailyCheckins.map((c) => Number(c.moodRating) || 0)),
        })),
    [weeks]
  );

  const stats = useMemo(() => {
    const checkinsToday = current?.dailyCheckins.length ?? 0;
    const total = current ? current.goals.length * 7 : 0;
    const done = current
      ? current.goals.reduce((acc, g) => acc + g.done.filter(Boolean).length, 0)
      : 0;
    let streak = 0;
    for (const week of weeks) {
      if (week.dailyCheckins.length > 0) streak++;
      else break;
    }
    const avgMood = current ? average(current.dailyCheckins.map((c) => Number(c.moodRating) || 0)) : 0;
    return { checkinsToday, goalsTotal: total, goalsDone: done, streak, avgMood };
  }, [weeks, current]);

  return (
    <div className="space-y-4">
      <h2 className="text-xs uppercase tracking-[0.2em] text-ink-400 border-b border-parchment-300 pb-1">
        Performance Overview
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-sm">
        <div className="p-3 border border-parchment-200 bg-parchment-100/50">
          <div className="text-[10px] uppercase tracking-wider text-ink-400">Check-ins</div>
          <div className="text-2xl text-ink-800">
            {stats.checkinsToday}
            <span className="text-xs text-ink-400">/7</span>
          </div>
        </div>
        <div className="p-3 border border-parchment-200 bg-parchment-100/50">
          <div className="text-[10px] uppercase tracking-wider text-ink-400">Objectives</div>
          <div className="text-2xl text-ink-800">
            {stats.goalsDone}
            <span className="text-xs text-ink-400">/{stats.goalsTotal}</span>
          </div>
        </div>
        <div className="p-3 border border-parchment-200 bg-parchment-100/50">
          <div className="text-[10px] uppercase tracking-wider text-ink-400">Week Streak</div>
          <div className="text-2xl text-ink-800">{stats.streak}</div>
        </div>
        <div className="p-3 border border-parchment-200 bg-parchment-100/50">
          <div className="text-[10px] uppercase tracking-wider text-ink-400">Avg Mood</div>
          <div className="text-2xl text-ink-800">
            {stats.avgMood > 0 ? stats.avgMood.toFixed(1) : "—"}
          </div>
        </div>
      </div>

      {ratedWeeks.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="text-xs uppercase text-ink-400">
                  <th className="text-left py-1 pr-3">Week</th>
                  {DOMAINS.map(({ label }) => (
                    <th key={label} className="py-1 px-2 text-center">
                      {label}
                    </th>
                  ))}
                  <th className="py-1 pl-2 text-center">Mood</th>
                </tr>
              </thead>
              <tbody>
                {ratedWeeks.slice(0, 12).map((week, idx) => (
                  <tr
                    key={week.startDate}
                    className={`border-t border-parchment-200 ${
                      idx === 0 ? "bg-parchment-100/60 font-bold" : ""
                    }`}
                  >
                    <td className="py-2 pr-3 text-ink-700">
                      {idx === 0 ? "▶ " : ""}
                      {week.label}
                    </td>
                    {week.domains.map((d, i) => (
                      <td key={i} className="py-2 px-2">
                        <div className="flex items-center justify-center gap-1">
                          <StarBar value={d} max={5} />
                          <span className="text-xs text-ink-400">{d.toFixed(1)}</span>
                        </div>
                      </td>
                    ))}
                    <td className="py-2 pl-2 text-center text-ink-700">
                      {week.mood > 0 ? week.mood.toFixed(1) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DOMAINS.map(({ key, label }) => {
              const curr = ratedWeeks.length >= 1 ? ratedWeeks[0].domains[DOMAINS.findIndex((d) => d.key === key)] : 0;
              const prev = ratedWeeks.length >= 2 ? ratedWeeks[1].domains[DOMAINS.findIndex((d) => d.key === key)] : 0;
              const diff = curr - prev;
              return (
                <div
                  key={key}
                  className={`flex items-center justify-between p-3 border font-mono text-sm ${
                    diff > 0
                      ? "border-olive-500/50 bg-olive-500/5"
                      : diff < 0
                        ? "border-rust-500/50 bg-rust-500/5"
                        : "border-parchment-200 bg-parchment-100/30"
                  }`}
                >
                  <span className="text-ink-600 font-bold tracking-wider">{label}</span>
                  <span className="text-ink-800">
                    {curr.toFixed(1)}
                    {prev > 0 && (
                      <span
                        className={`ml-2 text-xs ${
                          diff > 0
                            ? "text-olive-600"
                            : diff < 0
                              ? "text-rust-600"
                              : "text-ink-400"
                        }`}
                      >
                        {diff > 0 ? "▲" : diff < 0 ? "▼" : "—"} {Math.abs(diff).toFixed(1)}
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <p className="text-sm text-ink-400 font-mono italic">
          No rated weeks yet. Complete a domain assessment in Plan to seed your metrics.
        </p>
      )}
    </div>
  );
}