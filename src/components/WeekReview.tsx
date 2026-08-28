import type { WeekEntry } from "../types";
import { TextInput } from "./TextInput";

interface WeekReviewProps {
  week: WeekEntry;
  onChange: (week: WeekEntry) => void;
}

export function WeekReview({ week, onChange }: WeekReviewProps) {
  const updateGiver = (index: 0 | 1, value: string) => {
    const givers = [...week.energyGivers] as [string, string];
    givers[index] = value;
    onChange({ ...week, energyGivers: givers });
  };

  const updateDrainer = (index: 0 | 1, value: string) => {
    const drainers = [...week.energyDrainers] as [string, string];
    drainers[index] = value;
    onChange({ ...week, energyDrainers: drainers });
  };

  return (
    <div className="space-y-4">
      <TextInput
        label="Week Summary"
        value={week.weekSummary}
        onChange={(v) => onChange({ ...week, weekSummary: v })}
        multiline
        rows={4}
        placeholder="Overall summary of the week's operations..."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          label="Wins"
          value={week.wins}
          onChange={(v) => onChange({ ...week, wins: v })}
          multiline
          rows={3}
          placeholder="Victories, big or small"
        />
        <TextInput
          label="Review"
          value={week.review}
          onChange={(v) => onChange({ ...week, review: v })}
          multiline
          rows={3}
          placeholder="Honest assessment of execution"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <h3 className="text-xs uppercase tracking-[0.2em] text-olive-600 font-mono">
            Gave Energy
          </h3>
          <TextInput
            label="1"
            value={week.energyGivers[0]}
            onChange={(v) => updateGiver(0, v)}
            placeholder="Thing one"
          />
          <TextInput
            label="2"
            value={week.energyGivers[1]}
            onChange={(v) => updateGiver(1, v)}
            placeholder="Thing two"
          />
        </div>
        <div className="space-y-2">
          <h3 className="text-xs uppercase tracking-[0.2em] text-rust-600 font-mono">
            Drained Energy
          </h3>
          <TextInput
            label="1"
            value={week.energyDrainers[0]}
            onChange={(v) => updateDrainer(0, v)}
            placeholder="Thing one"
          />
          <TextInput
            label="2"
            value={week.energyDrainers[1]}
            onChange={(v) => updateDrainer(1, v)}
            placeholder="Thing two"
          />
        </div>
      </div>

      <TextInput
        label="Quote / Affirmation for Next Week"
        value={week.nextWeekQuote}
        onChange={(v) => onChange({ ...week, nextWeekQuote: v })}
        multiline
        rows={2}
        placeholder="Words to carry forward..."
      />
    </div>
  );
}