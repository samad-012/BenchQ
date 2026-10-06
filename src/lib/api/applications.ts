import type { Application, FollowUpTask } from "@/lib/schemas/application";
import type { UpdateApplicationStatus } from "@/lib/schemas/inbox";

const mock = () => import("@/mocks/applications");

export const applicationsApi = {
  list: async (params?: { candidateId?: string }): Promise<Application[]> =>
    (await mock()).applicationsMock.list(params),

  byId: async (id: string): Promise<Application> => (await mock()).applicationsMock.byId(id),

  updateStatus: async (id: string, body: UpdateApplicationStatus): Promise<Application> =>
    (await mock()).applicationsMock.updateStatus(id, body),
};

export const followupsApi = {
  list: async (params?: { userId?: string }): Promise<FollowUpTask[]> => (await mock()).followupsMock.list(params),
};
