import { useState } from "react";
import type { DailyCheckin } from "../types";
import { getDayLabel, formatDate, formatDateDisplay, isTodayDate } from "../lib/dates";

interface DayMoodListProps {
  startDate: string;
  weekDays: Date[];
  checkins: DailyCheckin[];
}

const MOOD_LABELS: Record<number, string> = {
  0: "",
  1: "Struggling",
  2: "Low",
  3: "Steady",
  4: "Good",
  5: "Strong",
};

export function DayMoodList({ startDate, weekDays, checkins }: DayMoodListProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  void startDate;

  return (
    <div className="space-y-3">
      <div className="border-b border-parchment-300 pb-1">
        <h3 className="text-xs uppercase tracking-[0.2em] text-ink-400 font-mono">
          Daily Mood Log
        </h3>
      </div>
      <div className="divide-y divide-parchment-200 border border-parchment-300 bg-parchment-50">
        {weekDays.map((day, i) => {
          const dateStr = formatDate(day);
          const checkin = checkins.find((c) => c.date === dateStr);
          const isOpen = expanded === dateStr;
          return (
            <div key={dateStr}>
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : dateStr)}
                className="w-full flex items-center gap-3 px-3 py-2 text-left cursor-pointer hover:bg-parchment-100/60"
              >
                <span className="text-xs font-mono text-ink-400 w-8 uppercase">
                  {getDayLabel(i)}
                </span>
                <span className="text-xs font-mono text-ink-500 w-20">
                  {formatDateDisplay(dateStr).slice(0, 6)}
                  {isTodayDate(dateStr) && <span className="ml-1 text-gold-600">TODAY</span>}
                </span>
                <span className="flex-1 flex items-center gap-1">
                  {checkin && checkin.moodRating > 0 ? (
                    <>
                      <span className="text-gold-500">
                        {"★".repeat(checkin.moodRating)}
                      </span>
                      <span className="text-[10px] text-ink-400 uppercase tracking-wider font-mono">
                        {MOOD_LABELS[checkin.moodRating]}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs font-mono text-ink-300 italic">No entry</span>
                  )}
                </span>
                <span className={`text-ink-400 text-xs transition-transform ${isOpen ? "rotate-180" : ""}`}>
                  ▾
                </span>
              </button>
              {isOpen && checkin && (
                <div className="px-3 pb-3 ml-14">
                  {checkin.reflections.trim() ? (
                    <p className="text-sm font-mono text-ink-700 border-l-2 border-parchment-300 pl-3 whitespace-pre-wrap">
                      {checkin.reflections}
                    </p>
                  ) : (
                    <p className="text-xs font-mono text-ink-300 italic">No notes logged.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}