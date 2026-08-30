import { useState } from "react";
import type { DailyCheckin } from "../types";
import { getDayLabel, formatDate, formatDateDisplay, isTodayDate } from "../lib/dates";
import { ChevronLeft, NotepadText, MessageCircle, MessageCircleOff } from "lucide-react";

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
    const [expanded, setExpanded] = useState<boolean>(false);

    void startDate;

    return (
        <div className="space-y-3">
            <div className="border-b border-parchment-300 pb-1 flex justify-between pr-4">
                <h3 className="text-xs uppercase tracking-[0.2em] text-ink-400 font-mono">
                    Daily Mood Log
                </h3>
                <button
                    type="button"
                    onClick={() => setExpanded(!expanded)}
                >
                    <span className="text-ink-400 text-xs transition-transform">
                        {expanded ? (
                            <MessageCircleOff className="w-3 h-3" />
                        ) : (
                            <MessageCircle className="w-3 h-3" />
                        )}
                    </span>
                </button>
            </div>
            <div className="divide-y divide-parchment-200 border border-parchment-300 bg-parchment-50">
                {weekDays.map((day, i) => {
                    const dateStr = formatDate(day);
                    const checkin = checkins.find((c) => c.date === dateStr);
                    return (
                        <div key={dateStr}>
                            <div
                                className="w-full flex items-center gap-3 px-3 py-2 text-left"
                            >
                                <span className="text-xs font-mono text-ink-400 w-8 uppercase">
                                    {getDayLabel(i)}
                                </span>
                                <span className="text-xs font-mono text-ink-500 w-20 inline-flex items-center">
                                    {formatDateDisplay(dateStr).slice(0, 6)}
                                    {isTodayDate(dateStr) && <ChevronLeft className="w-4 h-4 text-gold-600 ml-1" />}
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
                                {checkin?.reflections.trim() && !expanded && (
                                    <span className={`text-ink-400 text-xs transition-transform`}>
                                        <NotepadText className="w-3 h-3" />
                                    </span>
                                )}
                            </div>
                            {expanded && checkin && (
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
