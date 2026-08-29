let swRegistration: ServiceWorkerRegistration | null = null;

export function setSWRegistration(reg: ServiceWorkerRegistration | null | undefined): void {
  swRegistration = reg ?? null;
}

export function getSWRegistration(): ServiceWorkerRegistration | null {
  return swRegistration;
}

export type UpdateResult = "updated" | "fresh" | "none";

function waitForWaiting(reg: ServiceWorkerRegistration, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    if (reg.waiting) return resolve(true);
    const started = Date.now();
    const iv = window.setInterval(() => {
      if (reg.waiting) {
        window.clearInterval(iv);
        resolve(true);
      } else if (Date.now() - started > timeoutMs) {
        window.clearInterval(iv);
        resolve(false);
      }
    }, 120);
  });
}

export async function updateNow(): Promise<UpdateResult> {
  const reg = getSWRegistration();
  if (!reg) return "none";

  await reg.update();
  const hasWaiting = await waitForWaiting(reg, 3000);

  if (hasWaiting && reg.waiting) {
    reg.waiting.postMessage({ type: "SKIP_WAITING" });
    return "updated";
  }
  return "fresh";
}