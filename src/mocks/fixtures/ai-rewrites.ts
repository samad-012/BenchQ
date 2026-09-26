import type { RewriteAction, RewriteResult } from "@/lib/schemas/resume-document";

/**
 * Simulated AI rewrites for a text selection (docs/03 §5 — no LLM call).
 * Deterministic string transforms that read like a model's output. Whatever
 * comes back is treated as unverified by the builder.
 */

const STRONG_VERBS: Array<[RegExp, string]> = [
  [/^worked on\b/i, "Delivered"],
  [/^helped( to)?\b/i, "Drove"],
  [/^responsible for\b/i, "Owned"],
  [/^was part of\b/i, "Contributed to"],
  [/^made\b/i, "Built"],
  [/^did\b/i, "Executed"],
  [/^developed and maintained\b/i, "Engineered and scaled"],
  [/^implemented\b/i, "Designed and shipped"],
  [/^reduced\b/i, "Cut"],
  [/^improved\b/i, "Strengthened"],
  [/^led\b/i, "Directed"],
];

const FILLER: Array<[RegExp, string]> = [
  [/\bin order to\b/gi, "to"],
  [/\ba number of\b/gi, "several"],
  [/\bsuccessfully\s+/gi, ""],
  [/\bvarious\s+/gi, ""],
  [/\b(very|really|basically|actually)\s+/gi, ""],
  [/\butilized\b/gi, "used"],
  [/\bin the process of\s+/gi, ""],
];

const upperFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const tidy = (s: string) => s.replace(/\s{2,}/g, " ").replace(/\s+([,.;])/g, "$1").trim();

function improve(text: string): string {
  for (const [pattern, verb] of STRONG_VERBS) {
    if (pattern.test(text)) return tidy(text.replace(pattern, verb));
  }
  return tidy(`${upperFirst(text.replace(/\.$/, ""))}, partnering with product and QA to ship on schedule`);
}

function concise(text: string): string {
  let out = FILLER.reduce((acc, [pattern, sub]) => acc.replace(pattern, sub), text);
  if (out.length > 90 && out.includes(", ")) out = out.slice(0, out.indexOf(", "));
  return upperFirst(tidy(out));
}

function quantify(text: string): string {
  const base = text.replace(/\.$/, "");
  if (/\d/.test(base)) return tidy(`${base} across 3 product teams`);
  return tidy(`${base}, cutting turnaround time by 30%`);
}

function grammar(text: string): string {
  return upperFirst(tidy(text.replace(/\bi\b/g, "I").replace(/\s+,/g, ",").replace(/,(?=\S)/g, ", ")));
}

const NOTES: Record<RewriteAction, string> = {
  improve: "AI rewrite — confirm the wording still matches what the candidate did.",
  concise: "AI shortened this — confirm nothing important was dropped.",
  quantify: "AI added a metric — confirm the number with the candidate before it ships.",
  grammar: "AI corrected grammar — review before it ships.",
};

export function simulateRewrite(text: string, action: RewriteAction): RewriteResult {
  const fn = { improve, concise, quantify, grammar }[action];
  const rewritten = fn(text.trim());
  return { text: rewritten === text.trim() ? improve(text.trim()) : rewritten, note: NOTES[action] };
}
