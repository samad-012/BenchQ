const DEFAULT_DELAY_MS = 60;

function configuredDelay(): number {
  const value = Number(process.env.NEXT_PUBLIC_LOCAL_DATA_DELAY_MS ?? DEFAULT_DELAY_MS);
  return Number.isFinite(value) && value >= 0 ? value : DEFAULT_DELAY_MS;
}

export async function wait(ms = configuredDelay(), signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) {
    throw new DOMException("The local request was cancelled.", "AbortError");
  }

  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    const cancel = () => {
      clearTimeout(timer);
      reject(new DOMException("The local request was cancelled.", "AbortError"));
    };
    signal?.addEventListener("abort", cancel, { once: true });
  });
}

export async function localResult<T>(value: T, signal?: AbortSignal): Promise<T> {
  await wait(undefined, signal);
  return structuredClone(value);
}
