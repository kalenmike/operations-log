import type { Ratings, WeekEntry, Rating } from "../types";
import { DomainRatings } from "./DomainRatings";
import { TextInput } from "./TextInput";
import { GoalManager } from "./GoalManager";

interface PlanViewProps {
  week: WeekEntry;
  onChange: (week: WeekEntry) => void;
}

const DOMAIN_NAMES: Record<keyof Ratings, string> = {
  spiritual: "Spiritual",
  physical: "Physical",
  intellectual: "Intellectual",
  emotional: "Emotional",
  social: "Social",
};

function rankAreas(ratings: Ratings): { best: string[]; worst: string[] } {
  const rated = (Object.keys(ratings) as (keyof Ratings)[]).filter(
    (k) => ratings[k] > 0
  );
  if (rated.length === 0) return { best: [], worst: [] };
  const values = rated.map((k) => ratings[k]);
  const max = Math.max(...values);
  const min = Math.min(...values);
  return {
    best: rated.filter((k) => ratings[k] === max).map((k) => DOMAIN_NAMES[k]),
    worst: rated.filter((k) => ratings[k] === min).map((k) => DOMAIN_NAMES[k]),
  };
}

function plural(n: number): string {
  return n === 1 ? "this domain" : "these domains";
}

function bestDomainRef(n: number): string {
  return n === 1 ? "the best domain" : "the best domains";
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
            Rate your domains above to auto-compute.
          </span>
        )}
      </div>
    </div>
  );
}

export function PlanView({ week, onChange }: PlanViewProps) {
  const updateRatings = (key: keyof Ratings, value: Rating) => {
    onChange({ ...week, ratings: { ...week.ratings, [key]: value } });
  };

  const updateGoals = (goals: WeekEntry["goals"]) => {
    onChange({ ...week, goals });
  };

  const { best, worst } = rankAreas(week.ratings);
  const bestPlaceholder = `Is there a specific action or habit making a difference? What action is making ${plural(best.length)} the best?`;
  const worstPlaceholder = `What small step can improve ${plural(worst.length)}? Can you apply insights from ${bestDomainRef(best.length)}?`;

  return (
    <div className="space-y-6">
      <section className="border border-parchment-200 bg-parchment-50 p-4 sm:p-6">
        <DomainRatings ratings={week.ratings} onChange={updateRatings} />
      </section>

      <section className="border border-parchment-200 bg-parchment-50 p-4 sm:p-6">
        <h3 className="text-xs uppercase tracking-[0.2em] text-ink-400 border-b border-parchment-300 pb-1 mb-4">
          Best & Worst Assessment
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <AreaField
            label="Best Area"
            names={best}
            tone="text-olive-700"
          />
          <AreaField
            label="Worst Area"
            names={worst}
            tone="text-rust-600"
          />
          <TextInput
            label="Why Best"
            value={week.bestAreaWhy}
            onChange={(v) => onChange({ ...week, bestAreaWhy: v })}
            multiline
            rows={3}
            placeholder={bestPlaceholder}
          />
          <TextInput
            label="Why Worst"
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
            label="Weekly Goal"
            value={week.weeklyGoal}
            onChange={(v) => onChange({ ...week, weeklyGoal: v })}
            multiline
            rows={2}
            placeholder="One clear mission objective for the week"
          />
          <GoalManager goals={week.goals} onChange={updateGoals} />
        </div>
      </section>
    </div>
  );
}