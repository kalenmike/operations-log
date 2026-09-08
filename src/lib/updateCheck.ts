export const APP_VERSION: string = __APP_VERSION__;
export const APP_BUILD_TIME: string = __APP_BUILD_TIME__;

export const DISMISSED_VERSION_KEY = "aar-dismissed-version";

export interface VersionInfo {
  version: string;
  buildTime?: string;
}

function readSession(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function fetchRemoteVersion(): Promise<VersionInfo | null> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}version.json`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "";
    if (!type.includes("application/json")) return null;
    const info = (await res.json()) as VersionInfo;
    if (!info.version) return null;
    return info;
  } catch {
    return null;
  }
}

export function hasUpdate(remote: VersionInfo | null): boolean {
  return !!remote && remote.version !== APP_VERSION;
}

export async function checkForUpdates(options?: {
  ignoreDismissed?: boolean;
}): Promise<VersionInfo | null> {
  const remote = await fetchRemoteVersion();
  if (!remote) return null;
  if (remote.version === APP_VERSION) return null;
  if (!options?.ignoreDismissed && readSession(DISMISSED_VERSION_KEY) === remote.version) {
    return null;
  }
  return remote;
}

export async function forceUpdateNow(): Promise<void> {
  try {
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const reg of regs) {
        reg.waiting?.postMessage?.({ type: "SKIP_WAITING" });
        await reg.unregister();
      }
    }
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.allSettled(keys.map((key) => caches.delete(key)));
    }
  } catch {
    // ignore
  }
  window.location.reload();
}