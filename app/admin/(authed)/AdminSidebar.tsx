"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Inbox,
  Mail,
  Send,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";

const items = [
  { href: "/p@ss1/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/p@ss1/subscribers", label: "Subscribers", icon: Users },
  { href: "/p@ss1/submissions", label: "Submissions", icon: Inbox },
  { href: "/p@ss1/email", label: "Beta invite", icon: Send },
  { href: "/p@ss1/newsletters", label: "Newsletters", icon: Mail },
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
    const internal = href.replace("/p@ss1", "/admin");
    return pathname === internal || pathname === href;
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
        <div className="flex items-center justify-between border-b border-bg/10 px-5 py-5">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-lg font-bold tracking-tight text-bg">
              Klario
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-gold">
              admin
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

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-1">
            {items.map((it) => {
              const Icon = it.icon;
              const active = isActive(it.href);
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    onClick={() => setOpen(false)}
                    className={
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors " +
                      (active
                        ? "bg-bg/10 text-bg"
                        : "text-bg/65 hover:bg-bg/5 hover:text-bg")
                    }
                  >
                    <Icon size={16} strokeWidth={1.75} />
                    {it.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-bg/10 px-3 py-3">
          <p className="truncate px-3 pb-2 text-[11px] text-bg/40" title={email}>
            {email}
          </p>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-bg/65 transition-colors hover:bg-red-400/10 hover:text-red-200"
          >
            <LogOut size={16} strokeWidth={1.75} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
