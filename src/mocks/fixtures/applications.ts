import type { Application, ApplicationEvent, FollowUpTask } from "@/lib/schemas/application";
import type { ApplicationStatus } from "@/lib/schemas/enums";
import { candidatesFixture } from "./candidates";
import { jobsFixture } from "./jobs";
import { resumesFixture } from "./resumes";
import { daysAgo, hoursAgo, resetSeed, seededRandom, pick } from "./_seed";

resetSeed(500);

const STATUS_WEIGHTS: Array<{ status: ApplicationStatus; weight: number }> = [
  { status: "SAVED", weight: 45 },
  { status: "APPLIED", weight: 95 },
  { status: "RESPONSE", weight: 48 },
  { status: "SCREENING", weight: 32 },
  { status: "INTERVIEW", weight: 28 },
  { status: "OFFER", weight: 9 },
  { status: "PLACED", weight: 6 },
  { status: "REJECTED", weight: 41 },
  { status: "WITHDRAWN", weight: 8 },
  { status: "EXPIRED", weight: 8 },
];

const TOTAL_APPS = 320;

function buildStatusPool(): ApplicationStatus[] {
  const pool: ApplicationStatus[] = [];
  for (const { status, weight } of STATUS_WEIGHTS) {
    for (let i = 0; i < weight; i++) pool.push(status);
  }
  while (pool.length < TOTAL_APPS) pool.push("APPLIED");
  return pool.slice(0, TOTAL_APPS);
}

const statusPool = buildStatusPool();
for (let i = statusPool.length - 1; i > 0; i--) {
  const j = Math.floor(seededRandom() * (i + 1));
  [statusPool[i], statusPool[j]] = [statusPool[j]!, statusPool[i]!];
}

const ACTIVE_CANDIDATES = candidatesFixture.filter(
  (c) => c.status !== "INACTIVE" && c.status !== "PAUSED",
);

const STATUS_CHAIN: ApplicationStatus[] = [
  "SAVED", "APPLIED", "RESPONSE", "SCREENING", "INTERVIEW", "OFFER", "PLACED",
];

const DAY_MS = 86_400_000;

type StepSpec = { toStatus: ApplicationStatus; note: string | null; isAutomated: boolean };

/** The ordered status steps that produced a given final status. */
function stepsFor(finalStatus: ApplicationStatus): StepSpec[] {
  const base = (n: number): StepSpec[] =>
    STATUS_CHAIN.slice(0, n).map((s, i) => ({ toStatus: s, note: null, isAutomated: i === 0 }));

  if (finalStatus === "REJECTED") {
    const reachedIdx = 1 + Math.floor(seededRandom() * 4); // reached APPLIED..INTERVIEW then rejected
    return [
      ...base(reachedIdx + 1),
      { toStatus: "REJECTED", note: pick(["Position filled", "Not a match", "Went with another candidate", "Budget cut", null]), isAutomated: false },
    ];
  }
  if (finalStatus === "WITHDRAWN") {
    const reachedIdx = 1 + Math.floor(seededRandom() * 3);
    return [
      ...base(reachedIdx + 1),
      { toStatus: "WITHDRAWN", note: pick(["Candidate accepted another offer", "Candidate no longer interested", null]), isAutomated: false },
    ];
  }
  if (finalStatus === "EXPIRED") {
    return [
      { toStatus: "SAVED", note: null, isAutomated: true },
      { toStatus: "APPLIED", note: null, isAutomated: false },
      { toStatus: "EXPIRED", note: "No response within 30 days", isAutomated: true },
    ];
  }
  const chainEnd = STATUS_CHAIN.indexOf(finalStatus as typeof STATUS_CHAIN[number]);
  return base(Math.max(1, chainEnd + 1));
}

/**
 * Build the event chain backward from a recent end date so every event lands
 * in the past with realistic 2–7 day gaps and the newest activity is recent.
 */
function eventChain(appId: string, finalStatus: ApplicationStatus): ApplicationEvent[] {
  const steps = stepsFor(finalStatus);
  const gaps = steps.slice(1).map(() => 2 + seededRandom() * 5);
  const totalSpan = gaps.reduce((a, b) => a + b, 0);
  const endDaysAgo = 1 + seededRandom() * 24;
  const firstMs = Date.now() - (endDaysAgo + totalSpan) * DAY_MS;

  let acc = 0;
  return steps.map((step, i) => {
    if (i > 0) acc += gaps[i - 1]!;
    return {
      id: `evt_${appId}_${i}`,
      applicationId: appId,
      fromStatus: i === 0 ? null : steps[i - 1]!.toStatus,
      toStatus: step.toStatus,
      note: step.note,
      actorUserId: null,
      isAutomated: step.isAutomated,
      createdAt: new Date(firstMs + acc * DAY_MS).toISOString(),
    };
  });
}

/**
 * Which resume version went out with a submission. Deterministic (no RNG, so the
 * seeded sequence is untouched): every third uses the tailored copy when there is
 * one; older master submissions went out on v1, recent ones on the latest version.
 */
function resumeVersionFor(candidateId: string, appIdx: number, appliedAt: string | undefined): string | null {
  const resumes = resumesFixture.filter((r) => r.candidateId === candidateId);
  const tailored = resumes.find((r) => !r.isMaster);
  const master = resumes.find((r) => r.isMaster);
  if (tailored && appIdx % 3 === 0) return tailored.latestVersionId;
  if (!master) return null;
  const isOld = appliedAt ? Date.now() - new Date(appliedAt).getTime() > 14 * 86_400_000 : false;
  return isOld ? master.versions[0]!.id : master.latestVersionId;
}

export const applicationsFixture: Application[] = [];

let appIdx = 0;
for (const status of statusPool) {
  const candidate = ACTIVE_CANDIDATES[appIdx % ACTIVE_CANDIDATES.length]!;
  const job = jobsFixture[Math.floor(seededRandom() * jobsFixture.length)]!;
  const id = `app_${String(appIdx + 1).padStart(3, "0")}`;
  const events = eventChain(id, status);
  const lastEvent = events[events.length - 1]!;
  const createdAt = events[0]!.createdAt;

  const appliedEvent = events.find((e) => e.toStatus === "APPLIED");
  const responseEvent = events.find((e) => e.toStatus === "RESPONSE");
  const interviewEvent = events.find((e) => e.toStatus === "INTERVIEW");
  const offerEvent = events.find((e) => e.toStatus === "OFFER");
  const closedStatuses: ApplicationStatus[] = ["REJECTED", "WITHDRAWN", "EXPIRED", "PLACED"];

  applicationsFixture.push({
    id,
    candidateId: candidate.id,
    jobId: job.id,
    resumeVersionId: status !== "SAVED" ? resumeVersionFor(candidate.id, appIdx, appliedEvent?.createdAt) : null,
    submittedByUserId: candidate.primaryUserId ?? "user_adnan",
    status,
    companyNameAtApply: job.company.name,
    jobTitleAtApply: job.title,
    appliedAt: appliedEvent?.createdAt ?? null,
    firstResponseAt: responseEvent?.createdAt ?? null,
    interviewAt: interviewEvent?.createdAt ?? null,
    offerAt: offerEvent?.createdAt ?? null,
    closedAt: closedStatuses.includes(status) ? lastEvent.createdAt : null,
    expiresAt: status === "APPLIED" && appliedEvent
      ? new Date(new Date(appliedEvent.createdAt).getTime() + 30 * DAY_MS).toISOString()
      : null,
    coverLetterText: null,
    notes: seededRandom() > 0.7 ? pick(["Strong match", "Backup option", "Needs prep call", "Rate discussion pending"]) : null,
    events,
    createdAt,
  });

  appIdx++;
}

// ── Follow-ups derived from applications ──────────────────
const FOLLOWUP_STATUSES: ApplicationStatus[] = ["APPLIED", "RESPONSE", "SCREENING", "INTERVIEW", "OFFER"];

const followupCandidateApps = applicationsFixture.filter(
  (a) => FOLLOWUP_STATUSES.includes(a.status),
);

export const followupsFixture: FollowUpTask[] = [];
let fuIdx = 0;

for (const app of followupCandidateApps) {
  if (seededRandom() > 0.45) continue;
  const candidate = candidatesFixture.find((c) => c.id === app.candidateId)!;
  const job = jobsFixture.find((j) => j.id === app.jobId)!;
  const kind = pick(["DAY_3_LINKEDIN", "DAY_7_EMAIL", "CUSTOM"] as const);
  const id = `fu_${String(fuIdx + 1).padStart(3, "0")}`;

  let dueAt: string;
  let state: FollowUpTask["state"];
  let completedAt: string | null = null;
  let snoozedUntil: string | null = null;

  const roll = seededRandom();
  if (roll < 0.14) {
    state = "DONE";
    dueAt = daysAgo(Math.floor(1 + seededRandom() * 10));
    completedAt = dueAt;
  } else if (roll < 0.22) {
    state = "SNOOZED";
    dueAt = daysAgo(Math.floor(1 + seededRandom() * 5));
    snoozedUntil = hoursAgo(-Math.floor(24 + seededRandom() * 72));
  } else if (roll < 0.28) {
    state = "CANCELLED";
    dueAt = daysAgo(Math.floor(seededRandom() * 10));
  } else if (roll < 0.46) {
    state = "PENDING";
    dueAt = daysAgo(Math.floor(1 + seededRandom() * 7));
  } else if (roll < 0.68) {
    state = "PENDING";
    dueAt = new Date().toISOString().slice(0, 10) + "T18:30:00.000Z";
  } else {
    state = "PENDING";
    dueAt = hoursAgo(-Math.floor(24 + seededRandom() * 168));
  }

  followupsFixture.push({
    id,
    applicationId: app.id,
    assignedToUserId: app.submittedByUserId,
    kind,
    dueAt,
    state,
    completedAt,
    snoozedUntil,
    note: seededRandom() > 0.7 ? pick(["Follow up on rate", "Check interview feedback", "Send updated resume"]) : null,
    candidateName: candidate?.fullName ?? "Unknown",
    companyName: job?.company.name ?? "Unknown",
    jobTitle: job?.title ?? "Unknown",
  });

  fuIdx++;
}

export function applicationsByCandidate(candidateId: string): Application[] {
  return applicationsFixture.filter((a) => a.candidateId === candidateId);
}

export function followupsByUser(userId: string): FollowUpTask[] {
  return followupsFixture.filter((f) => f.assignedToUserId === userId);
}
