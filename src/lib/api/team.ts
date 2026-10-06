import type { User } from "@/lib/schemas/session";

const mock = () => import("@/mocks/team").then((m) => m.teamMock);

export const teamApi = {
  list: async (): Promise<User[]> => (await mock()).list(),
};
