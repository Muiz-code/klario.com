import { DisabledScreen } from "./DisabledScreen";

export const dynamic = "force-dynamic";
export const metadata = { title: "Account disabled", robots: { index: false, follow: false } };

export default function DisabledPage() {
  return <DisabledScreen />;
}
