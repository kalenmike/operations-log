const SETTINGS_KEY = "aar-settings";

export interface Settings {
  weekStartsOn: number; // 0=Sun ... 6=Sat (JS Date convention)
  weekStartsLabel: string;
}

export function getSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Settings>;
      return {
        weekStartsOn: typeof parsed.weekStartsOn === "number" ? parsed.weekStartsOn : 1,
        weekStartsLabel: parsed.weekStartsLabel ?? "Monday",
      };
    }
  } catch {
    // fall through to default
  }
  return { weekStartsOn: 1, weekStartsLabel: "Monday" };
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function isFirstRun(): boolean {
  return !localStorage.getItem("aar-initialized");
}

export function markInitialized(): void {
  localStorage.setItem("aar-initialized", "1");
}