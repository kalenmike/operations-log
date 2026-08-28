import type { DailyCheckin, Goal, Rating } from "../types";
import { MoodRating } from "./MoodRating";
import { TextInput } from "./TextInput";
import { GoalChecklist } from "./GoalChecklist";

interface DayLogCardProps {
  date: string;
  dayIndex: number;
  goals: Goal[];
  checkin: DailyCheckin;
  onChange: (checkin: DailyCheckin) => void;
  onToggleGoal: (goalId: string) => void;
  onDelete: () => void;
}

export function DayLogCard({
  date,
  dayIndex,
  goals,
  checkin,
  onChange,
  onToggleGoal,
  onDelete,
}: DayLogCardProps) {
  const hasData =
    checkin.reflections !== "" || checkin.moodRating > 0;

  return (
    <div className="border border-parchment-200 bg-parchment-50 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <a
            id={`day-${date}`}
            className="text-sm uppercase tracking-[0.25em] text-ink-700 font-mono block"
          >
            Day {dayIndex + 1} — {date.slice(5)}
          </a>
          {hasData && !checkin.reflections && (
            <span className="text-[10px] text-gold-600 font-mono uppercase tracking-widest">
              Mood only
            </span>
          )}
        </div>
        {hasData && (
          <button
            type="button"
            onClick={onDelete}
            className="text-[10px] text-rust-500 hover:text-rust-600 uppercase tracking-widest font-mono cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>
      <div className="space-y-4">
        <GoalChecklist goals={goals} dayIndex={dayIndex} onToggle={onToggleGoal} />
        <TextInput
          label="Daily Reflections"
          value={checkin.reflections}
          onChange={(v) => onChange({ ...checkin, reflections: v })}
          multiline
          rows={5}
          placeholder="Log your reflections for the day..."
        />
        <MoodRating
          value={checkin.moodRating}
          onChange={(v: Rating) => onChange({ ...checkin, moodRating: v })}
        />
      </div>
    </div>
  );
}