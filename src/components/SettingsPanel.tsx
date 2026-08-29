import { useState } from "react";
import { getSettings, saveSettings } from "../lib/settings";
import { updateNow, type UpdateResult } from "../lib/swStatus";

export function SettingsPanel() {
  const [settings, setSettings] = useState(() => getSettings());
  const [updateStatus, setUpdateStatus] = useState<"idle" | "working" | UpdateResult>("idle");

  const handleDayChange = (value: number) => {
    const labels = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    saveSettings({ weekStartsOn: value, weekStartsLabel: labels[value] });
    setSettings({ weekStartsOn: value, weekStartsLabel: labels[value] });
    window.location.reload();
  };

  const handleUpdateNow = async () => {
    setUpdateStatus("working");
    const result = await updateNow();
    setUpdateStatus(result);
    if (result === "updated") {
      window.setTimeout(() => window.location.reload(), 400);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xs uppercase tracking-[0.2em] text-ink-400 border-b border-parchment-300 pb-1">
        Preferences
      </h3>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-widest text-ink-500 font-mono">
          Week Start Day
        </label>
        <select
          value={settings.weekStartsOn}
          onChange={(e) => handleDayChange(Number(e.target.value))}
          className="w-full px-3 py-2 border border-parchment-300 bg-parchment-50 text-sm font-mono text-ink-700 focus:outline-none focus:border-ink-500"
        >
          <option value={0}>Sunday</option>
          <option value={1}>Monday</option>
          <option value={2}>Tuesday</option>
          <option value={3}>Wednesday</option>
          <option value={4}>Thursday</option>
          <option value={5}>Friday</option>
          <option value={6}>Saturday</option>
        </select>
        <p className="text-xs font-mono text-ink-400">
          Controls how weekly roations are calculated. Saved to local storage.
        </p>
      </div>

      <div className="space-y-2 pt-2 border-t border-parchment-200">
        <label className="text-xs uppercase tracking-widest text-ink-500 font-mono">
          App Update
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void handleUpdateNow()}
            disabled={updateStatus === "working"}
            className="px-3 py-2 border border-ink-600 bg-ink-800 text-parchment-100 text-xs uppercase tracking-widest font-mono cursor-pointer hover:bg-ink-700 disabled:opacity-50 disabled:cursor-wait"
          >
            Update Now
          </button>
          <span className="text-xs font-mono text-ink-500">
            {updateStatus === "idle" &&
              "Checks for and installs the latest version of this app."}
            {updateStatus === "working" && "Checking for updates…"}
            {updateStatus === "updated" && "Updating — reloading…"}
            {updateStatus === "fresh" && "You're up to date."}
            {updateStatus === "none" && "Not available in this preview."}
          </span>
        </div>
      </div>
    </div>
  );
}