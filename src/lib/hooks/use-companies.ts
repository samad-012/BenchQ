"use client";

import { useQuery } from "@tanstack/react-query";
import { companiesApi } from "@/lib/api/companies";

export function useCompanies() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: () => companiesApi.list(),
  });
}

export function useCompany(id: string) {
  return useQuery({
    queryKey: ["company", id],
    queryFn: () => companiesApi.byId(id),
    enabled: !!id,
  });
}
