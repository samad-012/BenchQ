import { formatInTimeZone } from "date-fns-tz";
import type { Application } from "@/lib/schemas/application";
import type { ApplicationStatus } from "@/lib/schemas/enums";
import type { InboxMessage, MailSignal } from "@/lib/schemas/inbox";
import { applicationsFixture } from "./applications";
import { candidatesFixture } from "./candidates";
import { daysAgo, hoursAgo, pick, resetSeed, seededRandom } from "./_seed";

/**
 * Recruiter emails per candidate, derived from each application's event chain
 * so the inbox always agrees with the pipeline. A share of applications also
 * gets a newer email the pipeline hasn't caught up with — those become the
 * "suggested status" updates the BDE confirms in one click.
 */
resetSeed(900);

const FIRST = ["Megan", "Jason", "Laura", "Kevin", "Ashley", "Daniel", "Nicole", "Ryan", "Sarah", "Brian", "Rachel", "Tyler"];
const LAST = ["Carter", "Nguyen", "Brooks", "Miller", "Reed", "Foster", "Lopez", "Hughes", "Bennett", "Coleman"];

const SIGNAL_FOR_STATUS: Partial<Record<ApplicationStatus, MailSignal>> = {
  APPLIED: "CONFIRMATION",
  RESPONSE: "CALL_REQUEST",
  SCREENING: "SHORTLISTED",
  INTERVIEW: "INTERVIEW_SCHEDULED",
  OFFER: "OFFER",
  REJECTED: "REJECTED",
};

/** The email that would move an application one stage forward. */
const PENDING_FROM: Partial<Record<ApplicationStatus, { signal: MailSignal; implies: ApplicationStatus }>> = {
  APPLIED: { signal: "CALL_REQUEST", implies: "RESPONSE" },
  RESPONSE: { signal: "SHORTLISTED", implies: "SCREENING" },
  SCREENING: { signal: "INTERVIEW_SCHEDULED", implies: "INTERVIEW" },
};

const IMPLIED: Record<MailSignal, ApplicationStatus | null> = {
  CONFIRMATION: "APPLIED",
  CALL_REQUEST: "RESPONSE",
  SHORTLISTED: "SCREENING",
  ASSESSMENT: "SCREENING",
  INTERVIEW_SCHEDULED: "INTERVIEW",
  OFFER: "OFFER",
  REJECTED: "REJECTED",
};

/** A business-hours slot `days` ahead: 10:00, 11:30, 14:00 or 15:30 US Eastern (EDT, UTC−4). */
function slot(days: number): string {
  const d = new Date(Date.now() + days * 86_400_000);
  const [h, m] = pick([[14, 0], [15, 30], [18, 0], [19, 30]] as const);
  d.setUTCHours(h, m, 0, 0);
  return d.toISOString();
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
const et = (iso: string) => formatInTimeZone(new Date(iso), "America/New_York", "EEE, MMM d 'at' h:mm a 'ET'");

function compose(signal: MailSignal, app: Application, candidateFirst: string, recruiter: string, when: string | null) {
  const role = app.jobTitleAtApply;
  const company = app.companyNameAtApply;
  const sign = `\n\nBest,\n${recruiter}\nTalent Acquisition, ${company}`;
  const map: Record<MailSignal, [string, string]> = {
    CONFIRMATION: [`Application received — ${role}`, `Thanks for applying to the ${role} role at ${company}. Our team is reviewing your profile and will reach out if it's a fit.`],
    CALL_REQUEST: [`Quick call about the ${role} role?`, `I came across your profile for our ${role} opening and would like a 15-minute call about your experience, rate and availability.${when ? ` Does ${when} work?` : " What time works this week?"}`],
    SHORTLISTED: [`Shortlisted: ${role} at ${company}`, `Good news — the hiring manager reviewed your profile and you've been shortlisted for the ${role} position. I'll share interview slots shortly.`],
    ASSESSMENT: [`Next step: technical assessment for ${role}`, `You've moved to the next round. Please complete the 60-minute online assessment within 48 hours using the link below.`],
    INTERVIEW_SCHEDULED: [`Interview scheduled — ${role}`, `Confirming your interview with the hiring manager${when ? ` on ${when}` : ""} over Microsoft Teams. Plan for 45 minutes: a technical deep dive followed by a project discussion.`],
    OFFER: [`Offer — ${role} at ${company}`, `We're pleased to move forward with an offer for the ${role} role. Please review the attached terms and confirm your start date.`],
    REJECTED: [`Update on your ${role} application`, `Thank you for your time. After careful review, the team has decided to move forward with other candidates for this role. We'll keep your profile on file.`],
  };
  const [subject, text] = map[signal];
  const body = `Hi ${candidateFirst},\n\n${text}${sign}`;
  return { subject, body, snippet: text.length > 120 ? `${text.slice(0, 117)}…` : text };
}

export const inboxMessagesFixture: InboxMessage[] = [];

for (const app of applicationsFixture) {
  const candidate = candidatesFixture.find((c) => c.id === app.candidateId);
  if (!candidate || app.status === "SAVED") continue;
  const first = candidate.fullName.split(" ")[0]!;
  const r = { first: pick(FIRST), last: pick(LAST) };
  const recruiter = `${r.first} ${r.last}`;
  const fromEmail = `${r.first}.${r.last}@${slug(app.companyNameAtApply)}.com`.toLowerCase();

  const push = (signal: MailSignal, receivedAt: string, scheduledFor: string | null, isPending: boolean) => {
    const content = compose(signal, app, first, recruiter, scheduledFor ? et(scheduledFor) : null);
    inboxMessagesFixture.push({
      id: `mail_${app.id}_${inboxMessagesFixture.length}`,
      candidateId: app.candidateId,
      applicationId: app.id,
      fromName: signal === "CONFIRMATION" ? `${app.companyNameAtApply} Careers` : recruiter,
      fromEmail: signal === "CONFIRMATION" ? `no-reply@${slug(app.companyNameAtApply)}.com` : fromEmail,
      ...content,
      receivedAt,
      signal,
      isRead: !isPending && Date.now() - new Date(receivedAt).getTime() > 36 * 3_600_000,
      impliedStatus: IMPLIED[signal],
      scheduledFor,
    });
  };

  for (const event of app.events) {
    let signal = SIGNAL_FOR_STATUS[event.toStatus];
    if (!signal || (signal === "CONFIRMATION" && seededRandom() < 0.4)) continue;
    if (signal === "SHORTLISTED" && seededRandom() < 0.3) signal = "ASSESSMENT";
    const at = new Date(new Date(event.createdAt).getTime() - 2 * 3_600_000).toISOString();
    const isCurrentInterview = signal === "INTERVIEW_SCHEDULED" && app.status === "INTERVIEW";
    const scheduled = signal === "INTERVIEW_SCHEDULED"
      ? (isCurrentInterview ? slot(1 + Math.floor(seededRandom() * 4)) : (app.interviewAt ?? event.createdAt))
      : null;
    push(signal, at, scheduled, false);
  }

  const pending = PENDING_FROM[app.status];
  if (pending && seededRandom() < 0.45) {
    const scheduled = pending.signal === "INTERVIEW_SCHEDULED" ? slot(2 + Math.floor(seededRandom() * 3)) : pending.signal === "CALL_REQUEST" ? slot(1) : null;
    push(pending.signal, hoursAgo(1 + Math.floor(seededRandom() * 30)), scheduled, true);
  }
}

inboxMessagesFixture.sort((a, b) => (a.receivedAt < b.receivedAt ? 1 : -1));

/** Every third candidate starts without a connected mailbox, so the connect flow is demoable. */
export const initiallyConnected = new Set(candidatesFixture.filter((_, i) => i % 3 !== 0).map((c) => c.id));

export const MAILBOX_CONNECTED_SINCE = daysAgo(12);
