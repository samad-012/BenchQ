/**
 * Which API modules are served by the real backend. Everything else is served
 * by src/mocks. Set NEXT_PUBLIC_LIVE_MODULES=companies,jobs in .env.local.
 * Temporary: once every module is live and src/mocks is gone, delete this file.
 */
export type ApiModule =
  | "session"
  | "team"
  | "candidates"
  | "companies"
  | "jobs"
  | "records"
  | "resumes"
  | "applications"
  | "followups"
  | "documents"
  | "inbox"
  | "ledger"
  | "agents";

const liveModules = new Set(
  (process.env.NEXT_PUBLIC_LIVE_MODULES ?? "")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean),
);

export function isLive(module: ApiModule): boolean {
  return liveModules.has(module);
}
