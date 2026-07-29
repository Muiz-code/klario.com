import { Lock } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "No access", robots: { index: false, follow: false } };

export default function NoAccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-ink px-4 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-bg/8 text-bg/50">
        <Lock size={22} />
      </span>
      <h1 className="font-display text-2xl text-bg">You&apos;re signed in, but no sections yet</h1>
      <p className="max-w-sm text-sm text-bg/50">
        Your role doesn&apos;t include any sections of the admin. Ask a superadmin
        to grant your role access.
      </p>
    </div>
  );
}
