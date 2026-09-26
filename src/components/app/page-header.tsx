import type { ReactNode } from "react";

/** PageHeader — consistent screen title row with optional actions. */
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-h1 text-[var(--color-text)]">{title}</h1>
        {subtitle ? <p className="mt-1 text-body text-[var(--color-text-3)]">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
