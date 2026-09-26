import { HttpResponse, delay, type JsonBodyType } from "msw";
import { seededRandom } from "@/mocks/fixtures/_seed";

const LATENCY = Number(process.env.NEXT_PUBLIC_MOCK_LATENCY_MS ?? 300);
const ERROR_RATE = Number(process.env.NEXT_PUBLIC_MOCK_ERROR_RATE ?? 0);

/**
 * Standard response wrapper — mimics real-world latency and an injectable
 * failure rate. Run a session with NEXT_PUBLIC_MOCK_ERROR_RATE=0.1 before
 * every phase exit to surface missing error states cheaply.
 */
export async function respond<T extends JsonBodyType>(
  data: T,
  opts?: { latency?: number },
): Promise<Response> {
  await delay(opts?.latency ?? LATENCY);
  if (ERROR_RATE > 0 && seededRandom() < ERROR_RATE) {
    return HttpResponse.json(
      {
        error: "MOCK_FAILURE",
        message: "Simulated failure — this is the error state.",
      },
      { status: 500 },
    );
  }
  return HttpResponse.json(data);
}
