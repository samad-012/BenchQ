"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { BriefcaseBusiness, Building2, Link2, MapPin, Plus, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, type SelectOption } from "@/components/ui/select";

const SOURCE_OPTIONS: SelectOption[] = [
  { value: "LINKEDIN", label: "LinkedIn" },
  { value: "INDEED", label: "Indeed" },
  { value: "DICE", label: "Dice" },
  { value: "GLASSDOOR", label: "Glassdoor" },
  { value: "COMPANY", label: "Company career site" },
];

const WORK_MODE_OPTIONS: SelectOption[] = [
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "ONSITE", label: "On-site" },
];

const EMPLOYMENT_OPTIONS: SelectOption[] = [
  { value: "CONTRACT", label: "Contract" },
  { value: "FULL_TIME", label: "Full-time" },
  { value: "CONTRACT_TO_HIRE", label: "Contract to hire" },
  { value: "PART_TIME", label: "Part-time" },
];

const PAY_PERIOD_OPTIONS: SelectOption[] = [
  { value: "HOUR", label: "Per hour" },
  { value: "YEAR", label: "Per year" },
  { value: "MONTH", label: "Per month" },
];

function detectSource(url: string) {
  const normalized = url.toLowerCase();
  if (normalized.includes("linkedin.")) return "LINKEDIN";
  if (normalized.includes("indeed.")) return "INDEED";
  if (normalized.includes("dice.")) return "DICE";
  if (normalized.includes("glassdoor.")) return "GLASSDOOR";
  return "COMPANY";
}

export function JobCaptureForm({ modal = false, onClose }: { modal?: boolean; onClose?: () => void }) {
  const router = useRouter();
  const [source, setSource] = useState("LINKEDIN");
  const [workMode, setWorkMode] = useState("HYBRID");
  const [employmentType, setEmploymentType] = useState("CONTRACT");
  const [payPeriod, setPayPeriod] = useState("HOUR");
  const [saving, setSaving] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      if (onClose) onClose();
      else router.back();
    }, 650);
  }

  return (
    <div>
      <header className={modal ? "pr-10" : undefined}>
        <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary-subtle)] text-[var(--color-primary)]">
          <BriefcaseBusiness size={18} aria-hidden />
        </div>
        <h1 id="capture-job-title" className="text-title text-[var(--color-text)]">Capture job</h1>
        <p className="mt-1 text-sm text-[var(--color-text-3)]">Add the source and role details used for matching, outreach, and application tracking.</p>
      </header>

      <form onSubmit={handleSubmit} className="mt-5 space-y-5">
        <section aria-labelledby="capture-source-heading" className="space-y-3">
          <div>
            <h2 id="capture-source-heading" className="text-body-strong text-[var(--color-text)]">Source</h2>
            <p className="text-caption text-[var(--color-text-3)]">Keep the original listing attached to the job record.</p>
          </div>
          <label className="block space-y-1.5">
            <span className="text-label">Job URL</span>
            <span className="relative block">
              <Link2 size={14} aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-3)]" />
              <Input name="sourceUrl" type="url" required placeholder="https://www.linkedin.com/jobs/view/…" className="pl-8" onBlur={(event) => { if (event.target.value) setSource(detectSource(event.target.value)); }} />
            </span>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <FieldLabel label="Portal"><Select value={source} options={SOURCE_OPTIONS} onValueChange={setSource} aria-label="Job source portal" /></FieldLabel>
            <label className="block space-y-1.5"><span className="text-label">Reference ID</span><Input name="referenceId" placeholder="e.g. 4021847319" /></label>
          </div>
        </section>

        <div className="h-px bg-[var(--color-border)]" />

        <section aria-labelledby="capture-details-heading" className="space-y-3">
          <div>
            <h2 id="capture-details-heading" className="text-body-strong text-[var(--color-text)]">Role details</h2>
            <p className="text-caption text-[var(--color-text-3)]">The essentials candidates will be scored against.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1.5"><span className="text-label">Job title</span><span className="relative block"><BriefcaseBusiness size={14} aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-3)]" /><Input name="title" required placeholder="Senior Java Developer" className="pl-8" /></span></label>
            <label className="block space-y-1.5"><span className="text-label">Company</span><span className="relative block"><Building2 size={14} aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-3)]" /><Input name="company" required placeholder="Company name" className="pl-8" /></span></label>
            <label className="block space-y-1.5"><span className="text-label">Location</span><span className="relative block"><MapPin size={14} aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-3)]" /><Input name="location" required placeholder="Dallas, TX" className="pl-8" /></span></label>
            <FieldLabel label="Work mode"><Select value={workMode} options={WORK_MODE_OPTIONS} onValueChange={setWorkMode} aria-label="Work mode" /></FieldLabel>
            <FieldLabel label="Employment type"><Select value={employmentType} options={EMPLOYMENT_OPTIONS} onValueChange={setEmploymentType} aria-label="Employment type" /></FieldLabel>
            <label className="block space-y-1.5"><span className="text-label">Required experience</span><Input name="experience" placeholder="e.g. 5+ years" /></label>
          </div>
        </section>

        <section aria-labelledby="capture-comp-heading" className="space-y-3">
          <h2 id="capture-comp-heading" className="text-body-strong text-[var(--color-text)]">Compensation & eligibility</h2>
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1.15fr]">
            <label className="block space-y-1.5"><span className="text-label">Minimum</span><Input name="rateMin" type="number" min="0" placeholder="$85" /></label>
            <label className="block space-y-1.5"><span className="text-label">Maximum</span><Input name="rateMax" type="number" min="0" placeholder="$115" /></label>
            <FieldLabel label="Pay period"><Select value={payPeriod} options={PAY_PERIOD_OPTIONS} onValueChange={setPayPeriod} aria-label="Pay period" /></FieldLabel>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] px-3 py-2.5">
            <CheckLabel name="visaSponsorship" label="Visa sponsorship available" />
            <CheckLabel name="excludesC2c" label="No C2C" />
            <CheckLabel name="verified" label="Source verified" />
          </div>
        </section>

        <section className="space-y-3">
          <label className="block space-y-1.5"><span className="text-label">Core skills</span><Input name="skills" placeholder="Java, Spring Boot, AWS, PostgreSQL" /><span className="block text-caption text-[var(--color-text-3)]">Separate skills with commas.</span></label>
          <label className="block space-y-1.5"><span className="text-label">Job description</span><textarea name="description" required className="bq-input min-h-28 resize-y py-2 text-body" placeholder="Paste the responsibilities, requirements, and role context…" /></label>
        </section>

        <footer className="sticky -bottom-6 -mx-6 flex items-center justify-between gap-3 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-4">
          <span className="hidden items-center gap-1.5 text-caption text-[var(--color-text-3)] sm:inline-flex"><Sparkles size={13} aria-hidden />Matching starts after capture</span>
          <div className="ml-auto flex gap-2">
            <Button variant="secondary" type="button" onClick={() => (onClose ? onClose() : router.back())}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Capturing…" : "Capture job"}</Button>
          </div>
        </footer>
      </form>
    </div>
  );
}

export function JobCaptureDialogTrigger() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  function closeDialog() {
    dialogRef.current?.close();
  }

  return (
    <>
      <Button variant="secondary" onClick={() => dialogRef.current?.showModal()}><Plus size={14} aria-hidden />Capture job</Button>
      <dialog
        ref={dialogRef}
        className="bq-dialog bq-dialog-wide"
        aria-labelledby="capture-job-title"
        onCancel={(event) => { event.preventDefault(); closeDialog(); }}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const rect = event.currentTarget.getBoundingClientRect();
          if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog();
        }}
      >
        <div className="absolute right-4 top-4">
          <Button variant="ghost" size="icon" onClick={closeDialog} aria-label="Close capture job"><X size={18} /></Button>
        </div>
        <JobCaptureForm modal onClose={closeDialog} />
      </dialog>
    </>
  );
}

function FieldLabel({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-1.5"><span className="text-label">{label}</span>{children}</div>;
}

function CheckLabel({ name, label }: { name: string; label: string }) {
  return <label className="inline-flex items-center gap-2 text-sm text-[var(--color-text-2)]"><Checkbox name={name} />{label}</label>;
}
