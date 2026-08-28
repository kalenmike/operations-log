import { useMemo, useState } from "react";
import type { WeekEntry } from "../types";
import { formatDate, getMonday, getWeekStartsInYear } from "../lib/dates";
import { weekStatus } from "../lib/weekStatus";

interface PerformanceProps {
  weeks: WeekEntry[];
}

const PLOT_W = 320;
const PLOT_H = 180;
const PAD_L = 26;
const PAD_R = 10;
const PAD_T = 10;
const PAD_B = 18;

function average(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

interface Point {
  weekNum: number;
  mood: number;
}

function linearFit(points: Point[]): { a: number; b: number } | null {
  const n = points.length;
  if (n < 2) return null;
  const sumX = points.reduce((s, p) => s + p.weekNum, 0);
  const sumY = points.reduce((s, p) => s + p.mood, 0);
  const sumXY = points.reduce((s, p) => s + p.weekNum * p.mood, 0);
  const sumXX = points.reduce((s, p) => s + p.weekNum * p.weekNum, 0);
  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return null;
  const b = (n * sumXY - sumX * sumY) / denom;
  const a = (sumY - b * sumX) / n;
  return { a, b };
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="p-3 border border-parchment-200 bg-parchment-100/50">
      <div className="text-[10px] uppercase tracking-wider text-ink-400">{label}</div>
      <div className="text-2xl text-ink-800">{value}</div>
      {sub && <div className="text-[11px] text-ink-500 mt-0.5">{sub}</div>}
    </div>
  );
}

export function Performance({ weeks }: PerformanceProps) {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const currentStart = formatDate(getMonday(new Date()));

  const { cells, points, stats } = useMemo(() => {
    const cells = getWeekStartsInYear(year);
    const byStart = new Map(weeks.map((w) => [w.startDate, w]));
    const yearWeeks = cells.map((s) => byStart.get(s)).filter((w): w is WeekEntry => Boolean(w));

    const completed = yearWeeks.filter((w) => weekStatus(w) === "complete").length;
    const logPct = cells.length ? Math.round((completed / cells.length) * 100) : 0;

    const objectiveFractions: number[] = [];
    for (const w of yearWeeks) {
      for (const g of w.goals) {
        objectiveFractions.push(g.done.filter(Boolean).length / Math.max(g.done.length, 1));
      }
    }
    const objectivePct = objectiveFractions.length
      ? Math.round(average(objectiveFractions) * 100)
      : null;

    const currentIdx = cells.indexOf(currentStart);
    const streakCursor = currentIdx >= 0 ? currentIdx : cells.length - 1;
    let streak = 0;
    for (let i = streakCursor; i >= 0; i--) {
      const w = byStart.get(cells[i]);
      if (w && weekStatus(w) !== "missing") streak++;
      else break;
    }

    const moodWeeks = yearWeeks
      .map((w) => average(w.dailyCheckins.map((c) => Number(c.moodRating) || 0)))
      .filter((m) => m > 0);
    const avgMood = moodWeeks.length ? average(moodWeeks) : null;

    const points: Point[] = [];
    cells.forEach((s, i) => {
      const w = byStart.get(s);
      if (!w) return;
      const mood = average(w.dailyCheckins.map((c) => Number(c.moodRating) || 0));
      if (mood > 0) points.push({ weekNum: i + 1, mood });
    });

    return {
      cells,
      points,
      stats: {
        logPct,
        completed,
        totalWeeks: cells.length,
        objectivePct,
        streak,
        avgMood,
      },
    };
  }, [weeks, year, currentStart]);

  const trend = useMemo(() => linearFit(points), [points]);

  const xFor = (weekNum: number) =>
    cells.length > 1
      ? PAD_L + (weekNum - 1) / (cells.length - 1) * (PLOT_W - PAD_L - PAD_R)
      : PAD_L + (PLOT_W - PAD_L - PAD_R) / 2;
  const yFor = (mood: number) => PAD_T + ((5 - mood) / 5) * (PLOT_H - PAD_T - PAD_B);

  const xTicks = useMemo(() => {
    const last = Math.max(cells.length, 1);
    return Array.from(new Set([1, Math.round(last / 4), Math.round(last / 2), Math.round((3 * last) / 4), last])).sort(
      (a, b) => a - b,
    );
  }, [cells.length]);

  const trendLine =
    trend && points.length >= 2
      ? (() => {
          const x0 = Math.min(...points.map((p) => p.weekNum));
          const x1 = Math.max(...points.map((p) => p.weekNum));
          const y0 = trend.a + trend.b * x0;
          const y1 = trend.a + trend.b * x1;
          const mTop = Math.max(0, Math.min(5, y0));
          const mBot = Math.max(0, Math.min(5, y1));
          const clamp = (m: number) => Math.max(0, Math.min(5, m));
          const c0 = clamp(mTop);
          const c1 = clamp(mBot);
          return {
            x0: xFor(x0),
            y0: yFor(c0),
            x1: xFor(x1),
            y1: yFor(c1),
            slope: trend.b,
          };
        })()
      : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-parchment-300 pb-1">
        <h2 className="text-xs uppercase tracking-[0.2em] text-ink-400">Performance Overview</h2>
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-sm">
        <StatCard
          label="Log Completion"
          value={`${stats.logPct}%`}
          sub={`${stats.completed}/${stats.totalWeeks} weeks`}
        />
        <StatCard
          label="Objective Completion"
          value={stats.objectivePct === null ? "—" : `${stats.objectivePct}%`}
          sub={stats.objectivePct === null ? "No objectives" : "avg per objective"}
        />
        <StatCard label="Week Streak" value={`${stats.streak}`} sub={stats.streak === 1 ? "week" : "weeks"} />
        <StatCard
          label="Average Mood"
          value={stats.avgMood === null ? "—" : stats.avgMood.toFixed(1)}
          sub={stats.avgMood === null ? "No check-ins" : "of 5.0"}
        />
      </div>

      <div className="p-3 border border-parchment-200 bg-parchment-100/50">
        <div className="text-[10px] uppercase tracking-wider text-ink-400 mb-2">Mood Trend</div>
        <svg viewBox={`0 0 ${PLOT_W} ${PLOT_H}`} className="w-full h-auto" role="img" aria-label="Weekly average mood with trend line">
          <rect
            x={PAD_L}
            y={PAD_T}
            width={PLOT_W - PAD_L - PAD_R}
            height={PLOT_H - PAD_T - PAD_B}
            fill="transparent"
            stroke="#e2d4b8"
          />
          {[0, 1, 2, 3, 4, 5].map((v) => (
            <line
              key={`h-${v}`}
              x1={PAD_L}
              x2={PLOT_W - PAD_R}
              y1={yFor(v)}
              y2={yFor(v)}
              stroke="#e2d4b8"
              strokeDasharray={v === 0 ? "" : "2 3"}
            />
          ))}
          {[0, 1, 2, 3, 4, 5].map((v) => (
            <text
              key={`y-${v}`}
              x={PAD_L - 4}
              y={yFor(v) + 3}
              textAnchor="end"
              className="fill-ink-400"
              fontSize="8"
              fontFamily="Courier Prime, monospace"
            >
              {v}
            </text>
          ))}
          {xTicks.map((t) => (
            <text
              key={`x-${t}`}
              x={xFor(t)}
              y={PLOT_H - PAD_B + 12}
              textAnchor="middle"
              className="fill-ink-400"
              fontSize="8"
              fontFamily="Courier Prime, monospace"
            >
              {t}
            </text>
          ))}
          <line x1={xFor(1)} x2={xFor(cells.length)} y1={PLOT_H - PAD_B} y2={PLOT_H - PAD_B} stroke="#4d4338" />
          {trendLine && (
            <line
              x1={trendLine.x0}
              y1={trendLine.y0}
              x2={trendLine.x1}
              y2={trendLine.y1}
              stroke="#a85d38"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
          )}
          {points.map((p) => (
            <rect
              key={p.weekNum}
              x={xFor(p.weekNum) - 2}
              y={yFor(p.mood) - 2}
              width="4"
              height="4"
              fill="#b8922e"
              stroke="#4d4338"
            />
          ))}
          {points.length === 0 && (
            <text
              x={PAD_L + (PLOT_W - PAD_L - PAD_R) / 2}
              y={PAD_T + (PLOT_H - PAD_T - PAD_B) / 2 + 3}
              textAnchor="middle"
              className="fill-ink-400"
              fontSize="9"
              fontFamily="Courier Prime, monospace"
            >
              NO MOOD DATA
            </text>
          )}
        </svg>
        {trendLine && (
          <div className="flex items-center gap-4 mt-2 text-[10px] uppercase tracking-wider font-mono text-ink-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 bg-gold-500 border border-ink-600" /> Week mood
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block w-4 border-t border-dashed border-rust-500" /> Trend
            </span>
            <span className="text-rust-600">{trendLine.slope >= 0 ? "▲" : "▼"} {Math.abs(trendLine.slope * 10).toFixed(1)}/10 wks</span>
          </div>
        )}
      </div>
    </div>
  );
}