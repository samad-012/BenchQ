import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);

let started: Promise<void> | null = null;

/**
 * Idempotent worker start. React 19 dev-mode strict double-invocation calls
 * this twice; MSW throws "cannot configure an already enabled network" on the
 * second call. Guarding at the module level makes both calls await the same
 * one-shot start.
 */
export function startWorker(): Promise<void> {
  if (started) return started;
  started = worker
    .start({
      onUnhandledRequest: "bypass",
      serviceWorker: { url: "/mockServiceWorker.js" },
    })
    .then(() => undefined);
  return started;
}
