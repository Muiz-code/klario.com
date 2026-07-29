import { ChangePasswordForm } from "./ChangePasswordForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Set your password",
  robots: { index: false, follow: false },
};

export default function ChangePasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm rounded-2xl border border-bg/12 bg-bg/4 p-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-gold">
          Welcome to Klario
        </p>
        <h1 className="mt-2 font-display text-2xl text-bg">Set your password</h1>
        <p className="mt-2 text-sm text-bg/55">
          You signed in with a temporary password. Choose your own to finish
          setting up your account.
        </p>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
