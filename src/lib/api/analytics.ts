import { localData } from "@/lib/local-data/store";
import type { LedgerEntry } from "@/lib/schemas/analytics";

export const ledgerApi = {
  list: (params?: { limit?: number; offset?: number }): Promise<LedgerEntry[]> => localData.ledger.list(params),
};
