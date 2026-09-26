"use client";

import { useState } from "react";
import { Building2, Users, FileText, SlidersHorizontal } from "lucide-react";
import { useSession } from "@/lib/stores/session-store";
import { useTeam } from "@/lib/hooks/use-team";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useUiStore } from "@/lib/stores/ui-store";

const TABS = [
  { key: "firm", label: "Firm", Icon: Building2 },
  { key: "team", label: "Team", Icon: Users },
  { key: "templates", label: "Templates", Icon: FileText },
  { key: "preferences", label: "Preferences", Icon: SlidersHorizontal },
] as const;

export default function SettingsPage() {
  const { user, firm } = useSession();
  const teamQuery = useTeam();
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("firm");

  return (
    <div className="bq-page">
      <PageHeader title="Settings" subtitle="Firm, team, templates, and your preferences." />

      <div className="grid gap-6 lg:grid-cols-[180px_1fr]">
        <nav className="space-y-1 lg:sticky lg:top-4 lg:self-start">
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex w-full items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-left text-sm ${tab === key ? "bg-[var(--color-primary-subtle)] text-[var(--color-primary-subtle-fg)]" : "text-[var(--color-text-2)] hover:bg-[var(--color-surface-2)]"}`}
            >
              <Icon size={15} aria-hidden />{label}
            </button>
          ))}
        </nav>

        <div>
          {tab === "firm" ? (
            <Card>
              <CardHeader><CardTitle>Firm</CardTitle></CardHeader>
              <dl className="space-y-3 text-sm">
                <SettingRow label="Firm name" value={firm.name} />
                <SettingRow label="Primary timezone" value={firm.primaryTimezone} />
                <SettingRow label="Client timezone" value={firm.clientTimezone} />
                <SettingRow label="Shift window" value="18:30 – 00:30 IST" />
                <SettingRow label="Default follow-up cadence" value="Day-3 LinkedIn · Day-7 email" />
              </dl>
            </Card>
          ) : null}

          {tab === "team" ? (
            <Card className="p-0">
              <CardHeader className="p-4"><CardTitle>Members</CardTitle></CardHeader>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-[var(--color-border)] bg-[var(--color-surface-3)] text-left text-caption text-[var(--color-text-3)]">
                    <th className="px-4 py-2 font-medium">Name</th>
                    <th className="px-4 py-2 font-medium">Email</th>
                    <th className="px-4 py-2 font-medium">Role</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {(teamQuery.data ?? []).map((u) => (
                    <tr key={u.id}>
                      <td className="px-4 py-3 text-body-strong">{u.name}</td>
                      <td className="px-4 py-3 text-[var(--color-text-3)]">{u.email}</td>
                      <td className="px-4 py-3"><Tag tone={u.role === "OWNER" ? "violet" : u.role === "MANAGER" ? "blue" : "neutral"}>{u.role}</Tag></td>
                      <td className="px-4 py-3">{u.isActive ? <Tag tone="green">Active</Tag> : <Tag tone="neutral">Inactive</Tag>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          ) : null}

          {tab === "templates" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {["Modern", "Classic", "Minimal"].map((t) => (
                <Card key={t}>
                  <CardHeader><CardTitle>{t} resume</CardTitle><Tag tone="blue">Resume</Tag></CardHeader>
                  <div className="h-28 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)]" />
                  <p className="mt-2 text-caption text-[var(--color-text-3)]">Merge fields: {"{name}"}, {"{title}"}, {"{summary}"}</p>
                </Card>
              ))}
              {["Intro", "Follow-up"].map((t) => (
                <Card key={t}>
                  <CardHeader><CardTitle>{t} email</CardTitle><Tag tone="teal">Outreach</Tag></CardHeader>
                  <p className="text-caption text-[var(--color-text-3)]">Merge fields: {"{First name}"}, {"{Company}"}, {"{Role}"}, {"{Candidate}"}</p>
                </Card>
              ))}
            </div>
          ) : null}

          {tab === "preferences" ? (
            <Card>
              <CardHeader><CardTitle>Preferences</CardTitle></CardHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-[var(--color-text)]">Theme</div>
                    <div className="text-caption text-[var(--color-text-3)]">Light is default; dark for the night shift.</div>
                  </div>
                  <ThemeToggle />
                </div>
                <DensityControl />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-[var(--color-text)]">Keyboard shortcuts</div>
                    <div className="text-caption text-[var(--color-text-3)]">Press <kbd className="text-mono-sm">?</kbd> anywhere to open the shortcut sheet.</div>
                  </div>
                  <Tag tone="neutral">⌘K · g d · g c · g j</Tag>
                </div>
                <SettingRow label="Signed in as" value={`${user.name} · ${user.role}`} />
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DensityControl() {
  const density = useUiStore((s) => s.density);
  const setDensity = useUiStore((s) => s.setDensity);
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm text-[var(--color-text)]">Density</div>
        <div className="text-caption text-[var(--color-text-3)]">Row height across tables.</div>
      </div>
      <div className="bq-tabs" role="tablist" aria-label="Density">
        {(["compact", "default", "comfortable"] as const).map((d) => (
          <button key={d} role="tab" aria-selected={density === d} onClick={() => setDensity(d)} className="capitalize">{d}</button>
        ))}
      </div>
    </div>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3 last:border-0 last:pb-0">
      <dt className="text-[var(--color-text-3)]">{label}</dt>
      <dd className="text-[var(--color-text-2)]">{value}</dd>
    </div>
  );
}
