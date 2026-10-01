import { localData } from "@/lib/local-data/store";
import type { Session } from "@/lib/schemas/session";

export const sessionApi = {
  current: (): Promise<Session> => localData.session(),
};
