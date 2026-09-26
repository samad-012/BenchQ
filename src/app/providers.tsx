"use client";

import { useEffect, useState, type ReactNode } from "react";
import { QueryProvider } from "@/lib/query/provider";
import { ThemeProvider } from "@/components/theme/theme-provider";

/**
 * Providers — client boundary for the whole app.
 * MSW is started before children render so the very first useQuery call
 * hits a mocked endpoint, not a real network.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [mswReady, setMswReady] = useState(
    process.env.NEXT_PUBLIC_API_MOCKING !== "enabled",
  );

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_API_MOCKING !== "enabled") return;
    let cancelled = false;
    (async () => {
      const { startWorker } = await import("@/mocks/browser");
      await startWorker();
      if (!cancelled) setMswReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ThemeProvider>
      <QueryProvider>{mswReady ? children : null}</QueryProvider>
    </ThemeProvider>
  );
}
