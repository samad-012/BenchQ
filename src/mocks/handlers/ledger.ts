import { http } from "msw";
import { respond } from "./_util";
import type { LedgerEntry } from "@/lib/schemas/analytics";
import { candidatesFixture } from "@/mocks/fixtures/candidates";
import { daysAgo, resetSeed, seededRandom, pick } from "@/mocks/fixtures/_seed";

resetSeed(800);

const ACTIONS: LedgerEntry["action"][] = [
  "CREATE", "UPDATE", "STATE_CHANGE", "AI_GENERATE", "EXPORT",
];

const ledgerEntries: LedgerEntry[] = Array.from({ length: 100 }, (_, i) => {
  const candidate = candidatesFixture[i % candidatesFixture.length]!;
  return {
    id: `ledger_${String(i + 1).padStart(3, "0")}`,
    actorUserId: pick(["user_adnan", "user_sneha", "user_vikram", null]),
    actorType: pick(["USER", "SYSTEM", "AGENT"]) as LedgerEntry["actorType"],
    actorName: pick(["Adnan Khan", "Sneha Rao", "Vikram Desai", "System", "AI Agent"]),
    entityType: pick(["candidate", "application", "resume", "record"]),
    entityId: candidate.id,
    entityLabel: candidate.fullName,
    action: pick(ACTIONS),
    summary: pick([
      `Updated resume for ${candidate.fullName}`,
      `Submitted application for ${candidate.primaryRole}`,
      `AI generated tailored resume version`,
      `Changed status to ${candidate.status}`,
      `Added evidence for experience claim`,
      `Exported resume as PDF`,
    ]),
    modelId: seededRandom() > 0.7 ? "claude-sonnet-5" : null,
    promptVersion: seededRandom() > 0.8 ? "v2.1" : null,
    evidenceIds: [],
    claimState: seededRandom() > 0.6 ? pick(["VERIFIED", "UNVERIFIED", "CONTRADICTED"]) as LedgerEntry["claimState"] : null,
    createdAt: daysAgo(Math.floor(seededRandom() * 30)),
  };
});

export const ledgerHandlers = [
  http.get("/api/ledger", ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? 50);
    const offset = Number(url.searchParams.get("offset") ?? 0);
    return respond(ledgerEntries.slice(offset, offset + limit));
  }),
];
