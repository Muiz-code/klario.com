import { redirect } from "next/navigation";
import { getAccess } from "@/lib/auth/access";
import { AdminSidebar } from "./AdminSidebar";

export const dynamic = "force-dynamic";

export default async function AuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await getAccess();
  if (!access) redirect("/marketing");
  // A member who hasn't set their password is redirected by the middleware, but
  // guard here too in case they reach a page directly.
  if (access.mustChangePassword) redirect("/marketing/change-password");

  return (
    <div className="min-h-dvh md:pl-64">
      <AdminSidebar
        email={access.email}
        capabilities={[...access.capabilities]}
        isSuperadmin={access.isSuperadmin}
      />
      <main className="px-4 pt-16 pb-12 md:px-10 md:pt-10">{children}</main>
    </div>
  );
}
