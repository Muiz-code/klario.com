"use client";

import { useEffect } from "react";
import { X, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-2xl border border-bg/12 bg-[#0d0e12] p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-lg text-bg">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-bg/50 hover:text-bg"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-3 text-sm leading-relaxed text-bg/75">{children}</div>
        {footer && (
          <div className="mt-6 flex items-center justify-end gap-2">{footer}</div>
        )}
      </div>
    </div>
  );
}

export type ConfirmState = {
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  tone?: "default" | "danger";
  onConfirm: () => void | Promise<void>;
} | null;

/** A confirm dialog driven by a single state object. */
export function ConfirmModal({
  state,
  onClose,
  loading,
}: {
  state: ConfirmState;
  onClose: () => void;
  loading?: boolean;
}) {
  const danger = state?.tone === "danger";
  return (
    <Modal
      open={Boolean(state)}
      title={state?.title ?? ""}
      onClose={loading ? () => {} : onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-bg/15 px-4 py-2 text-sm text-bg/80 hover:border-bg/30 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => state?.onConfirm()}
            disabled={loading}
            className={
              "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-60 " +
              (danger
                ? "bg-red-500/90 text-white hover:bg-red-500"
                : "bg-gold text-ink hover:scale-[1.02]")
            }
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {state?.confirmLabel ?? "Confirm"}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        {danger && (
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-300" />
        )}
        <div>{state?.message}</div>
      </div>
    </Modal>
  );
}

/** A plain result/info dialog. */
export function InfoModal({
  state,
  onClose,
}: {
  state: { title: string; message: React.ReactNode; ok?: boolean } | null;
  onClose: () => void;
}) {
  return (
    <Modal
      open={Boolean(state)}
      title={state?.title ?? ""}
      onClose={onClose}
      footer={
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl bg-gold px-4 py-2 text-sm font-medium text-ink hover:scale-[1.02]"
        >
          Done
        </button>
      }
    >
      <div className="flex items-start gap-3">
        {state?.ok !== undefined &&
          (state.ok ? (
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-300" />
          ) : (
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-300" />
          ))}
        <div>{state?.message}</div>
      </div>
    </Modal>
  );
}
