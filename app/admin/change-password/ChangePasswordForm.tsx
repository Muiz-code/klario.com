"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export function ChangePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
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
      const { error: updErr } = await supabase.auth.updateUser({ password });
      if (updErr) {
        setError(updErr.message || "Could not update password.");
        setBusy(false);
        return;
      }
      // Clear the forced-change flag server-side, then continue.
      await fetch("/api/admin/team/complete-password", { method: "POST" }).catch(() => {});
      router.push("/marketing/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error.");
      setBusy(false);
    }
  };

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
