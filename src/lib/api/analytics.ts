import { arrayOf, http } from "./client";
import { LedgerEntrySchema, type LedgerEntry } from "@/lib/schemas/analytics";

export const ledgerApi = {
  list: (params?: { limit?: number; offset?: number }) =>
    http.get<LedgerEntry[]>("/api/ledger", { schema: arrayOf(LedgerEntrySchema), params }),
};
