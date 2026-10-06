import type { Session } from "@/lib/schemas/session";

const mock = () => import("@/mocks/session").then((m) => m.sessionMock);

export const sessionApi = {
  current: async (): Promise<Session> => (await mock()).current(),
};
