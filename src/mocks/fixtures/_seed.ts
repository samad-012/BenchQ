/**
 * Deterministic seeded RNG per docs/03 §6.
 * Never Math.random() at module load — the same fixture set every run keeps
 * screenshots, tests and demos stable.
 */

let state = 42;

export function seededRandom(): number {
  state = (state * 1103515245 + 12345) & 0x7fffffff;
  return state / 0x7fffffff;
}

export function resetSeed(s = 42): void {
  state = s;
}

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(seededRandom() * arr.length)]!;
}

export function pickN<T>(arr: readonly T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(seededRandom() * copy.length);
    out.push(copy.splice(idx, 1)[0]!);
  }
  return out;
}

/** Dates relative to now, so fixtures never go stale. */
export const daysAgo = (n: number): string =>
  new Date(Date.now() - n * 86_400_000).toISOString();

export const daysFromNow = (n: number): string =>
  new Date(Date.now() + n * 86_400_000).toISOString();

export const hoursAgo = (n: number): string =>
  new Date(Date.now() - n * 3_600_000).toISOString();
