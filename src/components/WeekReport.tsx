import type { ElementType, ReactNode } from "react";
import { Compass, Zap, BookOpen, HeartHandshake, Users, Circle } from "lucide-react";
import type { WeekEntry } from "../types";
import { formatDateDisplay, getWeekDays, getWeekNumber, getDayLabel } from "../lib/dates";
import { useLang } from "../lib/i18n";

const DOMAIN_ICONS: {
  key: keyof WeekEntry["ratings"];
  icon: ElementType<{ className?: string }>;
}[] = [
  { key: "spiritual", icon: Compass },
  { key: "physical", icon: Zap },
  { key: "intellectual", icon: BookOpen },
  { key: "emotional", icon: HeartHandshake },
  { key: "social", icon: Users },
];

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="mt-10 mb-3 text-[11px] font-mono uppercase tracking-[0.25em] text-ink-500 border-b border-parchment-300 pb-1">
      {children}
    </h2>
  );
}

function Box({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-lg border border-parchment-200 p-5 break-inside-avoid ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: string }) {
  return (
    <span className="font-mono text-[11px] uppercase tracking-widest text-ink-500">{children}</span>
  );
}

function Objectives({ week, labels }: { week: WeekEntry; labels: string[] }) {
  const { t } = useLang();
  return (
    <div className="space-y-3">
      {week.goals.map((g) => (
        <div key={g.id}>
          <div className="text-sm text-ink-800">
            {g.carried && <span className="text-ink-400 text-xs mr-1">{t("report.carried")}</span>}
            {g.text}
          </div>
          <div className="mt-2 flex gap-1.5">
            {labels.map((label, i) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <span className="text-[9px] font-mono uppercase text-ink-400">{label}</span>
                <span
                  className={`w-5 h-5 border text-xs flex items-center justify-center ${
                    g.done[i]
                      ? "border-olive-600 bg-olive-500 text-parchment-50"
                      : "border-parchment-400 text-transparent"
                  }`}
                >
                  {g.done[i] ? "X" : "·"}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function DomainRow({ week }: { week: WeekEntry }) {
  const { t } = useLang();
  return (
    <div className="grid grid-cols-5 gap-2">
      {DOMAIN_ICONS.map(({ key, icon: Icon }) => {
        const val = week.ratings[key];
        return (
          <div key={key} className="flex flex-col items-center gap-1 text-center py-1">
            <Icon className="w-8 h-8 stroke-[1] text-gold-500" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-500">{t(`domain.${key}`)}</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <Circle
                  key={n}
                  className={`w-3.5 h-3.5 stroke-[3] ${
                    n <= (val || 0) ? "text-gold-500 fill-current" : "text-parchment-400"
                  }`}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Checkins({ week }: { week: WeekEntry }) {
  const { t } = useLang();
  const checkins = week.dailyCheckins.filter(
    (c) => c.reflections.trim() || Number(c.moodRating) > 0
  );
  if (checkins.length === 0) return null;
  return (
    <>
      <SectionTitle>{t("report.dailyCheckins")}</SectionTitle>
      <div className="space-y-3">
        {checkins.map((c) => (
          <div
            key={c.date}
            className="rounded-lg border border-parchment-200 p-4 break-inside-avoid"
          >
            <div className="text-sm text-ink-800">
              {formatDateDisplay(c.date)}
              {Number(c.moodRating) > 0 && (
                <span className="text-ink-400 font-mono text-xs ml-2">{t("report.mood", { n: Number(c.moodRating) })}</span>
              )}
            </div>
            {c.reflections.trim() && (
              <p className="mt-1.5 text-sm text-ink-600 whitespace-pre-wrap">{c.reflections}</p>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export function WeekReport({ week }: { week: WeekEntry }) {
  const { t } = useLang();
  const wkNumber = getWeekNumber(week.startDate);
  const days = getWeekDays(week.startDate);
  const range = `${formatDateDisplay(week.startDate)} – ${formatDateDisplay(
    days[days.length - 1].toISOString().slice(0, 10)
  )}`;
  const labels = days.map((d) => getDayLabel(d.getDay()));

  return (
    <div className="print-exact text-ink-800 font-typewriter pb-14">
      <header>
        <h1 className="text-[26px] tracking-[0.18em] uppercase text-ink-900">{t("report.operationsLog")}</h1>
        <p className="mt-2 text-[11px] tracking-[0.35em] uppercase text-ink-500">
          The Kalen Michael Experiment
        </p>
        <p className="mt-3 font-mono text-xs text-ink-400">
          {t("report.week", { n: wkNumber })} · {range}
          {week.reviewedAt &&
            ` · ${t("report.closedOn", { date: new Date(week.reviewedAt).toLocaleDateString() })}`}
        </p>
        <div className="mt-4 border-b-4 border-double border-ink-800" />
      </header>

      <SectionTitle>{t("domain.assessment")}</SectionTitle>
      <Box>
        <DomainRow week={week} />
      </Box>

      {week.weeklyGoal.trim() && (
        <>
          <SectionTitle>{t("report.weeklyGoal")}</SectionTitle>
          <Box>{week.weeklyGoal}</Box>
        </>
      )}

      {week.goals.length > 0 && (
        <>
          <SectionTitle>{t("report.objectives")}</SectionTitle>
          <Box>
            <Objectives week={week} labels={labels} />
          </Box>
        </>
      )}

      {(week.bestAreaWhy.trim() || week.worstAreaWhy.trim()) && (
        <>
          <div className="break-before-page" />
          <SectionTitle>{t("report.assessmentNotes")}</SectionTitle>
          <Box className="space-y-3">
            {week.bestAreaWhy.trim() && (
              <p>
                <FieldLabel>{t("report.best")}</FieldLabel>
                {week.bestAreaWhy}
              </p>
            )}
            {week.worstAreaWhy.trim() && (
              <p>
                <FieldLabel>{t("report.worst")}</FieldLabel>
                {week.worstAreaWhy}
              </p>
            )}
          </Box>
        </>
      )}

      <Checkins week={week} />

      {(week.weekSummary.trim() || week.wins.trim() || week.review.trim()) && (
        <>
          <SectionTitle>{t("report.reflection")}</SectionTitle>
          <Box className="space-y-3">
            {week.weekSummary.trim() && (
              <p>
                <FieldLabel>{t("report.summary")}</FieldLabel>
                {week.weekSummary}
              </p>
            )}
            {week.wins.trim() && (
              <p>
                <FieldLabel>{t("report.wins")}</FieldLabel>
                {week.wins}
              </p>
            )}
            {week.review.trim() && (
              <p>
                <FieldLabel>{t("report.review")}</FieldLabel>
                {week.review}
              </p>
            )}
          </Box>
        </>
      )}

      {(week.energyGivers[0] || week.energyDrainers[0]) && (
        <>
          <SectionTitle>{t("report.energy")}</SectionTitle>
          <Box className="space-y-3">
            {week.energyGivers[0] && (
              <p>
                <FieldLabel>{t("report.givers")}</FieldLabel>
                {week.energyGivers.join(", ")}
              </p>
            )}
            {week.energyDrainers[0] && (
              <p>
                <FieldLabel>{t("report.drainers")}</FieldLabel>
                {week.energyDrainers.join(", ")}
              </p>
            )}
          </Box>
        </>
      )}

      {week.nextWeekQuote.trim() && (
        <>
          <SectionTitle>{t("report.nextWeekQuote")}</SectionTitle>
          <Box className="italic">{week.nextWeekQuote}</Box>
        </>
      )}

      {week.carriedNote?.trim() && (
        <>
          <SectionTitle>{t("report.carryForward")}</SectionTitle>
          <Box>{week.carriedNote}</Box>
        </>
      )}

      <footer className="fixed bottom-0 left-0 right-0 border-t border-parchment-300 px-3 py-1.5">
        <div className="grid grid-cols-3 items-center font-mono text-[10px] uppercase tracking-widest text-ink-400">
          <span />
          <span className="text-center">https://log.kalenmichael.com</span>
          <span className="text-right">{t("report.operationsLog")}</span>
        </div>
      </footer>
    </div>
  );
}