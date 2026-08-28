import type { Goal } from "../types";
import { getDayLabel } from "../lib/dates";

interface ObjectiveTrackerProps {
  goals: Goal[];
}

export function ObjectiveTracker({ goals }: ObjectiveTrackerProps) {
  const daysHit = goals.reduce((acc, g) => acc + g.done.filter(Boolean).length, 0);

  return (
    <div className="space-y-3">
      <div className="border-b border-parchment-300 pb-1 flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-[0.2em] text-ink-400 font-mono">
          Objectives
        </h3>
        {goals.length > 0 && (
          <span className="text-xs font-mono text-ink-400">
            {daysHit}/{goals.length * 7} days hit
          </span>
        )}
      </div>

      {goals.length === 0 ? (
        <p className="text-sm font-mono text-ink-400 italic">
          No objectives set for this week.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="text-xs text-ink-400">
                <th className="text-left py-1 pr-2 w-40">Objective</th>
                {Array.from({ length: 7 }, (_, i) => (
                  <th key={i} className="py-1 px-1 text-center w-10">
                    {getDayLabel(i)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {goals.map((goal) => (
                <tr key={goal.id} className="border-t border-parchment-200">
                  <td className="py-2 pr-2 text-ink-700 text-sm truncate max-w-[160px]">
                    {goal.text}
                  </td>
                  {Array.from({ length: 7 }, (_, dayIndex) => {
                    const checked = goal.done[dayIndex] ?? false;
                    return (
                      <td key={dayIndex} className="text-center py-2 px-1">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 border text-sm ${
                            checked
                              ? "border-olive-600 bg-olive-500 text-parchment-50"
                              : "border-parchment-300 bg-parchment-50 text-ink-300"
                          }`}
                        >
                          {checked ? "X" : ""}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}