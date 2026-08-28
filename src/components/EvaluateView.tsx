import type { WeekEntry } from "../types";
import { getWeekDays } from "../lib/dates";
import { DomainRatings } from "./DomainRatings";
import { ObjectiveTracker } from "./ObjectiveTracker";
import { DayMoodList } from "./DayMoodList";
import { WeekReview } from "./WeekReview";

interface EvaluateViewProps {
  week: WeekEntry;
  onChange: (week: WeekEntry) => void;
}

export function EvaluateView({ week, onChange }: EvaluateViewProps) {
  const weekDays = getWeekDays(week.startDate);

  return (
    <div className="space-y-6">
      <section className="border border-parchment-200 bg-parchment-50 p-4 sm:p-6">
        <h3 className="text-xs uppercase tracking-[0.2em] text-ink-400 border-b border-parchment-300 pb-1 mb-4">
          Week Results
        </h3>
        <div className="divide-y divide-parchment-200">
          <div className="py-4 first:pt-0">
            <DomainRatings ratings={week.ratings} readonly />
          </div>
          <div className="py-4">
            <ObjectiveTracker goals={week.goals} />
          </div>
          <div className="py-4 last:pb-0">
            <DayMoodList
              startDate={week.startDate}
              weekDays={weekDays}
              checkins={week.dailyCheckins}
            />
          </div>
        </div>
      </section>

      <section className="border border-parchment-200 bg-parchment-50 p-4 sm:p-6">
        <h3 className="text-xs uppercase tracking-[0.2em] text-ink-400 border-b border-parchment-300 pb-1 mb-4">
          Wrap Up
        </h3>
        <WeekReview week={week} onChange={onChange} />
      </section>
    </div>
  );
}