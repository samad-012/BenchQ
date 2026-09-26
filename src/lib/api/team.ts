import { arrayOf, http } from "./client";
import { UserSchema, type User } from "@/lib/schemas/session";

export const teamApi = {
  list: () => http.get<User[]>("/api/team", { schema: arrayOf(UserSchema) }),
};
