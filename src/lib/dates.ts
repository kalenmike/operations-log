import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  addDays,
  format,
  parseISO,
  eachDayOfInterval,
  isToday,
  getWeek,
} from "date-fns";
import { getSettings } from "./settings";
import type { DailyCheckin, Goal, WeekEntry } from "../types";
import { emptyRatings } from "../types";

function weekStart(): number {
  return getSettings().weekStartsOn;
}

function weekStartDay(): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
  return weekStart() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

export function getMonday(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: weekStartDay() });
}

export function formatDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function formatDateDisplay(dateStr: string): string {
  return format(parseISO(dateStr), "dd MMM yyyy");
}

export function formatExportDate(dateIso: string): string {
  return format(new Date(dateIso), "dd/MM/yyyy");
}

export function getWeekRange(startDate: string): { start: string; end: string } {
  const start = parseISO(startDate);
  const end = endOfWeek(start, { weekStartsOn: weekStartDay() });
  return { start: formatDate(start), end: formatDate(end) };
}

export function getNextMonday(dateStr: string): string {
  return formatDate(addWeeks(parseISO(dateStr), 1));
}

export function getPrevMonday(dateStr: string): string {
  return formatDate(subWeeks(parseISO(dateStr), 1));
}

export function getWeekDays(startDate: string): Date[] {
  const start = parseISO(startDate);
  const end = endOfWeek(start, { weekStartsOn: weekStartDay() });
  return eachDayOfInterval({ start, end });
}

export function getTodayString(): string {
  return formatDate(new Date());
}

export function getCurrentWeekStart(): string {
  return formatDate(startOfWeek(new Date(), { weekStartsOn: weekStartDay() }));
}

export function findWeekForCell(weeks: WeekEntry[], start: string): WeekEntry | undefined {
  const exact = weeks.find((w) => w.startDate === start);
  if (exact) return exact;
  const end = formatDate(addDays(parseISO(start), 6));
  return weeks.find((w) => w.startDate >= start && w.startDate <= end);
}

export function isTodayDate(dateStr: string): boolean {
  return isToday(parseISO(dateStr));
}

export function isWeekCurrent(startDate: string): boolean {
  const start = parseISO(startDate);
  const end = endOfWeek(start, { weekStartsOn: weekStartDay() });
  const now = new Date();
  return now >= start && now <= end;
}

export function getDayLabel(dayIndex: number): string {
  const ws = weekStart();
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return labels[(dayIndex + ws) % 7];
}

export function getWeekNumber(startDate: string): number {
  const start = parseISO(startDate);
  return getWeek(start, { weekStartsOn: weekStartDay(), firstWeekContainsDate: 1 });
}

export function getWeekStartsInYear(year: number): string[] {
  const first = getMonday(new Date(year, 0, 1));
  const last = getMonday(new Date(year, 11, 31));
  const out: string[] = [];
  let cur = first;
  let guard = 0;
  while (cur <= last && guard < 60) {
    out.push(formatDate(cur));
    cur = addWeeks(cur, 1);
    guard += 1;
  }
  return out;
}

export function createEmptyWeek(startDate: string) {
  return {
    startDate,
    ratings: emptyRatings(),
    bestAreaWhy: "",
    worstAreaWhy: "",
    weeklyGoal: "",
    goals: [] as Goal[],
    dailyCheckins: [] as DailyCheckin[],
    weekSummary: "",
    wins: "",
    review: "",
    energyGivers: ["", ""] as [string, string],
    energyDrainers: ["", ""] as [string, string],
    nextWeekQuote: "",
  };
}