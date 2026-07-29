import { Lock } from "lucide-react";

/** Shown when a signed-in member lacks the capability for a section. */
export function NoAccess() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-bg/8 text-bg/50">
        <Lock size={20} />
      </span>
      <h1 className="font-display text-xl text-bg">No access to this section</h1>
      <p className="max-w-sm text-sm text-bg/50">
        Your role doesn&apos;t include this area. Ask a superadmin if you need it added.
      </p>
    </div>
  );
}
