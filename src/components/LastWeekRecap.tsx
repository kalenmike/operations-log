import { useState } from "react";
import type { Ratings, WeekEntry } from "../types";
import { formatDateDisplay } from "../lib/dates";

interface LastWeekRecapProps {
    prevWeek: WeekEntry;
}

const DOMAIN_NAMES: Record<keyof Ratings, string> = {
    spiritual: "Spiritual",
    physical: "Physical",
    intellectual: "Intellectual",
    emotional: "Emotional",
    social: "Social",
};

function worstAreas(ratings: Ratings): string[] {
    const rated = (Object.keys(ratings) as (keyof Ratings)[]).filter(
        (k) => ratings[k] > 0
    );
    if (rated.length === 0) return [];
    const min = Math.min(...rated.map((k) => ratings[k]));
    return rated.filter((k) => ratings[k] === min).map((k) => DOMAIN_NAMES[k]);
}

export function LastWeekRecap({ prevWeek }: LastWeekRecapProps) {
    const worst = worstAreas(prevWeek.ratings);
    const doneGoals = prevWeek.goals.filter((g) => g.done.some(Boolean));
    const [open, setOpen] = useState(true);

    return (
        <section className="border border-parchment-200 bg-parchment-50 p-4 sm:p-6">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                className="w-full flex items-center justify-between gap-2 text-left cursor-pointer group"
            >
                <h3 className="text-xs uppercase tracking-[0.2em] text-ink-500 font-mono group-hover:text-ink-700">
                    Last Week Recap — {formatDateDisplay(prevWeek.startDate)}
                </h3>
                <span className="text-[10px] font-mono text-ink-400 border border-parchment-300 px-1.5 py-0.5">
                    {open ? "collapse" : "expand"}
                </span>
            </button>

            {open && (
                <>
                    <div className="border-b border-parchment-300 my-3" />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-3">
                            <div>
                                <div className="text-[10px] uppercase tracking-wider text-gold-600 font-mono mb-1">
                                    Weekly Goal
                                </div>
                                <p className="text-sm font-mono text-ink-700">
                                    {prevWeek.weeklyGoal.trim() || (
                                        <span className="italic text-ink-300">None set.</span>
                                    )}
                                </p>
                            </div>

                            {doneGoals.length > 0 && (
                                <div>
                                    <div className="text-[10px] uppercase tracking-wider text-gold-600 font-mono mb-1">
                                        Objectives
                                    </div>
                                    <p className="text-[10px] font-mono text-ink-400 italic mb-1">
                                        Carry unfinished objectives forward in the Evaluate tab.
                                    </p>
                                    <ul className="space-y-0.5">
                                        {doneGoals.map((g) => {
                                            const hit = g.done.filter(Boolean).length;
                                            const total = g.done.length;
                                            return (
                                                <li
                                                    key={g.id}
                                                    className="text-xs font-mono text-ink-600 flex items-center justify-between gap-2"
                                                >
                                                    <span className="truncate">{g.text}</span>
                                                    <span className={`shrink-0 ${hit === total ? "text-olive-600" : "text-ink-400"}`}>
                                                        {hit}/{total}
                                                    </span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}

                            {worst.length > 0 && (
                                <div>
                                    <div className="text-[10px] uppercase tracking-wider text-rust-600 font-mono mb-1">
                                        Lowest Domain
                                    </div>
                                    <p className="text-sm font-mono text-ink-700">{worst.join(" & ")}</p>
                                    {prevWeek.worstAreaWhy.trim() && (
                                        <p className="text-xs font-mono text-ink-500 mt-1 whitespace-pre-wrap">
                                            “{prevWeek.worstAreaWhy.trim()}”
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div>
                                <div className="text-[10px] uppercase tracking-wider text-olive-600 font-mono mb-1">
                                    Gave Energy
                                </div>
                                <p className="text-xs font-mono text-ink-600 whitespace-pre-wrap">
                                    {prevWeek.energyGivers.filter((s) => s.trim()).join("\n") || (
                                        <span className="italic text-ink-300">—</span>
                                    )}
                                </p>
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-wider text-rust-600 font-mono mb-1">
                                    Drained Energy
                                </div>
                                <p className="text-xs font-mono text-ink-600 whitespace-pre-wrap">
                                    {prevWeek.energyDrainers.filter((s) => s.trim()).join("\n") || (
                                        <span className="italic text-ink-300">—</span>
                                    )}
                                </p>
                            </div>
                            {prevWeek.carriedNote?.trim() && (
                                <div>
                                    <div className="text-[10px] uppercase tracking-wider text-gold-600 font-mono mb-1">
                                        Words to Carry Over
                                    </div>
                                    <p className="text-xs font-mono text-ink-600 italic whitespace-pre-wrap">
                                        “{prevWeek.carriedNote.trim()}”
                                    </p>
                                </div>
                            )}

                        </div>
                    </div>
                </>
            )}
        </section>
    );
}
