import type { Goal } from "../types";
import { getDayLabel } from "../lib/dates";
import { useLang } from "../lib/i18n";

interface ObjectiveTrackerProps {
    goals: Goal[];
    onCarryGoal?: (goal: Goal) => void;
}

function Cell({ checked, dayLabel, compact }: { checked: boolean; dayLabel: string; compact?: boolean }) {
    return (
        <span
            title={dayLabel}
            className={`relative inline-flex items-center justify-center border leading-none select-none ${compact ? "min-w-0 w-full h-full" : "w-7 h-7"
                } ${checked
                    ? "border-olive-600 bg-olive-500 text-parchment-50"
                    : "border-parchment-300 bg-parchment-50 text-ink-300"
                }`}
        >
            {checked ? "X" : ""}
        </span>
    );
}

export function ObjectiveTracker({ goals, onCarryGoal }: ObjectiveTrackerProps) {
    const { t } = useLang();
    const DAYS = Array.from({ length: 7 }, (_, i) => getDayLabel(i));
    const daysHit = goals.reduce((acc, g) => acc + g.done.filter(Boolean).length, 0);

    const carryControl = (goal: Goal) => {
        if (!onCarryGoal) return null;
        if (goal.carriedToNext) {
            return (
                <span
                    className="shrink-0 text-[10px] font-mono uppercase tracking-widest text-olive-600 border border-olive-600/40 px-1.5 py-0.5"
                    title={t("tracker.pushedTitle")}
                >
                    {t("tracker.carried")}
                </span>
            );
        }
        const incomplete = goal.done.length > 0 && !goal.done.every(Boolean);
        return (
            <button
                type="button"
                onClick={() => onCarryGoal(goal)}
                aria-label={t("tracker.carryAria", { text: goal.text })}
                className="shrink-0 text-[10px] font-mono uppercase tracking-widest text-ink-500 border border-parchment-300 px-1.5 py-0.5 hover:border-ink-500 hover:text-ink-700 cursor-pointer disabled:opacity-40 disabled:cursor-default"
                disabled={!incomplete}
                title={incomplete ? t("tracker.carryTitle") : t("tracker.doneTitle")}
            >
                {t("tracker.carry")}
            </button>
        );
    };

    return (
        <div className="space-y-3">
            <div className="border-b border-parchment-300 pb-1 flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-[0.2em] text-ink-400 font-mono">
                    {t("week.objectives")}
                </h3>
                {goals.length > 0 && (
                    <span className="text-xs font-mono text-ink-400">
                        {t("tracker.hitRate", { pct: (daysHit / goals.length * 7).toFixed(0) })}
                    </span>
                )}
            </div>

            {goals.length === 0 ? (
                <p className="text-sm font-mono text-ink-400 italic">
                    {t("tracker.none")}
                </p>
            ) : (
                <>
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-sm font-mono">
                            <thead>
                                <tr className="text-xs text-ink-400">
                                    <th className="text-left py-1 pr-2 w-40">{t("tracker.objectiveCol")}</th>
                                    {DAYS.map((d, i) => (
                                        <th key={i} className="py-1 px-1 text-center w-10">
                                            {d}
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
                                        {DAYS.map((d, dayIndex) => (
                                            <td key={dayIndex} className="text-center py-2 px-1">
                                                <Cell checked={goal.done[dayIndex] ?? false} dayLabel={d} />
                                            </td>
                                        ))}
<td className="py-2 pl-2 text-right whitespace-nowrap">
    {carryControl(goal)}
</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="sm:hidden space-y-2">
                        {goals.map((goal) => (
                            <div key={goal.id} className="border border-parchment-200">
                                <div className="px-3 py-1.5 flex items-center justify-between gap-2 border-b border-parchment-200 bg-parchment-100/40">
                                    <span className="text-xs font-mono text-ink-700 truncate">{goal.text}</span>
                                    <span className="flex items-center gap-2 shrink-0">
                                        <span className="text-[10px] font-mono text-ink-400">
                                            {goal.done.filter(Boolean).length}/7
                                        </span>
                                        {carryControl(goal)}
                                    </span>
                                </div>
                                <div className="grid grid-cols-7 gap-px bg-parchment-200 p-px">
                                    {DAYS.map((d, dayIndex) => (
                                        <div key={dayIndex} className="aspect-square bg-parchment-50 flex items-center justify-center">
                                            <Cell checked={goal.done[dayIndex] ?? false} dayLabel={d} compact />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
