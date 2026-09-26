import { arrayOf, http } from "./client";
import { JobSchema, type Job } from "@/lib/schemas/job";

export const jobsApi = {
  list: (params?: { limit?: number; offset?: number }) =>
    http.get<Job[]>("/api/jobs", { schema: arrayOf(JobSchema), params }),

  byId: (id: string) =>
    http.get<Job>(`/api/jobs/${id}`, { schema: JobSchema }),
};
