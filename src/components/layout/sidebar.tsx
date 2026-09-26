"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Send,
  Mail,
  Bell,
  BarChart3,
  ScrollText,
  FileText,
  Settings,
  SwatchBook,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useSession, type FirmRole } from "@/lib/stores/session-store";
import { EASE_OUT } from "@/lib/motion";

/**
 * Frosted navigation: 208px expanded, 60px collapsed, 48px mobile rail.
 *
 * Permission rendering rule: "A control the current role cannot use is not
 * rendered at all." Every item below shows for all four roles EXCEPT the two
 * the docs table marks with a bare dash — Analytics is BDE-invisible,
 * Follow-ups is VIEWER-invisible. Everything else differs in *scope* within
 * the page (own/assigned/all, read-only), not in nav visibility.
 */

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  /** Omit to show for every role. */
  hiddenFor?: FirmRole[];
}

const PRIMARY: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/candidates", label: "Candidates", icon: Users },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/applications", label: "Applications", icon: Send },
  { href: "/resumes", label: "Resume Builder", icon: FileText },
  { href: "/outreach", label: "Outreach", icon: Mail },
  { href: "/followups", label: "Follow-ups", icon: Bell, hiddenFor: ["VIEWER"] },
  { href: "/analytics", label: "Analytics", icon: BarChart3, hiddenFor: ["BDE"] },
  { href: "/ledger", label: "Ledger", icon: ScrollText },
];

const SECONDARY: NavItem[] = [
  { href: "/design-system", label: "Design system", icon: SwatchBook },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const role = useSession((s) => s.user.role);
  const reduceMotion = useReducedMotion() ?? false;
  const primary = PRIMARY.filter((item) => !item.hiddenFor?.includes(role));
  const secondary = SECONDARY.filter((item) => !item.hiddenFor?.includes(role));
  const fade = { duration: reduceMotion ? 0 : 0.14, ease: EASE_OUT };

  // Width, padding and label opacity transition in CSS (.bq-sidebar in globals.css), so the
  // workspace reflows smoothly beside it and nothing is scaled. Icons keep their x position.
  return (
    <aside className="bq-sidebar" data-collapsed={collapsed} aria-label="Primary">
      {/* Same height in both states (48px row + 20px gap) so the nav never shifts vertically. */}
      <div className="relative h-[4.25rem]">
        <AnimatePresence initial={false} mode="popLayout">
          {collapsed ? (
            <motion.div
              key="collapsed"
              className="flex flex-col items-center gap-1 pt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { ...fade, delay: reduceMotion ? 0 : 0.1 } }}
              exit={{ opacity: 0, transition: fade }}
            >
              <Image src="/logo-mark.png" alt="BenchQ" width={28} height={28} priority className="sidebar-mark rounded-[var(--radius-md)]" />
              <button
                type="button"
                onClick={onToggle}
                aria-label="Expand sidebar"
                aria-expanded={false}
                title="Expand sidebar"
                className="sidebar-toggle inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-3)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
              >
                <PanelLeftOpen size={15} aria-hidden />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              className="flex h-12 w-full items-center pl-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { ...fade, delay: reduceMotion ? 0 : 0.12 } }}
              exit={{ opacity: 0, transition: fade }}
            >
              <Image src="/logo-full.svg" alt="BenchQ" width={489} height={100} priority className="sidebar-wordmark logo-wordmark h-auto w-[100px]" />
              <button
                type="button"
                onClick={onToggle}
                aria-label="Collapse sidebar"
                aria-expanded
                title="Collapse sidebar"
                className="sidebar-toggle ml-auto inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-3)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
              >
                <PanelLeftClose size={15} aria-hidden />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden">
        <p className="sidebar-label mb-2 px-2.5 text-caption text-[var(--color-text-3)]" aria-hidden={collapsed}>Workspace</p>
        <ul className="space-y-0.5">
          {primary.map((item) => (
            <SidebarItem key={item.href} item={item} />
          ))}
        </ul>

        <div className="my-5" />
        <p className="sidebar-label mb-2 px-2.5 text-caption text-[var(--color-text-3)]" aria-hidden={collapsed}>Preferences</p>
        <ul className="space-y-0.5">
          {secondary.map((item) => (
            <SidebarItem key={item.href} item={item} />
          ))}
        </ul>
      </nav>
    </aside>
  );
}

function SidebarItem({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const Icon = item.icon;
  const isActive =
    pathname === item.href || pathname?.startsWith(item.href + "/");

  return (
    <li>
      <Link
        href={item.href}
        aria-current={isActive ? "page" : undefined}
        title={item.label}
        aria-label={item.label}
        className="bq-nav-item text-body"
      >
        <Icon size={16} aria-hidden="true" className="shrink-0" />
        <span className="sidebar-label flex-1 truncate">{item.label}</span>
        {item.badge && item.badge > 0 ? (
          <span className="sidebar-label tabular text-caption font-[600] rounded-[var(--radius-full)] bg-[var(--color-danger-fg)] text-white px-1.5 min-w-5 h-5 inline-flex items-center justify-center">
            {item.badge > 99 ? "99+" : item.badge}
          </span>
        ) : null}
      </Link>
    </li>
  );
}
