import type { Ratings, WeekEntry, Rating } from "../types";
import { DomainRatings } from "./DomainRatings";
import { TextInput } from "./TextInput";
import { GoalManager } from "./GoalManager";
import { useLang } from "../lib/i18n";

interface PlanViewProps {
  week: WeekEntry;
  previousRatings?: Ratings;
  onChange: (week: WeekEntry) => void;
}

function rankAreas(ratings: Ratings): { best: (keyof Ratings)[]; worst: (keyof Ratings)[] } {
  const rated = (Object.keys(ratings) as (keyof Ratings)[]).filter(
    (k) => ratings[k] > 0
  );
  if (rated.length === 0) return { best: [], worst: [] };
  const values = rated.map((k) => ratings[k]);
  const max = Math.max(...values);
  const min = Math.min(...values);
  return {
    best: rated.filter((k) => ratings[k] === max),
    worst: rated.filter((k) => ratings[k] === min),
  };
}

function AreaField({
  label,
  names,
  tone,
}: {
  label: string;
  names: string[];
  tone: string;
}) {
  const { t } = useLang();
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.2em] text-ink-400 font-mono mb-1">
        {label}
      </div>
      <div className="px-3 py-2 border border-parchment-300 bg-parchment-100/60 text-sm font-mono min-h-[40px] flex items-center">
        {names.length > 0 ? (
          <span className={tone}>{names.join(" & ")}</span>
        ) : (
          <span className="italic text-ink-300">
            {t("plan.rateHint")}
          </span>
        )}
      </div>
    </div>
  );
}

export function PlanView({ week, previousRatings, onChange }: PlanViewProps) {
  const { t } = useLang();
  const updateRatings = (key: keyof Ratings, value: Rating) => {
    onChange({ ...week, ratings: { ...week.ratings, [key]: value } });
  };

  const updateGoals = (goals: WeekEntry["goals"]) => {
    onChange({ ...week, goals });
  };

  const { best, worst } = rankAreas(week.ratings);
  const bestNames = best.map((k) => t(`domain.${k}`));
  const worstNames = worst.map((k) => t(`domain.${k}`));
  const bestPlaceholder = t(best.length === 1 ? "plan.best.single" : "plan.best.plural");
  const worstPlaceholder = t(worst.length === 1 ? "plan.worst.single" : "plan.worst.plural");

  return (
    <div className="space-y-6">
      <section className="border border-parchment-200 bg-parchment-50 p-4 sm:p-6">
        <DomainRatings ratings={week.ratings} previousRatings={previousRatings} onChange={updateRatings} />
      </section>

      <section className="border border-parchment-200 bg-parchment-50 p-4 sm:p-6">
        <h3 className="text-xs uppercase tracking-[0.2em] text-ink-400 border-b border-parchment-300 pb-1 mb-4">
          {t("plan.bestWorst")}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <AreaField
            label={t("plan.best")}
            names={bestNames}
            tone="text-olive-700"
          />
          <AreaField
            label={t("plan.worst")}
            names={worstNames}
            tone="text-rust-600"
          />
          <TextInput
            label={t("plan.whyBest")}
            value={week.bestAreaWhy}
            onChange={(v) => onChange({ ...week, bestAreaWhy: v })}
            multiline
            rows={3}
            placeholder={bestPlaceholder}
          />
          <TextInput
            label={t("plan.whyWorst")}
            value={week.worstAreaWhy}
            onChange={(v) => onChange({ ...week, worstAreaWhy: v })}
            multiline
            rows={3}
            placeholder={worstPlaceholder}
          />
        </div>
      </section>

      <section className="border border-parchment-200 bg-parchment-50 p-4 sm:p-6">
        <div className="space-y-4">
          <TextInput
            label={t("week.goal")}
            value={week.weeklyGoal}
            onChange={(v) => onChange({ ...week, weeklyGoal: v })}
            multiline
            rows={2}
            placeholder={t("plan.weeklyGoalPh")}
          />
          <GoalManager goals={week.goals} onChange={updateGoals} />
        </div>
      </section>
    </div>
  );
}