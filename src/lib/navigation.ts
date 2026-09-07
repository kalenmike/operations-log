import { useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import type { ArchiveTab } from "../types";
import { formatDate, getMonday } from "./dates";

export type Page = "ops" | "archive";
export type OpTab = "plan" | "execute" | "evaluate";

const WEEK_RE = /^\d{4}-\d{2}-\d{2}$/;

export function mondayOf(dateStr: string): string {
  return formatDate(getMonday(new Date(dateStr + "T12:00:00")));
}

const validPage = (v: string | null): Page => (v === "archive" ? "archive" : "ops");
const validTab = (v: string | null): OpTab =>
  v === "execute" ? "execute" : v === "evaluate" ? "evaluate" : "plan";
const validSection = (v: string | null): ArchiveTab =>
  v === "settings" ? "settings" : v === "data" ? "data" : "metrics";
const validWeek = (v: string | null): string | undefined =>
  WEEK_RE.test(v ?? "") ? (v as string) : undefined;

export { validWeek };

interface UseUrlStateOptions {
  week: string;
  initialSection: ArchiveTab;
  goToWeek: (dateStr: string) => void;
}

export function useUrlState({ week, initialSection, goToWeek }: UseUrlStateOptions) {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = validPage(searchParams.get("page"));
  const tab = validTab(searchParams.get("tab"));
  const section = validSection(searchParams.get("section"));
  const weekParam = validWeek(searchParams.get("week"));

  const patchParams = (patch: (cur: URLSearchParams) => URLSearchParams, replace: boolean) => {
    setSearchParams(
      (cur) => {
        const next = patch(new URLSearchParams(cur));
        if (!next.has("week") && week) next.set("week", week);
        return next;
      },
      { replace }
    );
  };

  const setPage = (p: Page) => {
    patchParams((cur) => {
      const next = new URLSearchParams(cur);
      next.set("page", p);
      if (p === "ops") {
        next.delete("section");
        if (!next.has("tab")) next.set("tab", "plan");
      } else {
        next.delete("tab");
        if (!next.has("section")) next.set("section", initialSection);
      }
      return next;
    }, true);
  };

  const setTab = (t: OpTab) => {
    patchParams((cur) => {
      const next = new URLSearchParams(cur);
      next.set("tab", t);
      return next;
    }, true);
  };

  const setSection = (s: ArchiveTab) => {
    patchParams((cur) => {
      const next = new URLSearchParams(cur);
      next.set("page", "archive");
      next.delete("tab");
      next.set("section", s);
      return next;
    }, true);
  };

  const suppressWeekPush = useRef(false);
  const markWeekRestore = useCallback(() => {
    suppressWeekPush.current = true;
  }, []);

  const prevWeek = useRef(week);
  const started = useRef(false);
  useEffect(() => {
    if (prevWeek.current === week) return;
    prevWeek.current = week;
    const suppressed = suppressWeekPush.current;
    suppressWeekPush.current = false;
    if (suppressed || !started.current) {
      started.current = true;
      return;
    }
    setSearchParams(
      (cur) => {
        const next = new URLSearchParams(cur);
        next.set("week", week);
        return next;
      },
      { replace: false }
    );
  }, [week, setSearchParams]);

  useEffect(() => {
    if (!weekParam || !week) return;
    if (mondayOf(weekParam) === week) return;
    markWeekRestore();
    goToWeek(weekParam);
  }, [weekParam, week, goToWeek, markWeekRestore]);

  return { page, tab, section, weekParam, setPage, setTab, setSection, markWeekRestore };
}