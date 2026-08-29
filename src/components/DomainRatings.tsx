import { Circle, Compass, Zap, BookOpen, HeartHandshake, Users } from 'lucide-react';
import type { Rating } from "../types";
import type { ElementType } from 'react';

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
    compact?: boolean;
}

const DOMAINS: { key: keyof Ratings; label: string; icon: ElementType<{ className?: string }> }[] = [
    { key: "spiritual", label: "Spiritual", icon: Compass },
    { key: "physical", label: "Physical", icon: Zap },
    { key: "intellectual", label: "Intellectual", icon: BookOpen },
    { key: "emotional", label: "Emotional", icon: HeartHandshake },
    { key: "social", label: "Social", icon: Users },
];

const RATING_CIRCLES = [1, 2, 3, 4, 5] as const;

function RatingCircles({
    ratings,
    domain,
    buttonCls,
    circleCls,
    readonly,
    onChange,
}: {
    ratings: Ratings;
    domain: (typeof DOMAINS)[number];
    buttonCls?: string;
    circleCls?: string;
    readonly?: boolean;
    onChange?: (key: keyof Ratings, value: Rating) => void;
}) {
    return (
        <div className="flex gap-1">
            {RATING_CIRCLES.map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly}
                    aria-label={`${domain.label} rating ${star} of 5`}
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

export function DomainRatings({ ratings, onChange, readonly, compact }: DomainRatingsProps) {
    if (compact) {
        return (
            <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-[0.2em] text-ink-400 font-mono">
                    Domain Assessment
                </h3>
                <div className="divide-y divide-parchment-100">
                    {DOMAINS.map(({ key, label, icon: IconComponent }) => (
                        <div
                            key={key}
                            className="flex items-center justify-between gap-3 py-1.5"
                        >
                            <span className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-ink-500">
                                <IconComponent className="w-4 h-4 stroke-[1.5] text-gold-500 shrink-0" />
                                {label}
                            </span>
                            <RatingCircles
                                ratings={ratings}
                                domain={{ key, label, icon: IconComponent }}
                                readonly
                                circleCls="w-3.5 h-3.5 sm:w-4 sm:h-4"
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-[0.2em] text-ink-400 border-b border-parchment-300 pb-1">
                Domain Assessment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {DOMAINS.map(({ key, label, icon: IconComponent }) => (
                    <div
                        key={key}
                        className="flex items-center gap-3 p-3 border border-parchment-200 bg-parchment-100/50 sm:flex-col sm:items-center sm:gap-1 sm:justify-center sm:text-center"
                    >
                        <IconComponent className="w-7 h-7 shrink-0 stroke-[1] text-gold-500 sm:w-12 sm:h-12" />
                        <div className="flex flex-col gap-1.5 min-w-0 sm:items-center">
                            <span className="text-xs font-mono uppercase tracking-wider text-ink-500">
                                {label}
                            </span>
                            <RatingCircles
                                ratings={ratings}
                                domain={{ key, label, icon: IconComponent }}
                                onChange={onChange}
                                readonly={readonly}
                                circleCls="w-5 h-5 sm:w-4 sm:h-4"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}