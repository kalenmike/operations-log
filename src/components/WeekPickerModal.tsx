import { useEffect, useRef, useState } from "react";
import { getSettings } from "../lib/settings";
import { getMonday, getTodayString, getWeekRange, formatDate, getDayLabel } from "../lib/dates";

type Mode = "week" | "month" | "year";

interface WeekPickerModalProps {
  open: boolean;
  currentStartDate: string;
  onSelect: (startDate: string) => void;
  onClose: () => void;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function toDate(dateStr: string): Date {
  return new Date(dateStr + "T12:00:00");
}

const navBtn =
  "px-3 py-1 border border-parchment-300 text-ink-600 text-xs uppercase tracking-widest font-mono cursor-pointer hover:border-ink-500 bg-parchment-50";

export function WeekPickerModal({ open, currentStartDate, onSelect, onClose }: WeekPickerModalProps) {
  const [mode, setMode] = useState<Mode>("week");
  const [year, setYear] = useState(() => toDate(currentStartDate).getFullYear());
  const [month, setMonth] = useState(() => toDate(currentStartDate).getMonth());
  const prevOpen = useRef(open);

  useEffect(() => {
    if (open && !prevOpen.current) {
      const d = toDate(currentStartDate);
      setYear(d.getFullYear());
      setMonth(d.getMonth());
      setMode("week");
    }
    prevOpen.current = open;
  }, [open, currentStartDate]);

  if (!open) return null;

  const weekStartsOn = getSettings().weekStartsOn;
  const today = toDate(getTodayString());
  const currentWeek = getWeekRange(currentStartDate);
  const anchorDate = toDate(currentStartDate);

  const jumpToWeek = (date: Date) => {
    onSelect(formatDate(getMonday(date)));
    onClose();
  };

  const tabBtn = (id: Mode, label: string) => (
    <button
      type="button"
      onClick={() => setMode(id)}
      className={`px-3 py-2 text-xs uppercase tracking-widest font-mono border-b-2 cursor-pointer transition-colors ${
        mode === id
          ? "border-ink-800 text-ink-800"
          : "border-transparent text-ink-400 hover:text-ink-600"
      }`}
    >
      {label}
    </button>
  );

  const leading = (new Date(year, month, 1).getDay() - weekStartsOn + 7) % 7;
  const dims = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < leading; i++) cells.push(null);
  for (let d = 1; d <= dims; d++) cells.push(formatDate(new Date(year, month, d)));
  while (cells.length % 7 !== 0) cells.push(null);

  const yearCells = Array.from({ length: 12 }, (_, i) => year - 6 + i);
  const headerYear = [yearCells[0], yearCells[yearCells.length - 1]];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-ink-900/60 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Jump to week"
    >
      <div className="w-full max-w-3xl border-4 border-double border-ink-800 bg-parchment-50 text-ink-800">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-parchment-300">
          <div className="flex gap-4">
            {tabBtn("week", "Week")}
            {tabBtn("month", "Month")}
            {tabBtn("year", "Year")}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => jumpToWeek(today)} className={navBtn}>
              Today
            </button>
            <button type="button" onClick={onClose} aria-label="Close" className={navBtn}>
              ✕
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {mode === "week" && (
            <>
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  className={navBtn}
                  onClick={() => {
                    setMonth((m) => (m === 0 ? 11 : m - 1));
                    if (month === 0) setYear((y) => y - 1);
                  }}
                >
                  ◄
                </button>
                <div className="font-mono text-sm uppercase tracking-widest text-ink-700">
                  {MONTHS[month]} {year}
                </div>
                <button
                  type="button"
                  className={navBtn}
                  onClick={() => {
                    setMonth((m) => (m === 11 ? 0 : m + 1));
                    if (month === 11) setYear((y) => y + 1);
                  }}
                >
                  ►
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-1">
                {Array.from({ length: 7 }, (_, i) => (
                  <div
                    key={i}
                    className="text-[10px] font-mono uppercase tracking-widest text-ink-400 text-center py-1"
                  >
                    {getDayLabel(i)}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {cells.map((d, i) => {
                  if (!d) return <div key={`blank-${i}`} />;
                  const date = toDate(d);
                  const inCurrentWeek = d >= currentWeek.start && d <= currentWeek.end;
                  const isTodayDate = d === formatDate(today);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => jumpToWeek(date)}
                      className={`aspect-square border cursor-pointer flex flex-col items-center justify-center font-mono text-sm transition-colors ${
                        inCurrentWeek
                          ? "border-olive-600 bg-olive-500 text-parchment-50"
                          : isTodayDate
                            ? "border-rust-500 bg-rust-500/10 text-ink-800"
                            : "border-parchment-300 bg-parchment-50 text-ink-700 hover:border-ink-500"
                      }`}
                    >
                      {d.slice(8)}
                      {isTodayDate && (
                        <span className="text-[8px] uppercase tracking-wider text-rust-600">
                          today
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {mode === "month" && (
            <>
              <div className="flex items-center justify-between mb-4">
                <button type="button" className={navBtn} onClick={() => setYear((y) => y - 1)}>
                  ◄
                </button>
                <div className="font-mono text-sm uppercase tracking-widest text-ink-700">{year}</div>
                <button type="button" className={navBtn} onClick={() => setYear((y) => y + 1)}>
                  ►
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {MONTHS.map((m, i) => {
                  const active =
                    anchorDate.getFullYear() === year && anchorDate.getMonth() === i;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => jumpToWeek(new Date(year, i, 1))}
                      className={`py-3 border font-mono text-sm uppercase tracking-widest cursor-pointer transition-colors ${
                        active
                          ? "border-olive-600 bg-olive-500 text-parchment-50"
                          : "border-parchment-300 bg-parchment-50 text-ink-700 hover:border-ink-500"
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {mode === "year" && (
            <>
              <div className="flex items-center justify-between mb-4">
                <button type="button" className={navBtn} onClick={() => setYear((y) => y - 12)}>
                  ◄
                </button>
                <div className="font-mono text-sm uppercase tracking-widest text-ink-700">
                  {headerYear[0]} – {headerYear[1]}
                </div>
                <button type="button" className={navBtn} onClick={() => setYear((y) => y + 12)}>
                  ►
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {yearCells.map((y) => {
                  const active = y === anchorDate.getFullYear();
                  return (
                    <button
                      key={y}
                      type="button"
                      onClick={() => jumpToWeek(new Date(y, 0, 1))}
                      className={`py-3 border font-mono text-sm tracking-widest cursor-pointer transition-colors ${
                        active
                          ? "border-olive-600 bg-olive-500 text-parchment-50"
                          : "border-parchment-300 bg-parchment-50 text-ink-700 hover:border-ink-500"
                      }`}
                    >
                      {y}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}