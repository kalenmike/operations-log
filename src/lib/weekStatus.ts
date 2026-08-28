import type { WeekEntry } from "../types";

export type WeekStatus = "missing" | "incomplete" | "complete";

function weekHasContent(week: WeekEntry): boolean {
  const hasRatings = (Object.values(week.ratings) as number[]).every((v) => v > 0);
  const hasPlan = hasRatings || week.goals.length > 0 || week.weeklyGoal.trim() !== "";
  const hasExecute = week.dailyCheckins.length > 0;
  const hasEvaluate =
    [week.weekSummary, week.wins, week.review, week.nextWeekQuote].some((s) => s.trim() !== "") ||
    week.energyGivers.some((s) => s.trim() !== "") ||
    week.energyDrainers.some((s) => s.trim() !== "");
  return hasPlan || hasExecute || hasEvaluate;
}

export function weekStatus(week: WeekEntry | undefined): WeekStatus {
  if (!week || !weekHasContent(week)) return "missing";
  const hasRatings = (Object.values(week.ratings) as number[]).every((v) => v > 0);
  const hasPlan = hasRatings || week.goals.length > 0 || week.weeklyGoal.trim() !== "";
  const hasExecute = week.dailyCheckins.length > 0;
  const hasEvaluate =
    [week.weekSummary, week.wins, week.review, week.nextWeekQuote].some((s) => s.trim() !== "") ||
    week.energyGivers.some((s) => s.trim() !== "") ||
    week.energyDrainers.some((s) => s.trim() !== "");
  return hasPlan && hasExecute && hasEvaluate ? "complete" : "incomplete";
}