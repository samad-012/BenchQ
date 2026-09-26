import { http } from "./client";
import {
  AgentDraftSchema,
  type AgentDraft,
  type TailorResumeInput,
} from "@/lib/schemas/agent";
import { RewriteResultSchema, type RewriteInput, type RewriteResult } from "@/lib/schemas/resume-document";

export const agentsApi = {
  rewrite: (input: RewriteInput, signal?: AbortSignal) =>
    http.post<RewriteResult>("/api/agents/rewrite", { body: input, schema: RewriteResultSchema, signal }),

  tailorResume: (input: TailorResumeInput, signal?: AbortSignal) =>
    http.post<AgentDraft>("/api/agents/tailor-resume", {
      body: input,
      schema: AgentDraftSchema,
      signal,
    }),
};
