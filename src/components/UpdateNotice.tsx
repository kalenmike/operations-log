import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { setSWRegistration } from "../lib/swStatus";

export function UpdateNotice() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      setSWRegistration(registration);
    },
    onRegisterError(error) {
      console.error("Service worker registration failed", error);
    },
  });

  useEffect(() => {
    if (!offlineReady) return;
    const t = setTimeout(() => setOfflineReady(false), 5000);
    return () => clearTimeout(t);
  }, [offlineReady, setOfflineReady]);

  if (needRefresh) {
    return (
      <div className="fixed inset-x-0 top-0 z-50 border-b-2 border-ink-800 bg-ink-900 text-parchment-100 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="font-mono text-xs uppercase tracking-[0.2em]">
            <span className="text-gold-400">▲</span> Update available
            <span className="ml-2 text-parchment-300 normal-case tracking-normal text-[10px]">
              A new version of this log is ready to install.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => void updateServiceWorker(true)}
              className="px-3 py-1 border border-gold-500 bg-gold-500/20 text-gold-400 font-mono text-xs uppercase tracking-widest hover:bg-gold-500 hover:text-ink-900 transition-colors cursor-pointer"
            >
              Reload &amp; Update
            </button>
            <button
              type="button"
              onClick={() => setNeedRefresh(false)}
              className="px-3 py-1 border border-parchment-500 text-parchment-300 font-mono text-xs uppercase tracking-widest hover:border-parchment-100 hover:text-parchment-100 transition-colors cursor-pointer"
            >
              Later
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
          Ready to work offline
          <button
            type="button"
            onClick={() => setOfflineReady(false)}
            aria-label="Dismiss"
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