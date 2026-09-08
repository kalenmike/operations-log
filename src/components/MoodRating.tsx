import type { Rating } from "../types";
import { useLang } from "../lib/i18n";

interface MoodRatingProps {
  value: Rating;
  onChange?: (value: Rating) => void;
  readonly?: boolean;
}

export function MoodRating({ value, onChange, readonly }: MoodRatingProps) {
  const { t } = useLang();
  const MOOD_LABELS: Record<Rating, string> = {
    1: t("mood.1"),
    2: t("mood.2"),
    3: t("mood.3"),
    4: t("mood.4"),
    5: t("mood.5"),
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs uppercase tracking-[0.2em] text-ink-400 font-mono">
        {t("mood.dailyMood")}
      </label>
      <div className="flex gap-1">
        {([1, 2, 3, 4, 5] as const).map((level) => (
          <button
            key={level}
            type="button"
            disabled={readonly}
            aria-label={t("mood.aria", { level, label: MOOD_LABELS[level] })}
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
