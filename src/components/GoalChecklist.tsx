import type { Goal } from "../types";

interface GoalChecklistProps {
  goals: Goal[];
  dayIndex: number;
  onToggle: (goalId: string) => void;
}

export function GoalChecklist({ goals, dayIndex, onToggle }: GoalChecklistProps) {
  if (goals.length === 0) {
    return (
      <p className="text-sm font-mono text-ink-400 italic">
        No objectives set for this week. Set them in the Plan tab.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs uppercase tracking-[0.2em] text-ink-400 border-b border-parchment-300 pb-1">
        Today's Objectives
      </h3>
      <div className="space-y-2">
        {goals.map((goal) => {
          const done = goal.done[dayIndex] ?? false;
          return (
            <label
              key={goal.id}
              className="flex items-center gap-3 px-3 py-2 border border-parchment-200 bg-parchment-50 cursor-pointer"
            >
              <button
                type="button"
                role="checkbox"
                aria-checked={done}
                onClick={() => onToggle(goal.id)}
                className={`w-6 h-6 border text-sm shrink-0 cursor-pointer transition-colors ${
                  done
                    ? "border-olive-600 bg-olive-500 text-parchment-50"
                    : "border-parchment-400 text-ink-300 hover:border-ink-500"
                }`}
              >
                {done ? "X" : ""}
              </button>
              <span
                className={`text-sm font-mono ${
                  done ? "text-ink-300 line-through" : "text-ink-700"
                }`}
              >
                {goal.text}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}