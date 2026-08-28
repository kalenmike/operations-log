import { useRef, useState } from "react";
import type { WeekEntry } from "../types";
import { exportData, importData, saveLastExport } from "../lib/storage";

interface ExportImportProps {
  weeks: WeekEntry[];
  onImport: (weeks: WeekEntry[]) => void;
  onExported: (dateIso: string) => void;
}

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportImport({ weeks, onImport, onExported }: ExportImportProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleExport = () => {
    if (weeks.length === 0) {
      setMessage("Nothing to export yet.");
      return;
    }
    const date = new Date();
    const stamp = date.toISOString().slice(0, 10);
    download(`aar-journal-backup-${stamp}.json`, exportData(weeks), "application/json");
    const iso = date.toISOString();
    void saveLastExport(iso);
    onExported(iso);
    setMessage("Backup exported.");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const imported = await importData(text);
      onImport(imported.weeks);
      setMessage(
        `Imported ${imported.weeks.length} week(s) (backup v${imported.version}). Existing records were merged.`
      );
    } catch (err) {
      setMessage(`Import failed: ${err instanceof Error ? err.message : "invalid file"}`);
    }
    e.target.value = "";
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleExport}
          className="px-4 py-2 border border-ink-600 bg-ink-800 text-parchment-100 text-xs uppercase tracking-widest font-mono cursor-pointer hover:bg-ink-700"
        >
          Export Backup
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="px-4 py-2 border border-parchment-400 text-ink-700 text-xs uppercase tracking-widest font-mono cursor-pointer hover:border-ink-500"
        >
          Import Backup
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      {message && (
        <p className="text-xs font-mono text-ink-400">{message}</p>
      )}
      <p className="text-xs font-mono text-ink-400">
        All data is stored locally in your browser (IndexedDB). Export regularly
        to keep your own backups. Nothing ever leaves this device.
      </p>
    </div>
  );
}