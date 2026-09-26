import { z, type ZodType } from "zod";

/**
 * Typed fetch wrapper per docs/01 §5.
 * MSW intercepts these calls in development and test — the component never
 * knows whether the data came from a fixture or a server.
 * Every response is validated against a Zod schema; a shape mismatch fails
 * loudly in development rather than rendering `undefined` in production.
 */

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

type QueryParams = Record<string, string | number | boolean | null | undefined>;

interface RequestOptions<T> {
  schema?: ZodType<T>;
  params?: QueryParams;
  body?: unknown;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

function buildUrl(path: string, params?: QueryParams): string {
  if (!params) return path;
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === null || v === undefined) continue;
    usp.set(k, String(v));
  }
  const qs = usp.toString();
  return qs ? `${path}?${qs}` : path;
}

async function request<T>(
  method: string,
  path: string,
  opts: RequestOptions<T> = {},
): Promise<T> {
  const url = buildUrl(path, opts.params);

  const init: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(opts.headers ?? {}),
    },
    signal: opts.signal,
  };

  if (opts.body !== undefined) {
    init.body = JSON.stringify(opts.body);
  }

  const res = await fetch(url, init);

  if (!res.ok) {
    let code = "REQUEST_FAILED";
    let message = res.statusText;
    try {
      const err = (await res.json()) as { error?: string; message?: string };
      if (err.error) code = err.error;
      if (err.message) message = err.message;
    } catch {
      /* body wasn't JSON */
    }
    throw new ApiError(message, code, res.status);
  }

  const json: unknown = res.status === 204 ? undefined : await res.json();

  if (opts.schema) {
    const parsed = opts.schema.safeParse(json);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      const path = first?.path.join(".") || "<root>";
      throw new ApiError(
        `Response failed schema validation at ${path}: ${first?.message}`,
        "SCHEMA_MISMATCH",
        500,
      );
    }
    return parsed.data;
  }

  return json as T;
}

export const http = {
  get: <T,>(path: string, opts?: RequestOptions<T>) =>
    request<T>("GET", path, opts),
  post: <T,>(path: string, opts?: RequestOptions<T>) =>
    request<T>("POST", path, opts),
  patch: <T,>(path: string, opts?: RequestOptions<T>) =>
    request<T>("PATCH", path, opts),
  put: <T,>(path: string, opts?: RequestOptions<T>) =>
    request<T>("PUT", path, opts),
  delete: <T,>(path: string, opts?: RequestOptions<T>) =>
    request<T>("DELETE", path, opts),
};

/** Helper: pass to http.* when the response is a plain array of one schema. */
export const arrayOf = <T,>(schema: ZodType<T>) => z.array(schema);
