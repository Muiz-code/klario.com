"use client";

import { useRouter } from "next/navigation";
import { Ban, LogOut } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export function DisabledScreen() {
  const router = useRouter();
  const signOut = async () => {
    try {
      await supabaseBrowser().auth.signOut();
    } catch {
      /* still navigate away */
    }
    router.push("/marketing");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink px-4 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-400/10 text-red-300">
        <Ban size={24} />
      </span>
      <h1 className="font-display text-2xl text-bg">Your access has been disabled</h1>
      <p className="max-w-sm text-sm text-bg/50">
        A superadmin has turned off your Klario admin access. If you think this is
        a mistake, reach out to your team.
      </p>
      <button
        type="button"
        onClick={signOut}
        className="mt-2 inline-flex items-center gap-2 rounded-xl border border-bg/15 px-4 py-2.5 text-sm text-bg/80 hover:border-gold/40 hover:text-bg"
      >
        <LogOut size={15} /> Sign out
      </button>
    </div>
  );
}
