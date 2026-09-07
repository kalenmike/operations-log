import type { WeekEntry } from "../types";

export type WeekStatus = "missing" | "incomplete" | "complete";

function weekHasContent(week: WeekEntry): boolean {
  const hasRatings = (Object.values(week.ratings) as number[]).some((v) => v > 0);
  const hasGoals = week.goals.length > 0 || week.weeklyGoal.trim() !== "";
  const hasExecute = week.dailyCheckins.length > 0;
  const hasEvaluate =
    [week.weekSummary, week.wins, week.review, week.nextWeekQuote, week.carriedNote ?? ""].some((s) => s.trim() !== "") ||
    week.energyGivers.some((s) => s.trim() !== "") ||
    week.energyDrainers.some((s) => s.trim() !== "");
  return hasRatings || hasGoals || hasExecute || hasEvaluate;
}

export function weekStatus(week: WeekEntry | undefined): WeekStatus {
  if (!week || !weekHasContent(week)) return "missing";
  if (week.reviewedAt) return "complete";
  return "incomplete";
}