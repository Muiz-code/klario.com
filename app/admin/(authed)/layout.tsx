import { redirect } from "next/navigation";
import { getAdminEmail } from "@/lib/supabase/server";
import { AdminSidebar } from "./AdminSidebar";

export const dynamic = "force-dynamic";

export default async function AuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const email = await getAdminEmail();
  if (!email) redirect("/p@ss1");

  return (
    <div className="min-h-dvh md:pl-64">
      <AdminSidebar email={email} />
      <main className="px-4 pt-16 pb-12 md:px-10 md:pt-10">{children}</main>
    </div>
  );
}
