"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, Trash2 } from "lucide-react";
import { ConfirmModal, InfoModal, type ConfirmState } from "../_components/Modal";

export function NewsletterRowActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<"send" | "delete" | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [info, setInfo] = useState<{ title: string; message: string; ok?: boolean } | null>(null);

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

  return (
    <>
      <div className="flex items-center justify-end gap-1">
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
