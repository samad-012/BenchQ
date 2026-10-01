import { localData } from "@/lib/local-data/store";
import type { Job } from "@/lib/schemas/job";

export const jobsApi = {
  list: (params?: { limit?: number; offset?: number }): Promise<Job[]> => localData.jobs.list(params),

  byId: (id: string): Promise<Job> => localData.jobs.byId(id),
};
