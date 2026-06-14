"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";

type Toast = { kind: "success" | "error"; message: string } | null;

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  // Auto-dismiss the toast after a few seconds.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setToast(null);
    try {
      const supabase = supabaseBrowser();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setToast({ kind: "error", message: error.message || "Login failed." });
        setSubmitting(false);
        return;
      }
      setToast({ kind: "success", message: "Signed in. Redirecting..." });
      router.push("/p@ss1/dashboard");
      router.refresh();
    } catch (err) {
      setToast({
        kind: "error",
        message: err instanceof Error ? err.message : "Network error.",
      });
      setSubmitting(false);
    }
  };

  return (
    <>
      <Toaster toast={toast} onDismiss={() => setToast(null)} />

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        <input
          id="admin-email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          autoFocus
          autoComplete="username"
          inputMode="email"
          disabled={submitting}
          className="rounded-xl border border-bg/15 bg-bg/4 px-4 py-3.5 text-sm text-bg placeholder:text-bg/40 focus:border-gold/60 focus:outline-none disabled:opacity-60"
        />
        <div className="relative">
          <input
            id="admin-password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            autoComplete="current-password"
            disabled={submitting}
            className="w-full rounded-xl border border-bg/15 bg-bg/4 px-4 py-3.5 pr-11 text-sm text-bg placeholder:text-bg/40 focus:border-gold/60 focus:outline-none disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            disabled={submitting}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-bg/45 transition-colors hover:text-bg/80 disabled:opacity-50"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3.5 text-sm font-medium text-ink transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-80"
        >
          {submitting && <Loader2 size={15} className="animate-spin" />}
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </>
  );
}

function Toaster({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  const success = toast?.kind === "success";
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 top-4 z-50 flex justify-end"
    >
      <div
        className={
          "pointer-events-auto flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-md transition-all duration-300 " +
          (toast
            ? "translate-y-0 opacity-100"
            : "-translate-y-2 opacity-0") +
          " " +
          (success
            ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-100"
            : "border-red-400/30 bg-red-500/15 text-red-100")
        }
        role="status"
        onClick={onDismiss}
      >
        {success ? (
          <CheckCircle2 size={16} className="shrink-0 text-emerald-300" />
        ) : (
          <AlertCircle size={16} className="shrink-0 text-red-300" />
        )}
        <span>{toast?.message ?? ""}</span>
      </div>
    </div>
  );
}
