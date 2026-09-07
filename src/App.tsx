import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { useJournal } from "./hooks/useJournal";
import type { DailyCheckin, Goal, Rating } from "./types";
import { useUrlState, validWeek, type OpTab } from "./lib/navigation";
import {
    getWeekRange,
    formatDateDisplay,
    getTodayString,
    getCurrentWeekStart,
    getWeekNumber,
    isWeekCurrent,
    formatExportDate,
    getPrevMonday,
} from "./lib/dates";
import { getLastExport } from "./lib/storage";
import { PlanView } from "./components/PlanView";
import { ExecuteView } from "./components/ExecuteView";
import { EvaluateView } from "./components/EvaluateView";
import { ArchiveView } from "./components/ArchiveView";
import { TopMenu } from "./components/TopMenu";
import { UpdateNotice } from "./components/UpdateNotice";
import { WeekPickerModal } from "./components/WeekPickerModal";
import { LastWeekRecap } from "./components/LastWeekRecap";
import { WeekReport } from "./components/WeekReport";

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
    const [searchParams] = useSearchParams();
    const seedWeek = validWeek(searchParams.get("week"));

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
        carryGoal,
        refreshWeeks,
        updateCurrentWeek,
    } = useJournal(seedWeek);

    const { page, tab, section, weekParam, setPage, setTab, setSection } = useUrlState({
        week: currentWeek?.startDate ?? "",
        initialSection: "metrics",
        goToWeek,
    });

    const [selectedDate, setSelectedDate] = useState<string>(() => {
        const wp = weekParam;
        return wp && wp !== getCurrentWeekStart() ? wp : getTodayStringStable();
    });
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

    const prevOpTab = useRef<OpTab>(tab);
    useEffect(() => {
        const opened = prevOpTab.current !== "execute" && tab === "execute";
        prevOpTab.current = tab;
        if (opened && currentWeek && isWeekCurrent(currentWeek.startDate)) {
            setSelectedDate(getTodayStringStable());
        }
    }, [tab, currentWeek]);

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
    const currentWeekStart = getCurrentWeekStart();

    const recentWeeks = [...weeks].sort((a, b) =>
        b.startDate.localeCompare(a.startDate)
    );
    const prevWeek =
        recentWeeks.find((w) => w.startDate === getPrevMonday(currentWeek.startDate)) ?? null;
    const prevWeekQuote = prevWeek?.nextWeekQuote?.trim() ?? "";

    const handleCarryGoal = (goal: Goal) => {
        void carryGoal(goal);
    };

    const handleGoToNextWeek = () => {
        goNextWeek();
        setTab("plan");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const getCheckin = (dateStr: string): DailyCheckin => {
        const found = currentWeek.dailyCheckins.find((c) => c.date === dateStr);
        return found ?? emptyCheckin(dateStr);
    };

    const navBtn =
        "px-3 py-1 border border-parchment-300 text-ink-600 text-xs uppercase tracking-widest font-mono cursor-pointer hover:border-ink-500 bg-parchment-50";

    const tabBtn = (tabId: string, label: string, active: boolean) => (
        <button
            type="button"
            onClick={() => setTab(tabId as OpTab)}
            className={`px-2 sm:px-3 py-3 sm:py-2 text-sm sm:text-xs uppercase tracking-widest font-mono border-b-2 sm:border-b-2 cursor-pointer transition-colors ${active
                ? "border-ink-800 text-ink-800 font-bold sm:font-normal"
                : "border-transparent text-ink-400 hover:text-ink-600"
                }`}
        >
            {label}
        </button>
    );

    return (
        <>
            <div className="min-h-screen bg-[repeating-linear-gradient(0deg,transparent,transparent_27px,#f4eee2_27px,#f4eee2_28px)] print:hidden">
                <UpdateNotice />
            <header className="fixed top-0 left-0 right-0 z-50 bg-parchment-50 border-b-4 border-double border-ink-800">
                <div className="max-w-4xl mx-auto px-4 py-2 sm:py-3">
                    <div className="grid grid-cols-3 items-center gap-2">
                        <h1 className="justify-self-start min-w-0 col-start-1 text-base sm:text-xl font-bold text-ink-900 tracking-[0.15em] uppercase truncate">
                            Operations Log
                        </h1>

                        {page === "ops" ? (
                            !isWeekCurrent(currentWeek.startDate) && (
                                <button
                                    type="button"
                                    onClick={goThisWeek}
                                    className="justify-self-center px-2.5 py-1.5 border border-rust-500 bg-rust-500 text-parchment-50 text-[11px] uppercase tracking-widest font-mono cursor-pointer hover:bg-rust-600 whitespace-nowrap"
                                >
                                    {currentWeek.startDate < currentWeekStart
                                        ? "Jump to Current Week ►"
                                        : "◀ Jump to Current Week"}
                                </button>
                            )
                        ) : (
                            <button
                                type="button"
                                onClick={() => setPage("ops")}
                                className="justify-self-center px-2.5 py-1.5 border border-ink-600 bg-ink-800 text-parchment-100 text-[11px] uppercase tracking-widest font-mono cursor-pointer hover:bg-ink-700 whitespace-nowrap"
                            >
                                ◄ Back to Operations Log
                            </button>
                        )}

                        <div className="justify-self-end col-start-3">
                            <TopMenu onNavigate={(tab) => setSection(tab)} />
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 pt-24 pb-6 sm:pb-8">

                {page === "ops" ? (
                    <>
                        <div className="mb-4 flex items-center justify-center gap-1 sm:gap-2 font-mono text-sm text-ink-600">
                            <button type="button" onClick={goPrevWeek} className={navBtn}>
                                ◄
                            </button>
                            <button
                                type="button"
                                onClick={() => setPickerOpen(true)}
                                aria-haspopup="dialog"
                                aria-label="Jump to week, month, or year"
                                className="px-2 text-center min-w-[200px] sm:min-w-[250px] cursor-pointer border border-transparent hover:border-ink-400 hover:bg-parchment-100 transition-colors"
                            >
                                <span className="uppercase tracking-widest font-bold">
                                    WK {getWeekNumber(currentWeek.startDate)} · {currentWeek.startDate.slice(0, 4)}
                                </span>
                                <div className="text-[10px] text-ink-400 mt-0.5">
                                    {formatDateDisplay(currentWeek.startDate)}
                                    <span className="mx-1">—</span>
                                    {formatDateDisplay(range.end)}
                                </div>
                            </button>
                            <button type="button" onClick={goNextWeek} className={navBtn}>
                                ►
                            </button>
                        </div>

                        <nav className="flex justify-center sm:border-b sm:border-parchment-300 mb-2 sm:mb-6 ">
                            <div className="grid w-full grid-cols-3 sm:flex sm:gap-8 border-b-0 border-ink-800">
                                {tabBtn("plan", "Plan", tab === "plan")}
                                {tabBtn("execute", "Execute", tab === "execute")}
                                {tabBtn("evaluate", "Evaluate", tab === "evaluate")}
                            </div>
                        </nav>

                        {tab === "plan" && (
                            <div className="space-y-6">
                                {prevWeek && <LastWeekRecap prevWeek={prevWeek} />}
                                <PlanView week={currentWeek} previousRatings={prevWeek?.ratings} onChange={updateCurrentWeek} />
                            </div>
                        )}

                        {tab === "execute" && (
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

                        {tab === "evaluate" && (
                            <EvaluateView
                                week={currentWeek}
                                previousRatings={prevWeek?.ratings}
                                onChange={updateCurrentWeek}
                                onCarryGoal={handleCarryGoal}
                                onGoNextWeek={handleGoToNextWeek}
                            />
                        )}
                    </>
                ) : (
                    <>
                        <ArchiveView
                            key={section}
                            weeks={weeks}
                            initialTab={section}
                            onImported={refreshWeeks}
                            onExported={handleExported}
                        />
                    </>
                )}

                <footer className="mt-8 text-center text-[10px] font-mono text-ink-400 uppercase tracking-[0.3em]">
                    <div>Local only · Your device · Your data</div>
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

            <div className="hidden print:block">
                {currentWeek && <WeekReport week={currentWeek} />}
            </div>
        </>
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
