import { useEffect, useRef, useState } from "react";
import { useJournal } from "./hooks/useJournal";
import type { DailyCheckin, Rating } from "./types";
import {
    getWeekRange,
    formatDateDisplay,
    getTodayString,
    getWeekNumber,
    isWeekCurrent,
    formatExportDate,
} from "./lib/dates";
import { getLastExport } from "./lib/storage";
import { PlanView } from "./components/PlanView";
import { ExecuteView } from "./components/ExecuteView";
import { EvaluateView } from "./components/EvaluateView";
import { ArchiveView } from "./components/ArchiveView";
import { TopMenu } from "./components/TopMenu";
import { UpdateNotice } from "./components/UpdateNotice";
import { WeekPickerModal } from "./components/WeekPickerModal";

type Page = "ops" | "archive";
type OpTab = "plan" | "execute" | "evaluate";

function getTodayStringStable() {
    return getTodayString();
}

function emptyCheckin(date: string): DailyCheckin {
    return {
        date,
        reflections: "",
        moodRating: 0 as unknown as Rating,
    };
}

function App() {
    const {
        weeks,
        currentWeek,
        loading,
        upsertCheckin,
        deleteCheckin,
        toggleGoalDay,
        goPrevWeek,
        goNextWeek,
        goThisWeek,
        goToWeek,
        refreshWeeks,
        updateCurrentWeek,
    } = useJournal();

    const [page, setPage] = useState<Page>("ops");
    const [opTab, setOpTab] = useState<OpTab>("plan");
    const [selectedDate, setSelectedDate] = useState<string>(() => getTodayStringStable());
    const [lastExport, setLastExport] = useState<string | null>(null);
    const [backupDue, setBackupDue] = useState(true);
    const [pickerOpen, setPickerOpen] = useState(false);

    useEffect(() => {
        const load = async () => {
            const v = await getLastExport();
            setLastExport(v);
            setBackupDue(!v || Date.now() - new Date(v).getTime() > 14 * 86400000);
        };
        void load();
    }, []);

    const prevOpTab = useRef<OpTab>(opTab);
    useEffect(() => {
        const opened = prevOpTab.current !== "execute" && opTab === "execute";
        prevOpTab.current = opTab;
        if (opened && currentWeek && isWeekCurrent(currentWeek.startDate)) {
            setSelectedDate(getTodayStringStable());
        }
    }, [opTab, currentWeek]);

    const handleExported = (iso: string) => {
        setLastExport(iso);
        setBackupDue(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-parchment-50">
                <div className="font-mono text-ink-500 text-sm tracking-widest uppercase animate-pulse">
                    Opening the log...
                </div>
            </div>
        );
    }

    if (!currentWeek) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-parchment-50">
                <div className="font-mono text-ink-500 text-sm tracking-widest uppercase">
                    No active week.
                </div>
            </div>
        );
    }

    const range = getWeekRange(currentWeek.startDate);

    const recentWeeks = [...weeks].sort((a, b) =>
        b.startDate.localeCompare(a.startDate)
    );
    const prevWeek = recentWeeks.find((w) => w.startDate < currentWeek.startDate);
    const prevWeekQuote = prevWeek?.nextWeekQuote?.trim() ?? "";

    const getCheckin = (dateStr: string): DailyCheckin => {
        const found = currentWeek.dailyCheckins.find((c) => c.date === dateStr);
        return found ?? emptyCheckin(dateStr);
    };

    const navBtn =
        "px-3 py-1 border border-parchment-300 text-ink-600 text-xs uppercase tracking-widest font-mono cursor-pointer hover:border-ink-500 bg-parchment-50";

    const tabBtn = (tabId: string, label: string, active: boolean) => (
        <button
            type="button"
            onClick={() => setOpTab(tabId as OpTab)}
            className={`px-2 sm:px-3 py-3 sm:py-2 text-sm sm:text-xs uppercase tracking-widest font-mono border-b-2 sm:border-b-2 cursor-pointer transition-colors ${active
                ? "border-ink-800 text-ink-800 font-bold sm:font-normal"
                : "border-transparent text-ink-400 hover:text-ink-600"
                }`}
        >
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-[repeating-linear-gradient(0deg,transparent,transparent_27px,#f4eee2_27px,#f4eee2_28px)]">
            <UpdateNotice />
            <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
                <header className="border-4 border-double border-ink-800 bg-parchment-50 p-4 sm:p-6 mb-6 text-center relative">
                    <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-mono text-ink-400 tracking-[0.3em] uppercase">
                            After Action Review
                        </div>
                        <TopMenu onArchive={() => setPage("archive")} />
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-bold text-ink-900 tracking-[0.15em] uppercase my-2">
                        Operations Log
                    </h1>

                    <div className="flex items-center justify-center gap-2 font-mono text-sm text-ink-600 mt-2">
                        <button type="button" onClick={goPrevWeek} className={navBtn}>
                            ◄
                        </button>
                        <button
                            type="button"
                            onClick={() => setPickerOpen(true)}
                            aria-haspopup="dialog"
                            aria-label="Jump to week, month, or year"
                            className="px-2 text-center min-w-[230px] cursor-pointer border border-transparent hover:border-ink-400 hover:bg-parchment-100 transition-colors"
                        >
                            <span className="uppercase tracking-widest">
                                {formatDateDisplay(currentWeek.startDate)}
                            </span>
                            <span className="mx-1 text-ink-400">—</span>
                            <span className="uppercase tracking-widest">
                                {formatDateDisplay(range.end)}
                            </span>
                            <div className="text-[10px] text-ink-400 mt-0.5">
                                WK {getWeekNumber(currentWeek.startDate)} · {currentWeek.startDate.slice(0, 4)}
                            </div>
                        </button>
                        <button type="button" onClick={goNextWeek} className={navBtn}>
                            ►
                        </button>
                    </div>
                    {!isWeekCurrent(currentWeek.startDate) && (
                        <div className="mt-3">
                            <button type="button" onClick={goThisWeek} className={navBtn}>
                                Jump to Current Week
                            </button>
                        </div>
                    )}
                </header>

                {page === "ops" ? (
                    <>
                        <nav className="flex justify-center sm:border-b sm:border-parchment-300 mb-2 sm:mb-6 ">
                            <div className="grid w-full grid-cols-3 sm:flex sm:gap-8 border-b-0 border-ink-800">
                                {tabBtn("plan", "Plan", opTab === "plan")}
                                {tabBtn("execute", "Execute", opTab === "execute")}
                                {tabBtn("evaluate", "Evaluate", opTab === "evaluate")}
                            </div>
                        </nav>

                        {opTab === "plan" && (
                            <PlanView week={currentWeek} onChange={updateCurrentWeek} />
                        )}

                        {opTab === "execute" && (
                            <ExecuteView
                                week={currentWeek}
                                selectedDate={selectedDate}
                                onSelectDate={setSelectedDate}
                                getCheckin={getCheckin}
                                onCheckinChange={upsertCheckin}
                                onDeleteCheckin={deleteCheckin}
                                onToggleGoal={(goalId) => toggleGoalDay(goalId, selectedDateDay(selectedDate))}
                                prevWeekQuote={prevWeekQuote}
                            />
                        )}

                        {opTab === "evaluate" && (
                            <EvaluateView week={currentWeek} onChange={updateCurrentWeek} />
                        )}
                    </>
                ) : (
                    <>
                        <div className="mb-4 flex justify-center">
                            <button
                                type="button"
                                onClick={() => setPage("ops")}
                                className="px-4 py-2 border border-ink-600 bg-ink-800 text-parchment-100 text-xs uppercase tracking-widest font-mono cursor-pointer hover:bg-ink-700"
                            >
                                ◄ Back to Operations Log
                            </button>
                        </div>
                        <ArchiveView
                            weeks={weeks}
                            onImported={refreshWeeks}
                            onExported={handleExported}
                        />
                    </>
                )}

                <footer className="mt-8 text-center text-[10px] font-mono text-ink-400 uppercase tracking-[0.3em]">
                    <div>Local only · No backend · Your device, your data</div>
                    <div className="mt-2 text-[10px] tracking-[0.2em]">
                        Last exported:{" "}
                        <span className="text-ink-600">
                            {lastExport ? formatExportDate(lastExport) : "Never exported"}
                        </span>
                    </div>
                    {backupDue && (
                        <div className="mt-1 text-rust-600 font-bold tracking-[0.2em]">
                            Remember to back up your data.
                        </div>
                    )}
                </footer>
            </div>

            <WeekPickerModal
                open={pickerOpen}
                currentStartDate={currentWeek.startDate}
                onSelect={goToWeek}
                onClose={() => setPickerOpen(false)}
            />
        </div>
    );

    function selectedDateDay(dateStr: string): number {
        const weekStart = currentWeek!.startDate;
        const diff = Math.round(
            (new Date(dateStr + "T12:00:00").getTime() -
                new Date(weekStart + "T12:00:00").getTime()) /
            86400000
        );
        return diff >= 0 && diff < 7 ? diff : 0;
    }
}

export default App;
