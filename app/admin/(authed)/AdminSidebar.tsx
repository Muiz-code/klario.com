"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import brandLogo from "@/public/Klario-primary-and-secondary-Logo.png";
import {
  LayoutDashboard,
  Megaphone,
  Newspaper,
  Users,
  Workflow,
  Layers,
  LayoutTemplate,
  FileText,
  BarChart3,
  PenSquare,
  Settings,
  Inbox,
  ScrollText,
  ClipboardList,
  Anchor,
  Crown,
  FlaskConical,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { capabilityForPath } from "@/lib/auth/capabilities";

// Sidebar navigation grouped into collapsible accordion sections.
const NAV_GROUPS = [
  {
    key: "overview",
    title: "Overview",
    items: [
      { href: "/marketing/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/marketing/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/marketing/reports", label: "Reports", icon: FileText },
    ],
  },
  {
    key: "campaigns",
    title: "Campaigns",
    items: [
      { href: "/marketing/newsletters", label: "Campaigns", icon: Megaphone },
      { href: "/marketing/automations", label: "Automations", icon: Workflow },
      { href: "/marketing/templates", label: "Templates", icon: LayoutTemplate },
      { href: "/marketing/segments", label: "Segments", icon: Layers },
    ],
  },
  {
    key: "audience",
    title: "Audience",
    items: [
      { href: "/marketing/subscribers", label: "Audience", icon: Users },
      { href: "/marketing/beta", label: "Beta responses", icon: ClipboardList },
      { href: "/marketing/anchor-club", label: "Anchor Club", icon: Anchor },
      { href: "/marketing/submissions", label: "Submissions", icon: Inbox },
    ],
  },
  {
    key: "content",
    title: "Content",
    items: [{ href: "/marketing/blog", label: "Blog", icon: Newspaper }],
  },
  {
    key: "system",
    title: "System",
    items: [
      { href: "/marketing/audit", label: "Audit log", icon: ScrollText },
      { href: "/marketing/test-lab", label: "Test lab", icon: FlaskConical },
      { href: "/marketing/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function AdminSidebar({
  email,
  capabilities = [],
  isSuperadmin = false,
}: {
  email: string;
  capabilities?: string[];
  isSuperadmin?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Show only the sections this role can access (superadmin sees everything;
  // an item with no guarding capability is always shown).
  const caps = new Set(capabilities);
  const allowed = (href: string) => {
    if (isSuperadmin) return true;
    const cap = capabilityForPath(href);
    return cap === null || caps.has(cap);
  };
  const NAV = NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((it) => allowed(it.href)),
  })).filter((g) => g.items.length > 0);

  const groupMatch = (href: string) => {
    const internal = href.replace("/marketing", "/admin");
    return (
      pathname === href ||
      pathname.startsWith(href + "/") ||
      pathname === internal ||
      pathname.startsWith(internal + "/")
    );
  };
  const activeGroupKey = NAV.find((g) =>
    g.items.some((it) => groupMatch(it.href))
  )?.key;
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    () => new Set(activeGroupKey ? [activeGroupKey] : NAV[0] ? [NAV[0].key] : [])
  );
  // Keep the group holding the current page open as you navigate.
  useEffect(() => {
    if (activeGroupKey) {
      setOpenGroups((prev) =>
        prev.has(activeGroupKey) ? prev : new Set([activeGroupKey])
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
  // Single-open accordion: opening a group collapses whichever was open.
  const toggleGroup = (key: string) =>
    setOpenGroups((prev) => (prev.has(key) ? new Set() : new Set([key])));

  const logout = async () => {
    try {
      await supabaseBrowser().auth.signOut();
    } catch {
      // ignore; still navigate away
    }
    router.push("/marketing");
    router.refresh();
  };

  const isActive = (href: string) => {
    // usePathname() can return either the public "/marketing/..." URL or the
    // rewritten "/admin/..." path, so match against both forms.
    const internal = href.replace("/marketing", "/admin");
    const match = (base: string) =>
      pathname === base || pathname.startsWith(base + "/");
    return match(href) || match(internal);
  };

  const renderItem = (it: { href: string; label: string; icon: typeof Users }) => {
    const Icon = it.icon;
    const active = isActive(it.href);
    return (
      <li key={it.href}>
        <Link
          href={it.href}
          onClick={() => setOpen(false)}
          aria-current={active ? "page" : undefined}
          className={
            "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors " +
            (active
              ? "bg-gold/12 font-medium text-gold"
              : "text-bg/60 hover:bg-bg/5 hover:text-bg")
          }
        >
          {active && (
            <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-gold" />
          )}
          <Icon size={17} strokeWidth={1.75} />
          {it.label}
        </Link>
      </li>
    );
  };

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-40 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-bg/15 bg-[#0a0a0c]/80 text-bg/80 backdrop-blur md:hidden"
      >
        <Menu size={18} />
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-ink/60 backdrop-blur-sm md:hidden"
          aria-hidden
        />
      )}

      <aside
        className={
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-bg/10 bg-[#0d0e12]/95 backdrop-blur-xl transition-transform md:translate-x-0 " +
          (open ? "translate-x-0" : "-translate-x-full md:translate-x-0")
        }
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex flex-col gap-1">
            <Image src={brandLogo} alt="Klario" priority sizes="120px" className="h-6 w-auto" />
            <span className="text-[9px] uppercase tracking-[0.2em] text-gold">
              Marketing
            </span>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="text-bg/55 hover:text-bg md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick compose — only for roles that can send mail. */}
        {allowed("/marketing/newsletters/new") && (
          <div className="px-3 pb-2">
            <Link
              href="/marketing/newsletters/new"
              onClick={() => setOpen(false)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-3 py-2.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.01]"
            >
              <PenSquare size={15} strokeWidth={2} />
              Compose mail
            </Link>
          </div>
        )}

        {/* Nav — accordion groups */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <div className="flex flex-col gap-1">
            {NAV.map((g) => {
              const isOpen = openGroups.has(g.key);
              return (
                <div key={g.key}>
                  <button
                    type="button"
                    onClick={() => toggleGroup(g.key)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-[10px] font-medium uppercase tracking-[0.18em] text-bg/40 transition-colors hover:text-bg/70"
                  >
                    {g.title}
                    <ChevronDown
                      size={13}
                      className={
                        "transition-transform " + (isOpen ? "" : "-rotate-90")
                      }
                    />
                  </button>
                  {isOpen && (
                    <ul className="flex flex-col gap-1 pb-1">
                      {g.items.map(renderItem)}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* User */}
        <div className="flex items-center gap-3 border-t border-bg/10 px-4 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15 text-sm font-semibold text-gold">
            {(email[0] || "A").toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-bg">
              {email.split("@")[0]}
            </p>
            <p className="truncate text-[11px] text-bg/45" title={email}>
              {email}
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            aria-label="Logout"
            title="Logout"
            className="rounded-md p-1.5 text-bg/50 transition-colors hover:bg-red-400/10 hover:text-red-300"
          >
            <LogOut size={16} strokeWidth={1.75} />
          </button>
        </div>
      </aside>
    </>
  );
}
