"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/layout/Logo";
import { APP_LINKS } from "@/lib/constants";

export type InvitePreview = {
  orgName: string;
  roleLabel: string;
  email: string;
  expired: boolean;
  invitedBy: string | null;
};

/**
 * The invite landing. Tries the app first (klario://invite), then offers the
 * store. A person who installs from here comes back to the same email link,
 * which then opens the app straight onto the invitation.
 */
export function InviteLanding({ token, preview }: { token: string | null; preview: InvitePreview | null }) {
  const deepLink = token ? `klario://invite?token=${encodeURIComponent(token)}` : null;
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other");
  const [tried, setTried] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || "";
    setPlatform(/iPhone|iPad|iPod/i.test(ua) ? "ios" : /Android/i.test(ua) ? "android" : "other");
  }, []);

  // On a phone, try the app as soon as the page is up. If it is installed
  // the OS switches to it; if not, nothing happens and the buttons below are
  // the way forward. Desktop never tries: there is no app to open.
  useEffect(() => {
    if (!deepLink || platform === "other" || !preview || preview.expired) return;
    const t = setTimeout(() => {
      window.location.href = deepLink;
      setTried(true);
    }, 400);
    return () => clearTimeout(t);
  }, [deepLink, platform, preview]);

  const storeHref = platform === "ios" ? APP_LINKS.ios : APP_LINKS.android;
  const storeLabel = platform === "ios" ? "Get Klario on the App Store" : platform === "android" ? "Get Klario on Google Play" : null;

  const body = useMemo(() => {
    if (!token) return { title: "This link is incomplete", text: "Open the invitation from the email you received, or ask the business to send it again." };
    if (!preview) return { title: "This invitation is no longer valid", text: "Ask the business to send you a new one." };
    if (preview.expired) return { title: "This invitation has expired", text: "Invitations work for 7 days. Ask the business to send you a new one." };
    return {
      title: `${preview.orgName} has invited you`,
      text: `You would join as ${preview.roleLabel}, using ${preview.email}. Your own Klario account and money stay private to you. You will only see what ${preview.invitedBy ?? "the business"} has given you access to.`,
    };
  }, [token, preview]);

  const live = !!token && !!preview && !preview.expired;

  return (
    <main className="min-h-dvh bg-bg">
      <Container className="flex min-h-dvh flex-col items-center justify-center py-16">
        <Logo className="mb-10" />
        <div className="w-full max-w-md rounded-3xl border border-border-gold bg-surface p-8 text-center shadow-[0_24px_60px_-30px_rgba(78,44,32,0.35)]">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gold-dim text-gold">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" /><path d="M9 9h1M9 13h1M9 17h1" />
            </svg>
          </div>
          <h1 className="font-[family-name:var(--font-jakarta)] text-2xl font-semibold tracking-tight text-mahogany">{body.title}</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-body">{body.text}</p>

          {live && (
            <div className="mt-8 flex flex-col gap-3">
              {platform !== "other" && deepLink && (
                <Button href={deepLink} size="lg" className="w-full">
                  {tried ? "Open in Klario again" : "Accept in the Klario app"}
                </Button>
              )}
              {storeLabel && (
                <Button href={storeHref} variant={platform !== "other" ? "outline" : "solid"} size="lg" className="w-full" external>
                  {storeLabel}
                </Button>
              )}
              {platform === "other" && (
                <div className="flex flex-col gap-3">
                  <Button href={APP_LINKS.ios} variant="solid" size="lg" className="w-full" external>Get Klario on the App Store</Button>
                  <Button href={APP_LINKS.android} variant="outline" size="lg" className="w-full" external>Get Klario on Google Play</Button>
                </div>
              )}
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {platform === "other"
                  ? "Invitations are accepted on your phone. Install Klario there, then open this email on your phone and tap the link again."
                  : "Don't have Klario yet? Install it, then come back to the email and tap the link again. It will open straight onto this invitation, and you can create your account with the address it was sent to."}
              </p>
            </div>
          )}
        </div>
        <p className="mt-8 text-xs text-muted">Klario · klario.finance</p>
      </Container>
    </main>
  );
}
