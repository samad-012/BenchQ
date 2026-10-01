import { localAgents } from "@/lib/local-data/agents";
import type { AgentDraft, TailorResumeInput } from "@/lib/schemas/agent";
import type { RewriteInput, RewriteResult } from "@/lib/schemas/resume-document";

export const agentsApi = {
  rewrite: (input: RewriteInput, signal?: AbortSignal): Promise<RewriteResult> => localAgents.rewrite(input, signal),

  tailorResume: (input: TailorResumeInput, signal?: AbortSignal): Promise<AgentDraft> => localAgents.tailorResume(input, signal),
};
