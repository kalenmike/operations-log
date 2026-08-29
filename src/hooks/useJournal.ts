import { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import type { DailyCheckin, WeekEntry } from "../types";
import { getAllWeeks, getWeekByDate, saveWeek, setStoredVersion } from "../lib/storage";
import {
  createEmptyWeek,
  getTodayString,
  getMonday,
  formatDate,
  getNextMonday,
  getPrevMonday,
} from "../lib/dates";

export function useJournal() {
  const [weeks, setWeeks] = useState<WeekEntry[]>([]);
  const weeksRef = useRef<WeekEntry[]>([]);
  const [currentWeekId, setCurrentWeekId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const inflight = useRef(new Map<string, Promise<WeekEntry>>());

  const todayString = getTodayString();

  const commitWeeks = useCallback((updater: (prev: WeekEntry[]) => WeekEntry[]) => {
    setWeeks((prev) => {
      const next = updater(prev);
      weeksRef.current = next;
      weeksRef.current.sort((a, b) => b.startDate.localeCompare(a.startDate));
      return weeksRef.current;
    });
  }, []);

  const persistWeek = useCallback(
    (week: WeekEntry) => {
      const updated = { ...week, updatedAt: new Date().toISOString() };
      void saveWeek(updated);
      commitWeeks((prev) =>
        prev.some((w) => w.id === updated.id)
          ? prev.map((w) => (w.id === updated.id ? updated : w))
          : [updated, ...prev]
      );
      return updated;
    },
    [commitWeeks]
  );

  const ensureWeek = useCallback(
    (dateStr: string): Promise<WeekEntry> => {
      const monday = formatDate(getMonday(new Date(dateStr + "T12:00:00")));
      const pending = inflight.current.get(monday);
      if (pending) return pending;

      const run = (async () => {
        const known = weeksRef.current.find((w) => w.startDate === monday);
        if (known) {
          setCurrentWeekId(known.id);
          return known;
        }
        const fromDb = await getWeekByDate(monday);
        if (fromDb) {
          commitWeeks((prev) =>
            prev.some((w) => w.id === fromDb.id) ? prev : [fromDb, ...prev]
          );
          setCurrentWeekId(fromDb.id);
          return fromDb;
        }
        const fresh: WeekEntry = {
          id: uuid(),
          ...createEmptyWeek(monday),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        commitWeeks((prev) => [fresh, ...prev]);
        void saveWeek(fresh);
        setCurrentWeekId(fresh.id);
        return fresh;
      })();

      inflight.current.set(
        monday,
        run.finally(() => {
          inflight.current.delete(monday);
        })
      );
      return inflight.current.get(monday)!;
    },
    [commitWeeks]
  );

  useEffect(() => {
    const init = async () => {
      const all = await getAllWeeks();
      commitWeeks(() => all);
      await setStoredVersion();
      await ensureWeek(todayString);
      setLoading(false);
    };
    void init();
  }, [commitWeeks, ensureWeek, todayString]);

  const currentWeek = weeks.find((w) => w.id === currentWeekId) ?? null;

  const updateCurrentWeek = (week: WeekEntry) => {
    persistWeek(week);
  };

  const upsertCheckin = (checkin: DailyCheckin) => {
    if (!currentWeek) return;
    const existing = currentWeek.dailyCheckins.find((c) => c.date === checkin.date);
    const next = existing
      ? currentWeek.dailyCheckins.map((c) => (c.date === checkin.date ? checkin : c))
      : [...currentWeek.dailyCheckins, checkin];
    updateCurrentWeek({ ...currentWeek, dailyCheckins: next });
  };

  const deleteCheckin = (date: string) => {
    if (!currentWeek) return;
    updateCurrentWeek({
      ...currentWeek,
      dailyCheckins: currentWeek.dailyCheckins.filter((c) => c.date !== date),
    });
  };

  const toggleGoalDay = (goalId: string, dayIndex: number) => {
    if (!currentWeek) return;
    updateCurrentWeek({
      ...currentWeek,
      goals: currentWeek.goals.map((g) =>
        g.id === goalId
          ? { ...g, done: g.done.map((d, i) => (i === dayIndex ? !d : d)) as boolean[] }
          : g
      ),
    });
  };

  const goPrevWeek = () => {
    if (!currentWeek) return;
    void ensureWeek(getPrevMonday(currentWeek.startDate));
  };

  const goNextWeek = () => {
    if (!currentWeek) return;
    void ensureWeek(getNextMonday(currentWeek.startDate));
  };

  const goThisWeek = () => {
    void ensureWeek(todayString);
  };

  const goToWeek = (dateStr: string) => {
    void ensureWeek(dateStr);
  };

  const refreshWeeks = useCallback(async () => {
    const all = await getAllWeeks();
    commitWeeks(() => all);
  }, [commitWeeks]);

  const replaceGoals = (goals: WeekEntry["goals"]) => {
    if (!currentWeek) return;
    updateCurrentWeek({ ...currentWeek, goals });
  };

  return {
    weeks,
    currentWeek,
    loading,
    upsertCheckin,
    deleteCheckin,
    toggleGoalDay,
    replaceGoals,
    goPrevWeek,
    goNextWeek,
    goThisWeek,
    goToWeek,
    refreshWeeks,
    updateCurrentWeek,
  };
}