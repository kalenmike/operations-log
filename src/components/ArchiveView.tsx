import { useState } from "react";
import type { ArchiveTab, WeekEntry } from "../types";
import { Performance } from "./Performance";
import { ExportImport } from "./ExportImport";
import { SettingsPanel } from "./SettingsPanel";
import { YearOverview } from "./YearOverview";
import { useLang } from "../lib/i18n";

interface ArchiveViewProps {
  weeks: WeekEntry[];
  initialTab: ArchiveTab;
  onImported: () => void;
  onExported: (dateIso: string) => void;
}

export function ArchiveView({ weeks, initialTab, onImported, onExported }: ArchiveViewProps) {
  const { t } = useLang();
  const [tab, setTab] = useState<ArchiveTab>(initialTab);

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
        {tabBtn("metrics", t("menu.metrics"))}
        {tabBtn("settings", t("menu.settings"))}
        {tabBtn("data", t("menu.data"))}
      </nav>

      {tab === "metrics" && (
        <>
          <section className="border border-parchment-200 bg-parchment-50 p-4 sm:p-6">
            <YearOverview weeks={weeks} />
          </section>
          <section className="border border-parchment-200 bg-parchment-50 p-4 sm:p-6">
            <Performance weeks={weeks} />
          </section>
        </>
      )}

      {tab === "settings" && (
        <section className="border border-parchment-200 bg-parchment-50 p-4 sm:p-6">
          <SettingsPanel />
        </section>
      )}

      {tab === "data" && (
        <section className="border border-parchment-200 bg-parchment-50 p-4 sm:p-6">
          <ExportImport weeks={weeks} onImport={onImported} onExported={onExported} />
        </section>
      )}
    </div>
  );
}