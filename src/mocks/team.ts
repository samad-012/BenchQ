import { ApiError, arrayOf } from "@/lib/api/client";
import { FirmSchema, UserSchema, type Firm, type User } from "@/lib/schemas/session";
import firmSeed from "./data/firm.json";
import { mockResult } from "./_shared";

export const firm: Firm = FirmSchema.parse(firmSeed.firm);
export const users: User[] = arrayOf(UserSchema).parse(firmSeed.users);

export function currentUser(): User {
  const user = users.find((item) => item.id === "user_adnan");
  if (!user) throw new ApiError("Current user not found.", "SESSION_NOT_FOUND", 500);
  return user;
}

export const teamMock = {
  list: (): Promise<User[]> => mockResult(users),
};
