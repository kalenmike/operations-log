import { useState } from "react";
import { getSettings, saveSettings } from "../lib/settings";
import { checkForUpdates, forceUpdateNow } from "../lib/updateCheck";
import { useLang } from "../lib/i18n";

type UpdateStatus = "idle" | "working" | "updated" | "fresh" | "none";

export function SettingsPanel() {
  const { lang, setLang, t } = useLang();
  const [settings, setSettings] = useState(() => getSettings());
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>("idle");

  const handleDayChange = (value: number) => {
    const labels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    saveSettings({ weekStartsOn: value, weekStartsLabel: labels[value], language: lang });
    setSettings({ weekStartsOn: value, weekStartsLabel: labels[value], language: lang });
    window.location.reload();
  };

  const handleLanguageChange = (value: "en" | "es") => {
    setLang(value);
  };

  const handleUpdateNow = async () => {
    setUpdateStatus("working");
    if (!navigator.onLine) {
      setUpdateStatus("none");
      return;
    }
    const remote = await checkForUpdates({ ignoreDismissed: true });
    if (remote) {
      setUpdateStatus("updated");
      window.setTimeout(() => void forceUpdateNow(), 400);
    } else {
      setUpdateStatus("fresh");
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xs uppercase tracking-[0.2em] text-ink-400 border-b border-parchment-300 pb-1">
        {t("settings.preferences")}
      </h3>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-widest text-ink-500 font-mono">
          {t("settings.language")}
        </label>
        <select
          value={lang}
          onChange={(e) => handleLanguageChange(e.target.value as "en" | "es")}
          className="w-full px-3 py-2 border border-parchment-300 bg-parchment-50 text-sm font-mono text-ink-700 focus:outline-none focus:border-ink-500"
        >
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-widest text-ink-500 font-mono">
          {t("settings.weekStartDay")}
        </label>
        <select
          value={settings.weekStartsOn}
          onChange={(e) => handleDayChange(Number(e.target.value))}
          className="w-full px-3 py-2 border border-parchment-300 bg-parchment-50 text-sm font-mono text-ink-700 focus:outline-none focus:border-ink-500"
        >
          <option value={0}>{t("settings.day.0")}</option>
          <option value={1}>{t("settings.day.1")}</option>
          <option value={2}>{t("settings.day.2")}</option>
          <option value={3}>{t("settings.day.3")}</option>
          <option value={4}>{t("settings.day.4")}</option>
          <option value={5}>{t("settings.day.5")}</option>
          <option value={6}>{t("settings.day.6")}</option>
        </select>
        <p className="text-xs font-mono text-ink-400">
          {t("settings.weekStartHint")}
        </p>
      </div>

      <div className="space-y-2 pt-2 border-t border-parchment-200">
        <label className="text-xs uppercase tracking-widest text-ink-500 font-mono">
          {t("settings.appUpdate")}
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void handleUpdateNow()}
            disabled={updateStatus === "working"}
            className="px-3 py-2 border border-ink-600 bg-ink-800 text-parchment-100 text-xs uppercase tracking-widest font-mono cursor-pointer hover:bg-ink-700 disabled:opacity-50 disabled:cursor-wait"
          >
            {t("settings.updateNow")}
          </button>
          <span className="text-xs font-mono text-ink-500">
            {updateStatus === "idle" && t("settings.update.idle")}
            {updateStatus === "working" && t("settings.update.working")}
            {updateStatus === "updated" && t("settings.update.updated")}
            {updateStatus === "fresh" && t("settings.update.fresh")}
            {updateStatus === "none" && t("settings.update.none")}
          </span>
        </div>
      </div>
    </div>
  );
}