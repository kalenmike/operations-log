import { useState } from "react";
import type { Goal, Ratings, WeekEntry } from "../types";
import { getWeekDays } from "../lib/dates";
import { DomainRatings } from "./DomainRatings";
import { ObjectiveTracker } from "./ObjectiveTracker";
import { DayMoodList } from "./DayMoodList";
import { WeekReview } from "./WeekReview";
import { useLang } from "../lib/i18n";

interface EvaluateViewProps {
  week: WeekEntry;
  previousRatings?: Ratings;
  onChange: (week: WeekEntry) => void;
  onCarryGoal?: (goal: Goal) => void;
  onGoNextWeek?: () => void;
}

function worstAreas(ratings: Ratings): (keyof Ratings)[] {
  const rated = (Object.keys(ratings) as (keyof Ratings)[]).filter(
    (k) => ratings[k] > 0
  );
  if (rated.length === 0) return [];
  const min = Math.min(...rated.map((k) => ratings[k]));
  return rated.filter((k) => ratings[k] === min);
}

export function EvaluateView({ week, previousRatings, onChange, onCarryGoal, onGoNextWeek }: EvaluateViewProps) {
  const { t } = useLang();
  const weekDays = getWeekDays(week.startDate);
  const [closing, setClosing] = useState(false);
  const [carryNote, setCarryNote] = useState(week.carriedNote ?? "");

  const moods = week.dailyCheckins
    .map((c) => Number(c.moodRating) || 0)
    .filter((m) => m > 0);
  const avgMood = moods.length
    ? (moods.reduce((a, b) => a + b, 0) / moods.length).toFixed(1)
    : null;
  const goalPoints = week.goals.reduce((acc, g) => acc + g.done.length, 0);
  const goalHits = week.goals.reduce((acc, g) => acc + g.done.filter(Boolean).length, 0);
  const objectPct = goalPoints
    ? Math.round((goalHits / goalPoints) * 100)
    : null;
  const worst = worstAreas(week.ratings);
  const worstNames = worst.map((k) => t(`domain.${k}`));

  const handleClose = () => {
    onChange({ ...week, carriedNote: carryNote.trim(), reviewedAt: new Date().toISOString() });
    setClosing(false);
  };

  return (
    <div className="space-y-6">
      <section className="border border-parchment-200 bg-parchment-50 p-4 sm:p-6">
        <h3 className="text-xs uppercase tracking-[0.2em] text-ink-400 border-b border-parchment-300 pb-1 mb-4">
          {t("eval.weekResults")}
        </h3>
        <div className="divide-y divide-parchment-200">
          <div className="py-4 first:pt-0">
            <DomainRatings ratings={week.ratings} previousRatings={previousRatings} compact />
          </div>
          <div className="py-4">
            <ObjectiveTracker goals={week.goals} onCarryGoal={onCarryGoal} />
          </div>
          <div className="py-4 last:pb-0">
            <DayMoodList
              startDate={week.startDate}
              weekDays={weekDays}
              checkins={week.dailyCheckins}
            />
          </div>
        </div>
      </section>

      <section className="border border-parchment-200 bg-parchment-50 p-4 sm:p-6">
        <h3 className="text-xs uppercase tracking-[0.2em] text-ink-400 border-b border-parchment-300 pb-1 mb-4">
          {t("eval.wrapUp")}
        </h3>
        <WeekReview week={week} onChange={onChange} />
      </section>

      <section className="border border-parchment-200 bg-parchment-50 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs uppercase tracking-[0.2em] text-ink-400 font-mono">
            {t("eval.closeWeek")}
          </h3>
          {week.reviewedAt ? (
            <span className="text-[10px] font-mono uppercase tracking-widest text-olive-600 border border-olive-600/40 px-1.5 py-0.5">
              {t("eval.weekClosed")}
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setClosing((c) => !c)}
              className="px-3 py-2 border border-ink-600 bg-ink-800 text-parchment-100 text-xs uppercase tracking-widest font-mono cursor-pointer hover:bg-ink-700"
            >
              {closing ? t("eval.cancel") : t("eval.closeWeekBtn")}
            </button>
          )}
        </div>

        {week.reviewedAt ? (
          <div className="space-y-2">
            <p className="text-xs font-mono text-ink-500">
              {t("eval.reviewed", { date: new Date(week.reviewedAt).toLocaleDateString() })}.
            </p>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 border border-parchment-400 text-ink-700 text-xs uppercase tracking-widest font-mono cursor-pointer hover:border-ink-500"
            >
              {t("eval.downloadReport")}
            </button>
            <button
              type="button"
              onClick={() => onGoNextWeek?.()}
              className="px-3 py-2 border border-parchment-400 text-ink-700 text-xs uppercase tracking-widest font-mono cursor-pointer hover:border-ink-500"
            >
              {t("eval.goNext")}
            </button>
          </div>
        ) : closing && (
          <div className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="p-3 border border-parchment-200 bg-parchment-100/50">
                <div className="text-[10px] uppercase tracking-wider text-ink-400">{t("eval.avgMood")}</div>
                <div className="text-2xl text-ink-800">
                  {avgMood ?? "—"}
                  <span className="text-xs text-ink-400">/5</span>
                </div>
              </div>
              <div className="p-3 border border-parchment-200 bg-parchment-100/50">
                <div className="text-[10px] uppercase tracking-wider text-ink-400">{t("eval.objectiveHit")}</div>
                <div className="text-2xl text-ink-800">
                  {objectPct === null ? "—" : `${objectPct}%`}
                </div>
              </div>
              <div className="p-3 border border-parchment-200 bg-parchment-100/50">
                <div className="text-[10px] uppercase tracking-wider text-ink-400">{t("eval.lowestDomain")}</div>
                <div className="text-lg text-ink-800 leading-tight">
                  {worstNames.length ? worstNames.join(" & ") : "—"}
                </div>
              </div>
            </div>

            {worst.length > 0 && week.worstAreaWhy.trim() && (
              <p className="text-xs font-mono text-ink-500 whitespace-pre-wrap">
                “{week.worstAreaWhy.trim()}”
              </p>
            )}

            <label className="block text-xs uppercase tracking-widest text-ink-500 font-mono">
              {t("eval.carryForward")}
              <textarea
                value={carryNote}
                onChange={(e) => setCarryNote(e.target.value)}
                rows={2}
                placeholder={t("eval.carryPh")}
                className="w-full mt-1 px-3 py-2 border border-parchment-300 bg-parchment-50 text-sm font-mono text-ink-700 placeholder:text-ink-300 focus:outline-none focus:border-ink-500"
              />
            </label>

            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-olive-600 bg-olive-500 text-parchment-50 text-xs uppercase tracking-widest font-mono cursor-pointer hover:bg-olive-600"
            >
              {t("eval.closeNext")}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}