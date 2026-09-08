import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import {
  checkForUpdates,
  forceUpdateNow,
  DISMISSED_VERSION_KEY,
  type VersionInfo,
} from "../lib/updateCheck";
import { useLang } from "../lib/i18n";

export function UpdateNotice() {
  const { t } = useLang();
  const [updateVersion, setUpdateVersion] = useState<VersionInfo | null>(null);
  const {
    offlineReady: [offlineReady, setOfflineReady],
  } = useRegisterSW({
    onRegisterError(error) {
      console.error("Service worker registration failed", error);
    },
  });

  useEffect(() => {
    let cancelled = false;
    const run = () => {
      void checkForUpdates().then((remote) => {
        if (!cancelled) setUpdateVersion(remote);
      });
    };
    run();
    window.addEventListener("online", run);
    return () => {
      cancelled = true;
      window.removeEventListener("online", run);
    };
  }, []);

  useEffect(() => {
    if (!offlineReady) return;
    const timer = setTimeout(() => setOfflineReady(false), 5000);
    return () => clearTimeout(timer);
  }, [offlineReady, setOfflineReady]);

  const dismissUpdate = () => {
    if (updateVersion) {
      try {
        sessionStorage.setItem(DISMISSED_VERSION_KEY, updateVersion.version);
      } catch {
        // ignore
      }
    }
    setUpdateVersion(null);
  };

  if (updateVersion) {
    return (
      <div className="fixed inset-x-0 top-0 z-50 border-b-2 border-ink-800 bg-ink-900 text-parchment-100 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="font-mono text-xs uppercase tracking-[0.2em]">
            <span className="text-gold-400">▲</span> {t("update.available")}
            <span className="ml-2 text-parchment-300 normal-case tracking-normal text-[10px]">
              {t("update.availableSub")}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => void forceUpdateNow()}
              className="px-3 py-1 border border-gold-500 bg-gold-500/20 text-gold-400 font-mono text-xs uppercase tracking-widest hover:bg-gold-500 hover:text-ink-900 transition-colors cursor-pointer"
            >
              {t("update.reload")}
            </button>
            <button
              type="button"
              onClick={dismissUpdate}
              className="px-3 py-1 border border-parchment-500 text-parchment-300 font-mono text-xs uppercase tracking-widest hover:border-parchment-100 hover:text-parchment-100 transition-colors cursor-pointer"
            >
              {t("update.later")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (offlineReady) {
    return (
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 border border-parchment-300 bg-parchment-50 shadow-lg">
        <div className="px-4 py-2 font-mono text-xs uppercase tracking-widest text-ink-700 flex items-center gap-2">
          <span className="h-2 w-2 bg-olive-500 inline-block" />
          {t("update.offlineReady")}
          <button
            type="button"
            onClick={() => setOfflineReady(false)}
            aria-label={t("update.dismiss")}
            className="text-ink-400 hover:text-ink-700 ml-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return null;
}