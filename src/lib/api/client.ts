import { z, type ZodType } from "zod";

/** Errors shared by the local adapters and TanStack Query error UI. */

export class ApiError extends Error {
  code: string;
  status: number;
  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

/** Helper used by the local JSON store and adapter schemas. */
export const arrayOf = <T,>(schema: ZodType<T>) => z.array(schema);
