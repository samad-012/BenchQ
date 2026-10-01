import { localData } from "@/lib/local-data/store";
import type { User } from "@/lib/schemas/session";

export const teamApi = {
  list: (): Promise<User[]> => localData.team(),
};
