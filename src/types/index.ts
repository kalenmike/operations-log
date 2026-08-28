export type Rating = 1 | 2 | 3 | 4 | 5;

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
  createdAt: string;
  updatedAt: string;
}