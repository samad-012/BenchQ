import type { AgentDraft, TailorResumeInput } from "@/lib/schemas/agent";
import type { RewriteInput, RewriteResult } from "@/lib/schemas/resume-document";

const mock = () => import("@/mocks/agents").then((m) => m.agentsMock);

export const agentsApi = {
  rewrite: async (input: RewriteInput, signal?: AbortSignal): Promise<RewriteResult> =>
    (await mock()).rewrite(input, signal),

  tailorResume: async (input: TailorResumeInput, signal?: AbortSignal): Promise<AgentDraft> =>
    (await mock()).tailorResume(input, signal),
};
