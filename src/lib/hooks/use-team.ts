"use client";

import { useQuery } from "@tanstack/react-query";
import { teamApi } from "@/lib/api/team";

export function useTeam() {
  return useQuery({
    queryKey: ["team"],
    queryFn: () => teamApi.list(),
  });
}
