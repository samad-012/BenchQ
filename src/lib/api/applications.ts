import { arrayOf, http } from "./client";
import { ApplicationSchema, FollowUpTaskSchema, type Application, type FollowUpTask } from "@/lib/schemas/application";
import type { UpdateApplicationStatus } from "@/lib/schemas/inbox";

export const applicationsApi = {
  list: (params?: { candidateId?: string }) =>
    http.get<Application[]>("/api/applications", { schema: arrayOf(ApplicationSchema), params }),

  byId: (id: string) =>
    http.get<Application>(`/api/applications/${id}`, { schema: ApplicationSchema }),

  updateStatus: (id: string, body: UpdateApplicationStatus) =>
    http.patch<Application>(`/api/applications/${id}/status`, { schema: ApplicationSchema, body }),
};

export const followupsApi = {
  list: (params?: { userId?: string }) =>
    http.get<FollowUpTask[]>("/api/followups", { schema: arrayOf(FollowUpTaskSchema), params }),
};
