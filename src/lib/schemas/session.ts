import { z } from "zod";
import { FirmRole } from "./enums";

export const FirmSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  logoUrl: z.string().url().nullable(),
  primaryTimezone: z.string().default("Asia/Kolkata"),
  clientTimezone: z.string().default("America/New_York"),
  truthGuardMode: z.enum(["STRICT", "BALANCED", "LENIENT"]).default("BALANCED"),
  applicationExpiryDays: z.number().int().default(30),
});
export type Firm = z.infer<typeof FirmSchema>;

export const UserSchema = z.object({
  id: z.string(),
  firmId: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: FirmRole,
  avatarUrl: z.string().url().nullable(),
  isActive: z.boolean(),
  lastActiveAt: z.string().datetime().nullable(),
});
export type User = z.infer<typeof UserSchema>;

export const SessionSchema = z.object({
  user: UserSchema,
  firm: FirmSchema,
  seatsUsed: z.number().int(),
  seatLimit: z.number().int(),
  activeCandidates: z.number().int(),
  candidateLimit: z.number().int(),
});
export type Session = z.infer<typeof SessionSchema>;
