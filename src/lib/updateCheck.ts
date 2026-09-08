export const INSTALLED_VERSION_KEY = "aar-installed-version";
export const DISMISSED_VERSION_KEY = "aar-dismissed-version";
const JUST_UPDATED_KEY = "aar-just-updated";

interface VersionInfo {
  version: string;
}

function readSession(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSession(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function readLocal(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLocal(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function removeSession(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export async function fetchRemoteVersion(): Promise<string | null> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}version.json`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "";
    if (!type.includes("application/json")) return null;
    const info = (await res.json()) as VersionInfo;
    return info.version ?? null;
  } catch {
    return null;
  }
}

export async function checkForUpdates(options?: {
  ignoreDismissed?: boolean;
}): Promise<string | null> {
  const remote = await fetchRemoteVersion();
  if (!remote) return null;

  if (readSession(JUST_UPDATED_KEY) === "1") {
    removeSession(JUST_UPDATED_KEY);
    writeLocal(INSTALLED_VERSION_KEY, remote);
    return null;
  }

  const installed = readLocal(INSTALLED_VERSION_KEY);
  if (!installed) {
    writeLocal(INSTALLED_VERSION_KEY, remote);
    return null;
  }
  if (installed === remote) return null;
  if (!options?.ignoreDismissed && readSession(DISMISSED_VERSION_KEY) === remote) {
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
  writeSession(JUST_UPDATED_KEY, "1");
  window.location.reload();
}