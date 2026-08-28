import type { Rating } from "../types";

interface StarRatingProps {
  value: Rating;
  onChange?: (value: Rating) => void;
  label?: string;
  readonly?: boolean;
}

export function StarRating({ value, onChange, label, readonly }: StarRatingProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs uppercase tracking-widest text-ink-400 font-mono">
          {label}
        </label>
      )}
      <div className="flex gap-1">
        {([1, 2, 3, 4, 5] as const).map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            aria-label={`${label ?? "Rating"} ${star} of 5`}
            onClick={() => onChange?.(star)}
            className={`text-2xl transition-colors ${
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
            } ${star <= value ? "text-gold-500" : "text-parchment-300"}`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
}
