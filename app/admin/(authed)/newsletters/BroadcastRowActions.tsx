"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, Trash2, RotateCcw } from "lucide-react";
import { ConfirmModal, InfoModal, type ConfirmState } from "../_components/Modal";

export function NewsletterRowActions({
  id,
  status,
  failedCount = 0,
}: {
  id: string;
  status: string;
  failedCount?: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<"send" | "delete" | "resend" | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [info, setInfo] = useState<{ title: string; message: string; ok?: boolean } | null>(null);

  const resendFailed = async () => {
    setBusy("resend");
    const res = await fetch(`/api/admin/newsletters/${id}/resend-failed`, {
      method: "POST",
    });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    setConfirm(null);
    if (res.ok) {
      setInfo({
        title: "Resend complete",
        message:
          data.message ||
          `Resent to ${data.sent} failed recipient${data.sent === 1 ? "" : "s"}.${
            data.failed ? ` ${data.failed} still failed.` : ""
          }`,
        ok: true,
      });
      startTransition(() => router.refresh());
    } else {
      setInfo({
        title: "Could not resend",
        message: data.error || "Try again.",
        ok: false,
      });
    }
  };

  const send = async () => {
    setBusy("send");
    const res = await fetch(`/api/admin/newsletters/${id}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ segment: "all" }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    setConfirm(null);
    if (res.ok) {
      setInfo({
        title: "Sent",
        message: `Delivered to ${data.sent} of ${data.attempted}.`,
        ok: true,
      });
      startTransition(() => router.refresh());
    } else {
      setInfo({ title: "Could not send", message: data.error || "Try again.", ok: false });
    }
  };

  const remove = async () => {
    setBusy("delete");
    const res = await fetch(`/api/admin/newsletters/${id}`, { method: "DELETE" });
    setBusy(null);
    setConfirm(null);
    if (res.ok) startTransition(() => router.refresh());
    else setInfo({ title: "Could not delete", message: "Try again.", ok: false });
  };

  const canSend = status === "draft" || status === "failed";
  const canResendFailed = status === "sent" && failedCount > 0;

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        {canResendFailed && (
          <button
            type="button"
            onClick={() =>
              setConfirm({
                title: "Resend to failed recipients?",
                message: `This re-sends this email to the ${failedCount} recipient${
                  failedCount === 1 ? "" : "s"
                } whose delivery failed. Already-delivered recipients are untouched.`,
                confirmLabel: "Resend to failed",
                onConfirm: resendFailed,
              })
            }
            disabled={busy !== null || pending}
            aria-label="Resend to failed recipients"
            className="rounded-md p-1.5 text-bg/55 hover:bg-gold/10 hover:text-gold disabled:opacity-40"
          >
            <RotateCcw size={14} />
          </button>
        )}
        {canSend && (
          <button
            type="button"
            onClick={() =>
              setConfirm({
                title: "Send this email?",
                message:
                  "It will go to all subscribers (except unsubscribed). This cannot be undone.",
                confirmLabel: "Send now",
                onConfirm: send,
              })
            }
            disabled={busy !== null || pending}
            aria-label="Send now"
            className="rounded-md p-1.5 text-bg/55 hover:bg-gold/10 hover:text-gold disabled:opacity-40"
          >
            <Send size={14} />
          </button>
        )}
        <button
          type="button"
          onClick={() =>
            setConfirm({
              title: "Delete this email?",
              message: "This removes the saved draft. This cannot be undone.",
              confirmLabel: "Delete",
              tone: "danger",
              onConfirm: remove,
            })
          }
          disabled={busy !== null || pending}
          aria-label="Delete"
          className="rounded-md p-1.5 text-bg/55 hover:bg-red-400/10 hover:text-red-300 disabled:opacity-40"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <ConfirmModal state={confirm} onClose={() => setConfirm(null)} loading={busy !== null} />
      <InfoModal state={info} onClose={() => setInfo(null)} />
    </>
  );
}
