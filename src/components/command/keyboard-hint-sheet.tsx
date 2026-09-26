"use client";

import { useUiStore } from "@/lib/stores/ui-store";
import { cn } from "@/lib/cn";

/**
 * KeyboardHintSheet — opened by `?`. Lists every global shortcut.
 * Keep it accurate — the docs (04 §1.3) call this "the cheapest documentation
 * in the product" and an out-of-date sheet is worse than none.
 */

const GLOBAL_SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ["⌘", "K"], label: "Open command palette" },
  { keys: ["g", "d"], label: "Go to Dashboard" },
  { keys: ["g", "c"], label: "Go to Candidates" },
  { keys: ["g", "j"], label: "Go to Jobs" },
  { keys: ["g", "a"], label: "Go to Applications" },
  { keys: ["g", "f"], label: "Go to Follow-ups" },
  { keys: ["?"], label: "Open this shortcut sheet" },
  { keys: ["Esc"], label: "Close panel / clear selection" },
];

export function KeyboardHintSheet() {
  const isOpen = useUiStore((s) => s.hintSheetOpen);
  const close = useUiStore((s) => s.closeHintSheet);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="hint-sheet-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={close}
    >
      <div className="absolute inset-0 bg-[var(--color-overlay)]" aria-hidden="true" />
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative w-full max-w-md",
          "rounded-[var(--radius-xl)] border border-[var(--color-border)]",
          "bg-[var(--color-surface)] shadow-[var(--shadow-lg)]",
          "p-5",
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="hint-sheet-title" className="text-h2 text-[var(--color-text)]">
            Keyboard shortcuts
          </h2>
          <kbd className="tabular text-caption text-[var(--color-text-3)]">Esc</kbd>
        </div>
        <ul className="space-y-2">
          {GLOBAL_SHORTCUTS.map((s, i) => (
            <li key={i} className="flex items-center justify-between gap-4">
              <span className="text-body text-[var(--color-text-2)]">
                {s.label}
              </span>
              <span className="flex items-center gap-1">
                {s.keys.map((k, ki) => (
                  <kbd
                    key={ki}
                    className="tabular text-caption font-[600] px-2 h-6 rounded-[var(--radius-xs)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-[var(--color-text-2)] inline-flex items-center"
                  >
                    {k}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
