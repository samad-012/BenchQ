import { localData } from "@/lib/local-data/store";
import type { Application, FollowUpTask } from "@/lib/schemas/application";
import type { UpdateApplicationStatus } from "@/lib/schemas/inbox";

export const applicationsApi = {
  list: (params?: { candidateId?: string }): Promise<Application[]> => localData.applications.list(params),

  byId: (id: string): Promise<Application> => localData.applications.byId(id),

  updateStatus: (id: string, body: UpdateApplicationStatus): Promise<Application> => localData.applications.updateStatus(id, body),
};

export const followupsApi = {
  list: (params?: { userId?: string }): Promise<FollowUpTask[]> => localData.followups.list(params),
};
