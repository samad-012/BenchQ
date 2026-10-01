import { localData } from "@/lib/local-data/store";
import type { Company } from "@/lib/schemas/company";

export const companiesApi = {
  list: (): Promise<Company[]> => localData.companies.list(),

  byId: (id: string): Promise<Company> => localData.companies.byId(id),
};
