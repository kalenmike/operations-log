import { useState } from "react";
import type { WeekEntry } from "../types";
import { Performance } from "./Performance";
import { ExportImport } from "./ExportImport";
import { SettingsPanel } from "./SettingsPanel";

interface ArchiveViewProps {
  weeks: WeekEntry[];
  currentWeekId: string;
  onImported: () => void;
  onExported: (dateIso: string) => void;
}

type ArchiveTab = "metrics" | "data";

export function ArchiveView({ weeks, currentWeekId, onImported, onExported }: ArchiveViewProps) {
  const [tab, setTab] = useState<ArchiveTab>("metrics");

  const tabBtn = (tabId: ArchiveTab, label: string) => (
    <button
      type="button"
      onClick={() => setTab(tabId)}
      className={`px-3 py-2 text-xs uppercase tracking-widest font-mono border-b-2 cursor-pointer transition-colors ${
        tab === tabId
          ? "border-ink-800 text-ink-800"
          : "border-transparent text-ink-400 hover:text-ink-600"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <nav className="flex justify-center gap-4 sm:gap-8 border-b border-parchment-300">
        {tabBtn("metrics", "Metrics")}
        {tabBtn("data", "Data")}
      </nav>

      {tab === "metrics" && (
        <section className="border border-parchment-200 bg-parchment-50 p-4 sm:p-6">
          <Performance weeks={weeks} currentWeekId={currentWeekId} />
        </section>
      )}

      {tab === "data" && (
        <div className="space-y-6">
          <section className="border border-parchment-200 bg-parchment-50 p-4 sm:p-6">
            <ExportImport weeks={weeks} onImport={onImported} onExported={onExported} />
          </section>
          <section className="border border-parchment-200 bg-parchment-50 p-4 sm:p-6">
            <SettingsPanel />
          </section>
        </div>
      )}
    </div>
  );
}