import type { Rating } from "../types";

interface MoodRatingProps {
  value: Rating;
  onChange?: (value: Rating) => void;
  readonly?: boolean;
}

const MOOD_LABELS: Record<Rating, string> = {
  1: "Struggling",
  2: "Low",
  3: "Steady",
  4: "Good",
  5: "Strong",
};

export function MoodRating({ value, onChange, readonly }: MoodRatingProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs uppercase tracking-[0.2em] text-ink-400 font-mono">
        Daily Mood
      </label>
      <div className="flex gap-1">
        {([1, 2, 3, 4, 5] as const).map((level) => (
          <button
            key={level}
            type="button"
            disabled={readonly}
            aria-label={`Mood ${level} of 5 — ${MOOD_LABELS[level]}`}
            onClick={() => onChange?.(level)}
            className={`flex-1 flex flex-col items-center justify-center px-1 py-2 border text-xs font-mono uppercase tracking-wider transition-colors min-w-0 ${
              readonly ? "cursor-default" : "cursor-pointer"
            } ${
              level === value
                ? "border-ink-600 bg-ink-800 text-parchment-100"
                : "border-parchment-300 bg-parchment-50 text-ink-500 hover:border-ink-400"
            }`}
          >
            <span className="text-lg leading-none">{level}</span>
            <span className="mt-1 whitespace-nowrap text-[10px]">{MOOD_LABELS[level]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
