import type { Firm, User } from "@/lib/schemas/session";
import { hoursAgo, resetSeed } from "./_seed";

resetSeed(100);

export const firmFixture: Firm = {
  id: "firm_hts",
  name: "Hyderabad Tech Staffing LLC",
  slug: "hyderabad-tech-staffing",
  logoUrl: null,
  primaryTimezone: "Asia/Kolkata",
  clientTimezone: "America/New_York",
  truthGuardMode: "BALANCED",
  applicationExpiryDays: 30,
};

export const usersFixture: User[] = [
  {
    id: "user_imran",
    firmId: "firm_hts",
    name: "Imran Shaikh",
    email: "imran@htsstaffing.com",
    role: "OWNER",
    avatarUrl: null,
    isActive: true,
    lastActiveAt: hoursAgo(1),
  },
  {
    id: "user_fatima",
    firmId: "firm_hts",
    name: "Fatima Reddy",
    email: "fatima@htsstaffing.com",
    role: "MANAGER",
    avatarUrl: null,
    isActive: true,
    lastActiveAt: hoursAgo(2),
  },
  {
    id: "user_adnan",
    firmId: "firm_hts",
    name: "Adnan Khan",
    email: "adnan@htsstaffing.com",
    role: "BDE",
    avatarUrl: null,
    isActive: true,
    lastActiveAt: hoursAgo(0.5),
  },
  {
    id: "user_sneha",
    firmId: "firm_hts",
    name: "Sneha Rao",
    email: "sneha@htsstaffing.com",
    role: "BDE",
    avatarUrl: null,
    isActive: true,
    lastActiveAt: hoursAgo(3),
  },
  {
    id: "user_vikram",
    firmId: "firm_hts",
    name: "Vikram Desai",
    email: "vikram@htsstaffing.com",
    role: "BDE",
    avatarUrl: null,
    isActive: true,
    lastActiveAt: hoursAgo(6),
  },
];

export function getUserById(id: string): User | undefined {
  return usersFixture.find((u) => u.id === id);
}
