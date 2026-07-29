"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff, ShieldCheck, CheckCircle2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export function ChangePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (password.length < 8) return setError("Use at least 8 characters.");
    if (password !== confirm) return setError("The passwords don't match.");
    setBusy(true);
    try {
      const supabase = supabaseBrowser();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const email = user?.email ?? "";

      const { error: updErr } = await supabase.auth.updateUser({ password });
      if (updErr) {
        setError(updErr.message || "Could not update password.");
        setBusy(false);
        return;
      }
      // Clear the forced-change flag (while still signed in), then sign out and
      // send them to the login screen to sign in with the new password.
      await fetch("/api/admin/team/complete-password", { method: "POST" }).catch(() => {});
      await supabase.auth.signOut().catch(() => {});
      setDone(true);
      setTimeout(() => {
        router.push(`/marketing?email=${encodeURIComponent(email)}&changed=1`);
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error.");
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="mt-8 flex flex-col items-center gap-3 text-center">
        <CheckCircle2 size={40} className="text-emerald-400" />
        <p className="font-display text-lg text-bg">Password changed</p>
        <p className="text-sm text-bg/55">
          Taking you to sign in with your new password…
        </p>
        <Loader2 size={16} className="mt-1 animate-spin text-bg/40" />
      </div>
    );
  }

  const input =
    "w-full rounded-xl border border-bg/15 bg-bg/4 px-4 py-3.5 pr-11 text-sm text-bg placeholder:text-bg/40 focus:border-gold/60 focus:outline-none disabled:opacity-60";

  return (
    <form onSubmit={submit} className="mt-8 flex flex-col gap-4">
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          autoFocus
          autoComplete="new-password"
          disabled={busy}
          className={input}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          disabled={busy}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-bg/45 hover:text-bg/80 disabled:opacity-50"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      <input
        type={show ? "text" : "password"}
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="Confirm new password"
        autoComplete="new-password"
        disabled={busy}
        className={input.replace(" pr-11", "")}
      />
      {error && (
        <p className="rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-[13px] text-red-200">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3.5 text-sm font-medium text-ink transition-all hover:scale-[1.01] disabled:opacity-80"
      >
        {busy ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
        {busy ? "Saving…" : "Set password & continue"}
      </button>
    </form>
  );
}
