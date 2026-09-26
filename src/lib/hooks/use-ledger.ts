"use client";

import { useQuery } from "@tanstack/react-query";
import { ledgerApi } from "@/lib/api/analytics";

export function useLedger(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ["ledger", params],
    queryFn: () => ledgerApi.list(params),
  });
}
