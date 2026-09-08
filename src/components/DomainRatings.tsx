import { Circle, Compass, Zap, BookOpen, HeartHandshake, Users, ChevronUp, ChevronDown } from 'lucide-react';
import type { Rating } from "../types";
import type { ElementType } from 'react';
import { useLang } from "../lib/i18n";

export interface Ratings {
    spiritual: Rating;
    physical: Rating;
    intellectual: Rating;
    emotional: Rating;
    social: Rating;
}

interface DomainRatingsProps {
    ratings: Ratings;
    previousRatings?: Ratings;
    onChange?: (key: keyof Ratings, value: Rating) => void;
    readonly?: boolean;
    compact?: boolean;
}

const DOMAINS: { key: keyof Ratings; icon: ElementType<{ className?: string }> }[] = [
    { key: "spiritual", icon: Compass },
    { key: "physical", icon: Zap },
    { key: "intellectual", icon: BookOpen },
    { key: "emotional", icon: HeartHandshake },
    { key: "social", icon: Users },
];

const RATING_CIRCLES = [1, 2, 3, 4, 5] as const;

function DeltaIndicator({ current, previous }: { current: Rating; previous?: Rating }) {
    if (!current || !previous || current === previous) return null;
    return current > previous ? (
        <ChevronUp className="w-3.5 h-3.5 stroke-[2.5] text-olive-600 shrink-0" />
    ) : (
        <ChevronDown className="w-3.5 h-3.5 stroke-[2.5] text-rust-600 shrink-0" />
    );
}

function RatingCircles({
    ratings,
    domain,
    label,
    buttonCls,
    circleCls,
    readonly,
    onChange,
}: {
    ratings: Ratings;
    domain: (typeof DOMAINS)[number];
    label: string;
    buttonCls?: string;
    circleCls?: string;
    readonly?: boolean;
    onChange?: (key: keyof Ratings, value: Rating) => void;
}) {
    const { t } = useLang();
    return (
        <div className="flex gap-1">
            {RATING_CIRCLES.map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly}
                    aria-label={t("rating.aria", { label, star })}
                    onClick={() => onChange?.(domain.key, star)}
                    className={`${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
                        }    ${star <= ratings[domain.key] ? "text-gold-500" : "text-parchment-200"
                        } ${buttonCls ?? ""}`}
                >
                    <Circle className={`fill-current stroke-[3] ${circleCls ?? ""}`} />
                </button>
            ))}
        </div>
    );
}

export function DomainRatings({ ratings, previousRatings, onChange, readonly, compact }: DomainRatingsProps) {
    const { t } = useLang();
    if (compact) {
        return (
            <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-[0.2em] text-ink-400 font-mono">
                    {t("domain.assessment")}
                </h3>
                <div className="divide-y divide-parchment-100">
                    {DOMAINS.map(({ key, icon: IconComponent }) => {
                        const label = t(`domain.${key}`);
                        return (
                            <div
                                key={key}
                                className="flex items-center justify-between gap-3 py-1.5"
                            >
                                <span className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-ink-500">
                                    <IconComponent className="w-4 h-4 stroke-[1.5] text-gold-500 shrink-0" />
                                    {label}
                                    <DeltaIndicator current={ratings[key]} previous={previousRatings?.[key]} />
                                </span>
                                <RatingCircles
                                    ratings={ratings}
                                    domain={{ key, icon: IconComponent }}
                                    label={label}
                                    readonly
                                    circleCls="w-3.5 h-3.5 sm:w-4 sm:h-4"
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-[0.2em] text-ink-400 border-b border-parchment-300 pb-1">
                {t("domain.assessment")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {DOMAINS.map(({ key, icon: IconComponent }) => {
                    const label = t(`domain.${key}`);
                    return (
                        <div
                            key={key}
                            className="flex items-center gap-3 p-3 border border-parchment-200 bg-parchment-100/50 sm:flex-col sm:items-center sm:gap-1 sm:justify-center sm:text-center"
                        >
                            <IconComponent className="w-7 h-7 shrink-0 stroke-[1] text-gold-500 sm:w-12 sm:h-12" />
                            <div className="flex flex-col gap-1.5 min-w-0 sm:items-center">
                                <span className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-ink-500">
                                    {label}
                                    <DeltaIndicator current={ratings[key]} previous={previousRatings?.[key]} />
                                </span>
                                <RatingCircles
                                    ratings={ratings}
                                    domain={{ key, icon: IconComponent }}
                                    label={label}
                                    onChange={onChange}
                                    readonly={readonly}
                                    circleCls="w-5 h-5 sm:w-4 sm:h-4"
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}