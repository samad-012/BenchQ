import type { Job } from "@/lib/schemas/job";

const mock = () => import("@/mocks/jobs").then((m) => m.jobsMock);

export const jobsApi = {
  list: async (params?: { limit?: number; offset?: number }): Promise<Job[]> => (await mock()).list(params),

  byId: async (id: string): Promise<Job> => (await mock()).byId(id),
};
