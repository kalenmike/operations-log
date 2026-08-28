import type { DailyCheckin, Goal, WeekEntry } from "../types";
import {
  getWeekDays,
  formatDate,
  getDayLabel,
  isTodayDate,
} from "../lib/dates";
import { DayLogCard } from "./DailyCheckin";

interface ExecuteViewProps {
  week: WeekEntry;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  getCheckin: (date: string) => DailyCheckin;
  onCheckinChange: (checkin: DailyCheckin) => void;
  onDeleteCheckin: (date: string) => void;
  onToggleGoal: (goalId: string) => void;
  prevWeekQuote?: string;
}

export function ExecuteView({
  week,
  selectedDate,
  onSelectDate,
  getCheckin,
  onCheckinChange,
  onDeleteCheckin,
  onToggleGoal,
  prevWeekQuote,
}: ExecuteViewProps) {
  const weekDays = getWeekDays(week.startDate);
  const dayIndex = weekDays.findIndex((d) => formatDate(d) === selectedDate);
  const effectiveIndex = dayIndex >= 0 ? dayIndex : 0;
  const activeDate = formatDate(weekDays[effectiveIndex]);
  const goals: Goal[] = week.goals;
  const quote = prevWeekQuote?.trim() ?? "";

  return (
    <div className="space-y-4">
      <section className="border border-parchment-200 bg-parchment-50 p-3 sm:p-4">
        <h3 className="text-xs uppercase tracking-[0.2em] text-ink-400 font-mono mb-3 border-b border-parchment-300 pb-1">
          Mission Brief
        </h3>
        <div className={`grid gap-3 ${quote ? "sm:grid-cols-2" : ""}`}>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-gold-600 font-mono mb-1">
              Weekly Goal
            </div>
            <p className="text-sm font-mono text-ink-700">
              {week.weeklyGoal.trim() || (
                <span className="italic text-ink-300">None set for this week.</span>
              )}
            </p>
          </div>
          {quote && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gold-600 font-mono mb-1">
                Words to Carry Over
              </div>
              <p className="text-sm font-mono text-ink-600 italic whitespace-pre-wrap">
                “{quote}”
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[220px_1fr]">
      <aside className="order-2 lg:order-1">
        <div className="border border-parchment-200 bg-parchment-50 p-3 lg:sticky lg:top-4">
          <h3 className="text-xs uppercase tracking-[0.2em] text-ink-400 mb-3 font-mono">
            Execution Days
          </h3>
          <div className="flex lg:flex-col flex-wrap lg:flex-nowrap gap-1">
            {weekDays.map((day, i) => {
              const dateStr = formatDate(day);
              const checkin = week.dailyCheckins.find((c) => c.date === dateStr);
              const hasData = checkin && (checkin.reflections !== "" || checkin.moodRating > 0);
              const isActive = dateStr === activeDate;
              const isToday = isTodayDate(dateStr);
              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => onSelectDate(dateStr)}
                  className={`flex items-center gap-2 px-2 py-1.5 font-mono text-sm text-left border cursor-pointer transition-colors ${
                    isActive
                      ? "border-ink-800 bg-ink-800 text-parchment-100"
                      : "border-parchment-200 bg-parchment-50 text-ink-600 hover:border-ink-400"
                  }`}
                >
                  <span
                    className={`text-xs w-8 uppercase ${
                      isActive
                        ? "text-parchment-300"
                        : isToday
                          ? "text-ink-800 font-bold"
                          : "text-ink-400"
                    }`}
                  >
                    {getDayLabel(i)}
                  </span>
                  <span
                    className={`text-xs ${isToday && !isActive ? "font-bold text-ink-800" : ""}`}
                  >
                    {dateStr.slice(5)}
                  </span>
                  <span className={`ml-auto text-xs ${isActive ? "text-parchment-300" : ""}`}>
                    {hasData ? (
                      <span className="text-gold-500">{"★".repeat(Math.min(checkin.moodRating, 3))}</span>
                    ) : isToday ? (
                      <span className="text-ink-300">○</span>
                    ) : (
                      <span className="text-ink-200">·</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      <div className="order-1 lg:order-2">
        <DayLogCard
          key={activeDate}
          date={activeDate}
          dayIndex={effectiveIndex}
          goals={goals}
          checkin={getCheckin(activeDate)}
          onChange={onCheckinChange}
          onToggleGoal={onToggleGoal}
          onDelete={() => onDeleteCheckin(activeDate)}
        />
      </div>
      </section>
    </div>
  );
}