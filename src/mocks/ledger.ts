import { arrayOf } from "@/lib/api/client";
import { LedgerEntrySchema, type LedgerEntry } from "@/lib/schemas/analytics";
import ledgerSeed from "./data/ledger.json";
import { mockResult } from "./_shared";

const ledger: LedgerEntry[] = arrayOf(LedgerEntrySchema).parse(ledgerSeed);

export const ledgerMock = {
  list: (params?: { limit?: number; offset?: number }): Promise<LedgerEntry[]> => {
    const limit = params?.limit ?? 50;
    const offset = params?.offset ?? 0;
    return mockResult(ledger.slice(offset, offset + limit));
  },
};
