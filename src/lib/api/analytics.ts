import type { LedgerEntry } from "@/lib/schemas/analytics";

const mock = () => import("@/mocks/ledger").then((m) => m.ledgerMock);

export const ledgerApi = {
  list: async (params?: { limit?: number; offset?: number }): Promise<LedgerEntry[]> => (await mock()).list(params),
};
