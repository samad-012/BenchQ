import type { Metadata } from "next";
import { Providers } from "./providers";
import "@fontsource-variable/host-grotesk";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "BenchQ",
  description:
    "AI placement platform for US-focused IT staffing firms. Every claim traceable to verified evidence.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
