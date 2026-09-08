import { useEffect, useState } from "react";
import { getSettings, saveSettings } from "../lib/settings";
import { formatDateDisplay } from "../lib/dates";
import {
  APP_VERSION,
  APP_BUILD_TIME,
  checkForUpdates,
  forceUpdateNow,
  type VersionInfo,
} from "../lib/updateCheck";
import { useLang } from "../lib/i18n";

type UpdateStatus = "checking" | "available" | "fresh" | "none";

function formatBuild(iso: string): string {
  if (!iso) return "—";
  return `${formatDateDisplay(iso.slice(0, 10))} · ${iso.slice(11, 16)} UTC`;
}

export function SettingsPanel() {
  const { lang, setLang, t } = useLang();
  const [settings, setSettings] = useState(() => getSettings());
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>("checking");
  const [remoteVersion, setRemoteVersion] = useState<VersionInfo | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void checkForUpdates({ ignoreDismissed: true }).then((remote) => {
      if (cancelled) return;
      setRemoteVersion(remote);
      setUpdateStatus(
        remote ? "available" : navigator.onLine ? "fresh" : "none"
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDayChange = (value: number) => {
    const labels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    saveSettings({ weekStartsOn: value, weekStartsLabel: labels[value], language: lang });
    setSettings({ weekStartsOn: value, weekStartsLabel: labels[value], language: lang });
    window.location.reload();
  };

  const handleLanguageChange = (value: "en" | "es") => {
    setLang(value);
  };

  const handleUpdateNow = () => {
    if (!remoteVersion) return;
    setUpdating(true);
    void forceUpdateNow();
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
        <div className="flex flex-col gap-1.5 text-xs font-mono">
          <div className="flex items-baseline gap-2">
            <span className="uppercase tracking-widest text-ink-400">
              {t("settings.versionCurrent")}
            </span>
            <span className="text-ink-800 font-bold">
              {APP_VERSION} · {formatBuild(APP_BUILD_TIME)}
            </span>
          </div>
          {updateStatus === "available" && remoteVersion && (
            <div className="flex items-baseline gap-2">
              <span className="uppercase tracking-widest text-gold-700">
                {t("settings.versionAvailable")}
              </span>
              <span className="text-gold-700 font-bold">
                {remoteVersion.version}
                {remoteVersion.buildTime && ` · ${formatBuild(remoteVersion.buildTime)}`}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleUpdateNow}
            disabled={updateStatus !== "available" || updating}
            className="px-3 py-2 border border-ink-600 bg-ink-800 text-parchment-100 text-xs uppercase tracking-widest font-mono cursor-pointer hover:bg-ink-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t("settings.updateNow")}
          </button>
          <span className="text-xs font-mono text-ink-500">
            {updateStatus === "checking" && t("settings.update.working")}
            {updateStatus === "available" && t("settings.update.available")}
            {updateStatus === "fresh" && t("settings.update.fresh")}
            {updateStatus === "none" && t("settings.update.none")}
          </span>
        </div>
        <p className="text-xs font-mono text-ink-400">
          {t("settings.update.idle")}
        </p>
      </div>
    </div>
  );
}