import { redirect } from "next/navigation";
import { getAdminEmail } from "@/lib/supabase/server";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminEntry() {
  const email = await getAdminEmail();
  if (email) redirect("/p@ss1/dashboard");

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-4">
      {/* Background image + scrim for legibility */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/admin-login-bg.jpeg')" }}
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[#0a0a0c]/80 backdrop-blur-[2px]"
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-bg/10 bg-[#0d0e12]/70 px-10 py-14 shadow-2xl backdrop-blur-md sm:px-14">
        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-3xl font-bold tracking-tight text-bg">
            Klario
          </span>
          <span className="text-[11px] uppercase tracking-[0.18em] text-gold">
            admin
          </span>
        </div>
        <p className="mt-2 text-sm text-bg/55">Sign in to continue.</p>
        <LoginForm />
      </div>
    </div>
  );
}
