import { z } from "zod";
import { ApiError } from "@/lib/api/client";
import { arrayOf } from "@/lib/api/client";
import firmSeed from "@/data/firm.json";
import candidatesSeed from "@/data/candidates.json";
import companiesSeed from "@/data/companies.json";
import jobsSeed from "@/data/jobs.json";
import recordsSeed from "@/data/records.json";
import resumesSeed from "@/data/resumes.json";
import applicationsSeed from "@/data/applications.json";
import followupsSeed from "@/data/followups.json";
import documentsSeed from "@/data/documents.json";
import inboxSeed from "@/data/inbox.json";
import ledgerSeed from "@/data/ledger.json";
import { localResult, wait } from "./delay";
import { FirmSchema, SessionSchema, UserSchema, type Firm, type Session, type User } from "@/lib/schemas/session";
import { CandidateSchema, UpdateCandidateSchema, type Candidate, type UpdateCandidate } from "@/lib/schemas/candidate";
import { CompanySchema, type Company } from "@/lib/schemas/company";
import { JobSchema, type Job } from "@/lib/schemas/job";
import { RecordSchema, type Record_ } from "@/lib/schemas/record";
import { ResumeSchema, type Resume } from "@/lib/schemas/resume";
import { ApplicationSchema, FollowUpTaskSchema, type Application, type FollowUpTask } from "@/lib/schemas/application";
import { CandidateDocumentSchema, UploadDocumentSchema, type CandidateDocument, type UploadDocument } from "@/lib/schemas/document";
import { CandidateInboxSchema, InboxMessageSchema, UpdateApplicationStatusSchema, type CandidateInbox, type InboxMessage, type UpdateApplicationStatus } from "@/lib/schemas/inbox";
import { LedgerEntrySchema, type LedgerEntry } from "@/lib/schemas/analytics";

const InboxSeedSchema = z.object({
  messages: arrayOf(InboxMessageSchema),
  initiallyConnected: z.array(z.string()),
});

interface LocalState {
  firm: Firm;
  users: User[];
  candidates: Candidate[];
  companies: Company[];
  jobs: Job[];
  records: Record_[];
  resumes: Resume[];
  applications: Application[];
  followups: FollowUpTask[];
  documents: CandidateDocument[];
  inboxMessages: InboxMessage[];
  ledger: LedgerEntry[];
}

function parseSeed(): LocalState {
  const firm = FirmSchema.parse(firmSeed.firm);
  const users = arrayOf(UserSchema).parse(firmSeed.users);
  const inbox = InboxSeedSchema.parse(inboxSeed);

  return {
    firm,
    users,
    candidates: arrayOf(CandidateSchema).parse(candidatesSeed),
    companies: arrayOf(CompanySchema).parse(companiesSeed),
    jobs: arrayOf(JobSchema).parse(jobsSeed),
    records: arrayOf(RecordSchema).parse(recordsSeed),
    resumes: arrayOf(ResumeSchema).parse(resumesSeed),
    applications: arrayOf(ApplicationSchema).parse(applicationsSeed),
    followups: arrayOf(FollowUpTaskSchema).parse(followupsSeed),
    documents: arrayOf(CandidateDocumentSchema).parse(documentsSeed),
    inboxMessages: inbox.messages,
    ledger: arrayOf(LedgerEntrySchema).parse(ledgerSeed),
  };
}

const state: LocalState = structuredClone(parseSeed());
const connectedAt = new Map<string, string>(
  InboxSeedSchema.parse(inboxSeed).initiallyConnected.map((candidateId) => [
    candidateId,
    new Date(Date.now() - 12 * 86_400_000).toISOString(),
  ]),
);

function notFound(resource: string, id: string): never {
  throw new ApiError(`${resource} ${id} not found.`, "NOT_FOUND", 404);
}

function currentUser(): User {
  const user = state.users.find((candidate) => candidate.id === "user_adnan");
  if (!user) throw new ApiError("Current user not found.", "SESSION_NOT_FOUND", 500);
  return user;
}

function inboxFor(candidateId: string): CandidateInbox {
  const candidate = state.candidates.find((item) => item.id === candidateId);
  const connectedSince = connectedAt.get(candidateId);
  if (!candidate || !connectedSince) return { connection: null, messages: [] };

  return CandidateInboxSchema.parse({
    connection: {
      candidateId,
      provider: "GOOGLE",
      address: candidate.email ?? `${candidate.fullName.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
      connectedAt: connectedSince,
      lastSyncedAt: new Date(Date.now() - 2 * 60_000).toISOString(),
    },
    messages: state.inboxMessages.filter((message) => message.candidateId === candidateId),
  });
}

export const localData = {
  session: async (): Promise<Session> =>
    localResult(SessionSchema.parse({
      user: currentUser(),
      firm: state.firm,
      seatsUsed: state.users.filter((user) => user.isActive).length,
      seatLimit: 10,
      activeCandidates: state.candidates.filter((candidate) => candidate.status !== "INACTIVE").length,
      candidateLimit: 100,
    })),

  team: async (): Promise<User[]> => localResult(state.users),

  candidates: {
    list: async (): Promise<Candidate[]> => localResult(state.candidates),
    byId: async (id: string): Promise<Candidate> => {
      const candidate = state.candidates.find((item) => item.id === id);
      return localResult(candidate ?? notFound("Candidate", id));
    },
    update: async (id: string, body: UpdateCandidate): Promise<Candidate> => {
      const candidate = state.candidates.find((item) => item.id === id);
      const patch = UpdateCandidateSchema.parse(body);
      if (!candidate) return notFound("Candidate", id);
      Object.assign(candidate, patch, { updatedAt: new Date().toISOString() });
      const updated = CandidateSchema.parse(candidate);
      return localResult(updated);
    },
  },

  companies: {
    list: async (): Promise<Company[]> => localResult(state.companies),
    byId: async (id: string): Promise<Company> => {
      const company = state.companies.find((item) => item.id === id);
      return localResult(company ?? notFound("Company", id));
    },
  },

  jobs: {
    list: async (params?: { limit?: number; offset?: number }): Promise<Job[]> => {
      const limit = params?.limit ?? 50;
      const offset = params?.offset ?? 0;
      return localResult(state.jobs.slice(offset, offset + limit));
    },
    byId: async (id: string): Promise<Job> => {
      const job = state.jobs.find((item) => item.id === id);
      return localResult(job ?? notFound("Job", id));
    },
  },

  records: {
    byCandidate: async (candidateId: string): Promise<Record_> => {
      const record = state.records.find((item) => item.candidateId === candidateId);
      return localResult(record ?? notFound("Candidate record", candidateId));
    },
  },

  resumes: {
    list: async (): Promise<Resume[]> => localResult(state.resumes),
    byCandidate: async (candidateId: string): Promise<Resume[]> =>
      localResult(state.resumes.filter((resume) => resume.candidateId === candidateId)),
    byId: async (id: string): Promise<Resume> => {
      const resume = state.resumes.find((item) => item.id === id);
      return localResult(resume ?? notFound("Resume", id));
    },
  },

  applications: {
    list: async (params?: { candidateId?: string }): Promise<Application[]> => {
      const applications = params?.candidateId
        ? state.applications.filter((application) => application.candidateId === params.candidateId)
        : state.applications;
      return localResult(applications);
    },
    byId: async (id: string): Promise<Application> => {
      const application = state.applications.find((item) => item.id === id);
      return localResult(application ?? notFound("Application", id));
    },
    updateStatus: async (id: string, body: UpdateApplicationStatus): Promise<Application> => {
      const application = state.applications.find((item) => item.id === id);
      const update = UpdateApplicationStatusSchema.parse(body);
      if (!application) return notFound("Application", id);

      const now = new Date().toISOString();
      application.events.push({
        id: `evt_${application.id}_${application.events.length}`,
        applicationId: application.id,
        fromStatus: application.status,
        toStatus: update.status,
        note: update.note,
        actorUserId: currentUser().id,
        isAutomated: false,
        createdAt: now,
      });
      application.status = update.status;
      if (update.status === "RESPONSE" && !application.firstResponseAt) application.firstResponseAt = now;
      if (update.status === "INTERVIEW" && !application.interviewAt) application.interviewAt = now;
      if (update.status === "OFFER") application.offerAt = now;
      if (["PLACED", "REJECTED", "WITHDRAWN", "EXPIRED"].includes(update.status)) application.closedAt = now;
      return localResult(ApplicationSchema.parse(application));
    },
  },

  followups: {
    list: async (params?: { userId?: string }): Promise<FollowUpTask[]> => {
      const followups = params?.userId
        ? state.followups.filter((followup) => followup.assignedToUserId === params.userId)
        : state.followups;
      return localResult(followups);
    },
  },

  documents: {
    byCandidate: async (candidateId: string): Promise<CandidateDocument[]> =>
      localResult(state.documents.filter((document) => document.candidateId === candidateId)),
    upload: async (candidateId: string, body: UploadDocument): Promise<CandidateDocument> => {
      const input = UploadDocumentSchema.parse(body);
      const id = `doc_local_${Date.now().toString(36)}`;
      const document = CandidateDocumentSchema.parse({
        ...input,
        id,
        candidateId,
        uploadedAt: new Date().toISOString(),
        uploadedByUserId: currentUser().id,
        shareUrl: `https://files.benchq.app/s/${id}`,
      });
      state.documents.unshift(document);
      return localResult(document);
    },
    remove: async (id: string): Promise<CandidateDocument> => {
      const index = state.documents.findIndex((document) => document.id === id);
      if (index < 0) return notFound("Document", id);
      const [removed] = state.documents.splice(index, 1);
      return localResult(removed!);
    },
  },

  inbox: {
    byCandidate: async (candidateId: string): Promise<CandidateInbox> => localResult(inboxFor(candidateId)),
    connect: async (candidateId: string): Promise<CandidateInbox> => {
      if (!state.candidates.some((candidate) => candidate.id === candidateId)) return notFound("Candidate", candidateId);
      await wait(500);
      connectedAt.set(candidateId, new Date().toISOString());
      return localResult(inboxFor(candidateId));
    },
    disconnect: async (candidateId: string): Promise<CandidateInbox> => {
      connectedAt.delete(candidateId);
      return localResult(inboxFor(candidateId));
    },
    markRead: async (messageId: string): Promise<InboxMessage> => {
      const message = state.inboxMessages.find((item) => item.id === messageId);
      if (!message) return notFound("Email", messageId);
      message.isRead = true;
      return localResult(InboxMessageSchema.parse(message));
    },
  },

  ledger: {
    list: async (params?: { limit?: number; offset?: number }): Promise<LedgerEntry[]> => {
      const limit = params?.limit ?? 50;
      const offset = params?.offset ?? 0;
      return localResult(state.ledger.slice(offset, offset + limit));
    },
  },
};
