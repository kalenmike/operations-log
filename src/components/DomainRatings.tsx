import type { Rating } from "../types";

export interface Ratings {
  spiritual: Rating;
  physical: Rating;
  intellectual: Rating;
  emotional: Rating;
  social: Rating;
}

interface DomainRatingsProps {
  ratings: Ratings;
  onChange?: (key: keyof Ratings, value: Rating) => void;
  readonly?: boolean;
}

const DOMAINS: { key: keyof Ratings; label: string; icon: string }[] = [
  { key: "spiritual", label: "Spiritual", icon: "†" },
  { key: "physical", label: "Physical", icon: "⚡" },
  { key: "intellectual", label: "Intellectual", icon: "◆" },
  { key: "emotional", label: "Emotional", icon: "●" },
  { key: "social", label: "Social", icon: "▲" },
];

function DomainIcon({ icon }: { icon: string }) {
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 border border-current rounded-sm text-sm font-mono">
      {icon}
    </span>
  );
}

export function DomainRatings({ ratings, onChange, readonly }: DomainRatingsProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs uppercase tracking-[0.2em] text-ink-400 border-b border-parchment-300 pb-1">
        Domain Assessment
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {DOMAINS.map(({ key, label, icon }) => (
          <div
            key={key}
            className="flex flex-col items-center gap-1 p-3 border border-parchment-200 bg-parchment-100/50"
          >
            <DomainIcon icon={icon} />
            <span className="text-xs font-mono uppercase tracking-wider text-ink-500">
              {label}
            </span>
            <div className="flex gap-0.5">
              {([1, 2, 3, 4, 5] as const).map((star) => (
                <button
                  key={star}
                  type="button"
                  disabled={readonly}
                  aria-label={`${label} rating ${star} of 5`}
                  onClick={() => onChange?.(key, star)}
                  className={`text-lg ${
                    readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
                  } ${star <= ratings[key] ? "text-gold-500" : "text-parchment-300"}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
