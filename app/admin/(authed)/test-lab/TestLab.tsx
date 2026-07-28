"use client";

import { useEffect, useState } from "react";
import { FlaskConical, Loader2, Trash2, Send, Plus, Users } from "lucide-react";
import { ConfirmModal, InfoModal, type ConfirmState } from "../_components/Modal";
import { SendProgressModal } from "../newsletters/new/SendProgressModal";

type Info = { title: string; message: string; ok?: boolean } | null;

export function TestLab() {
  const [count, setCount] = useState<number | null>(null);
  const [createN, setCreateN] = useState(1000);
  const [busy, setBusy] = useState<null | "create" | "send" | "clear">(null);
  const [info, setInfo] = useState<Info>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [progress, setProgress] = useState<{ id: string; total: number } | null>(null);

  const loadCount = async () => {
    try {
      const r = await fetch("/api/admin/test-users", { cache: "no-store" });
      const d = await r.json();
      if (r.ok) setCount(d.count);
    } catch {
      /* ignore */
    }
  };
  useEffect(() => {
    loadCount();
  }, []);

  const create = async () => {
    setBusy("create");
    try {
      const r = await fetch("/api/admin/test-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: createN }),
      });
      const d = await r.json();
      setInfo(
        r.ok
          ? { title: "Test users created", message: `Added ${d.created}. Total now ${d.total}.`, ok: true }
          : { title: "Failed", message: d.error || "Try again.", ok: false }
      );
      loadCount();
    } finally {
      setBusy(null);
    }
  };

  const send = async () => {
    setBusy("send");
    try {
      const r = await fetch("/api/admin/test-users/send", { method: "POST" });
      const d = await r.json();
      if (r.ok) setProgress({ id: d.id, total: d.queued });
      else setInfo({ title: "Send failed", message: d.error || "Try again.", ok: false });
    } finally {
      setBusy(null);
    }
  };

  const clear = () =>
    setConfirm({
      title: "Clear all test users?",
      message:
        "Deletes every test user plus their queue and delivery-log rows (all resend.dev addresses). This cannot be undone.",
      confirmLabel: "Clear all",
      tone: "danger",
      onConfirm: runClear,
    });
  const runClear = async () => {
    setBusy("clear");
    try {
      const r = await fetch("/api/admin/test-users", { method: "DELETE" });
      const d = await r.json();
      setConfirm(null);
      if (r.ok) {
        setInfo({
          title: "Test users cleared",
          message: `Deleted ${d.users} users, ${d.log} log rows, ${d.queue} queue rows.`,
          ok: true,
        });
        loadCount();
      } else {
        setInfo({ title: "Clear failed", message: d.error || "Try again.", ok: false });
      }
    } finally {
      setBusy(null);
    }
  };

  const has = (count ?? 0) > 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border border-bg/10 bg-bg/4 p-5">
        <div className="flex items-center gap-2 text-bg">
          <Users size={16} className="text-gold" />
          <span className="font-display text-lg">
            {count === null ? "…" : count.toLocaleString()} test user{count === 1 ? "" : "s"}
          </span>
        </div>
        <p className="mt-1 text-[13px] text-bg/50">
          Test users use Resend&apos;s <code className="text-bg/70">delivered@resend.dev</code> addresses —
          delivery is simulated instantly with zero effect on your sender reputation, and they&apos;re
          excluded from real campaigns.
        </p>
      </div>

      {/* Create */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-bg/10 bg-bg/4 p-4">
        <span className="text-sm text-bg/70">Create</span>
        <input
          type="number"
          min={1}
          max={5000}
          value={createN}
          onChange={(e) => setCreateN(Math.max(1, Math.min(5000, Number(e.target.value) || 1)))}
          className="w-24 rounded-lg border border-bg/15 bg-bg/4 px-2 py-1.5 text-center text-sm text-bg focus:border-gold/50 focus:outline-none"
        />
        <span className="text-sm text-bg/50">test users (max 5,000)</span>
        <button
          type="button"
          onClick={create}
          disabled={busy !== null}
          className="ml-auto inline-flex items-center gap-2 rounded-xl bg-gold px-3.5 py-2 text-sm font-medium text-ink transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
        >
          {busy === "create" ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Create
        </button>
      </div>

      {/* Send + Clear */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={send}
          disabled={busy !== null || !has}
          className="inline-flex items-center gap-2 rounded-xl border border-gold/40 bg-gold/10 px-4 py-2.5 text-sm font-medium text-gold hover:bg-gold/15 disabled:opacity-40"
        >
          {busy === "send" ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          Send a test blast to all {has ? count!.toLocaleString() : ""} test users
        </button>
        <button
          type="button"
          onClick={clear}
          disabled={busy !== null || !has}
          className="inline-flex items-center gap-2 rounded-xl border border-bg/15 px-4 py-2.5 text-sm text-bg/70 hover:border-red-400/40 hover:text-red-300 disabled:opacity-40"
        >
          {busy === "clear" ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          Clear all test users
        </button>
      </div>

      <p className="flex items-center gap-1.5 text-[12px] text-bg/40">
        <FlaskConical size={12} /> The blast runs through the real pipeline (queue → batches → worker),
        so it exercises exactly what a real send does. Watch it drain, then check the audit
        Recipients tab.
      </p>

      {progress && (
        <SendProgressModal
          newsletterId={progress.id}
          total={progress.total}
          batchSize={100}
          onClose={() => setProgress(null)}
        />
      )}
      <ConfirmModal state={confirm} onClose={() => setConfirm(null)} loading={busy === "clear"} />
      <InfoModal state={info} onClose={() => setInfo(null)} />
    </div>
  );
}
