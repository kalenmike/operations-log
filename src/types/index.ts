export type Rating = 1 | 2 | 3 | 4 | 5;

export type ArchiveTab = "metrics" | "settings" | "data";

export interface Ratings {
  spiritual: Rating;
  physical: Rating;
  intellectual: Rating;
  emotional: Rating;
  social: Rating;
}

export function emptyRatings(): Ratings {
  return {
    spiritual: 0,
    physical: 0,
    intellectual: 0,
    emotional: 0,
    social: 0,
  } as unknown as Ratings;
}

export interface Goal {
  id: string;
  text: string;
  done: boolean[]; // 7 days, aligned with week days
  carried?: boolean; // rolled over from a previous week
  carriedToNext?: boolean; // pushed to the next week from this week
}

export interface DailyCheckin {
  date: string; // YYYY-MM-DD
  reflections: string;
  moodRating: Rating;
}

export interface WeekEntry {
  id: string;
  startDate: string; // YYYY-MM-DD (week start)
  ratings: Ratings;
  bestAreaWhy: string;
  worstAreaWhy: string;
  weeklyGoal: string;
  goals: Goal[];
  dailyCheckins: DailyCheckin[];
  weekSummary: string;
  wins: string;
  review: string;
  energyGivers: [string, string];
  energyDrainers: [string, string];
  nextWeekQuote: string;
  carriedNote?: string; // "one thing to carry forward", set when closing the week
  reviewedAt?: string; // ISO date when the week was closed via "Close Week"
  createdAt: string;
  updatedAt: string;
}