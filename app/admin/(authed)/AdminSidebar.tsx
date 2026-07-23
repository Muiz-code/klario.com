"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";

const primaryNav = [
  { href: "/p@ss1/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/p@ss1/newsletters", label: "Campaigns", icon: Megaphone },
  { href: "/p@ss1/blog", label: "Blog", icon: Newspaper },
  { href: "/p@ss1/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/p@ss1/subscribers", label: "Audience", icon: Users },
  { href: "/p@ss1/automations", label: "Automations", icon: Workflow },
  { href: "/p@ss1/segments", label: "Segments", icon: Layers },
  { href: "/p@ss1/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/p@ss1/reports", label: "Reports", icon: FileText },
  { href: "/p@ss1/settings", label: "Settings", icon: Settings },
];

const toolsNav = [
  { href: "/p@ss1/beta", label: "Beta responses", icon: ClipboardList },
  { href: "/p@ss1/anchor-club", label: "Anchor Club", icon: Anchor },
  { href: "/p@ss1/submissions", label: "Submissions", icon: Inbox },
  { href: "/p@ss1/audit", label: "Audit log", icon: ScrollText },
];

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    try {
      await supabaseBrowser().auth.signOut();
    } catch {
      // ignore; still navigate away
    }
    router.push("/p@ss1");
    router.refresh();
  };

  const isActive = (href: string) => {
    // usePathname() can return either the public "/p@ss1/..." URL or the
    // rewritten "/admin/..." path, so match against both forms.
    const internal = href.replace("/p@ss1", "/admin");
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
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold text-ink">
              <Crown size={16} strokeWidth={2.2} />
            </span>
            <div className="leading-tight">
              <span className="block font-display text-base font-bold tracking-tight text-bg">
                Klario
              </span>
              <span className="block text-[9px] uppercase tracking-[0.2em] text-gold">
                Marketing
              </span>
            </div>
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

        {/* Quick compose */}
        <div className="px-3 pb-2">
          <Link
            href="/p@ss1/newsletters/new"
            onClick={() => setOpen(false)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-3 py-2.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.01]"
          >
            <PenSquare size={15} strokeWidth={2} />
            Compose mail
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <ul className="flex flex-col gap-1">
            {primaryNav.map(renderItem)}
          </ul>

          <p className="px-3 pb-2 pt-5 text-[10px] font-medium uppercase tracking-[0.18em] text-bg/35">
            More
          </p>
          <ul className="flex flex-col gap-1">{toolsNav.map(renderItem)}</ul>
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
