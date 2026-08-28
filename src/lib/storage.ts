import { openDB, type IDBPDatabase } from "idb";
import type { WeekEntry } from "../types";
import { APP_VERSION } from "./version";

const DB_NAME = "aar-journal";
const DB_VERSION = 2;
const STORE_NAME = "weeks";
const META_STORE = "meta";

let dbInstance: IDBPDatabase | null = null;

async function getDB() {
  if (dbInstance) return dbInstance;
  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("startDate", "startDate");
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: "key" });
      }
    },
  });
  return dbInstance;
}

type StoredWeek = WeekEntry & {
  habits?: unknown;
  bestArea?: unknown;
  worstArea?: unknown;
};

function normalizeWeek(raw: StoredWeek): WeekEntry {
  const { habits: _h, bestArea: _b, worstArea: _w, ...clean } = raw;
  return clean;
}

export async function getAllWeeks(): Promise<WeekEntry[]> {
  const db = await getDB();
  const weeks = (await db.getAll(STORE_NAME)) as StoredWeek[];
  return weeks.map(normalizeWeek).sort((a, b) => b.startDate.localeCompare(a.startDate));
}

export async function getWeek(id: string): Promise<WeekEntry | undefined> {
  const db = await getDB();
  const week = (await db.get(STORE_NAME, id)) as StoredWeek | undefined;
  return week ? normalizeWeek(week) : undefined;
}

export async function getWeekByDate(
  startDate: string,
): Promise<WeekEntry | undefined> {
  const db = await getDB();
  const index = db.transaction(STORE_NAME).store.index("startDate");
  const week = (await index.get(startDate)) as StoredWeek | undefined;
  return week ? normalizeWeek(week) : undefined;
}

export async function saveWeek(week: WeekEntry): Promise<void> {
  const db = await getDB();
  const tx = db.transaction([STORE_NAME, META_STORE], "readwrite");
  await tx.objectStore(STORE_NAME).put(week);
  await tx.objectStore(META_STORE).put({ key: "version", value: APP_VERSION });
  await tx.done;
}

export async function deleteWeek(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

export function exportData(weeks: WeekEntry[]): string {
  return JSON.stringify(
    { version: APP_VERSION, exportedAt: new Date().toISOString(), weeks },
    null,
    2
  );
}

export interface ImportResult {
  weeks: WeekEntry[];
  version: string;
}

function normalizeBackupVersion(v: unknown): string {
  if (typeof v === "string" && /^\d+\.\d+\.\d+$/.test(v)) return v;
  if (typeof v === "number") return `${v}.0.0`;
  return "1.0.0";
}

export async function importData(json: string): Promise<ImportResult> {
  const data = JSON.parse(json);
  if (!data.weeks || !Array.isArray(data.weeks)) {
    throw new Error("Invalid backup format");
  }
  const version = normalizeBackupVersion(data.version);
  const db = await getDB();
  const tx = db.transaction([STORE_NAME, META_STORE], "readwrite");
  for (const rawWeek of data.weeks) {
    await tx.objectStore(STORE_NAME).put(normalizeWeek(rawWeek as StoredWeek));
  }
  await tx.objectStore(META_STORE).put({ key: "version", value: APP_VERSION });
  await tx.done;
  return { weeks: data.weeks, version };
}

export async function getStoredVersion(): Promise<string | null> {
  const db = await getDB();
  const rec = (await db.get(META_STORE, "version")) as
    | { key: string; value: string }
    | undefined;
  return rec?.value ?? null;
}

export async function setStoredVersion(version = APP_VERSION): Promise<void> {
  const db = await getDB();
  await db.put(META_STORE, { key: "version", value: version });
}

export async function saveLastExport(dateIso: string): Promise<void> {
  const db = await getDB();
  await db.put(META_STORE, { key: "lastExport", date: dateIso });
}

export async function getLastExport(): Promise<string | null> {
  const db = await getDB();
  const rec = (await db.get(META_STORE, "lastExport")) as
    | { key: string; date: string }
    | undefined;
  return rec?.date ?? null;
}
