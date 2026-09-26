import { arrayOf, http } from "./client";
import { CompanySchema, type Company } from "@/lib/schemas/company";

export const companiesApi = {
  list: () =>
    http.get<Company[]>("/api/companies", { schema: arrayOf(CompanySchema) }),

  byId: (id: string) =>
    http.get<Company>(`/api/companies/${id}`, { schema: CompanySchema }),
};
