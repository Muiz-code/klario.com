"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  Shield,
  Trash2,
  Pencil,
  Plus,
  Loader2,
  Copy,
  Check,
  X,
} from "lucide-react";
import { ConfirmModal, InfoModal, type ConfirmState } from "../_components/Modal";

type Role = { id: string; name: string; capabilities: string[]; is_superadmin: boolean };
type Member = {
  id: string;
  email: string;
  role_id: string | null;
  status: string;
  must_change_password: boolean;
  invited_at: string;
  last_login_at: string | null;
  role: Role | null;
};
type Activity = {
  id: string;
  actor_email: string;
  action: string;
  target: string | null;
  created_at: string;
};
type Cap = { key: string; label: string };

const OPT = "bg-[#16181d] text-bg";

export function TeamView({
  members,
  roles,
  activity,
  capabilities,
}: {
  members: Member[];
  roles: Role[];
  activity: Activity[];
  capabilities: Cap[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"members" | "roles" | "activity">("members");
  const [info, setInfo] = useState<{ title: string; message: string; ok?: boolean } | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [deleting, setDeleting] = useState(false);

  // Invite
  const [inviteEmail, setInviteEmail] = useState("");
  // Superadmin is env-owner-only, never assignable to invited members.
  const assignableRoles = roles.filter((r) => !r.is_superadmin);
  const [inviteRole, setInviteRole] = useState(assignableRoles[0]?.id ?? "");
  const [inviting, setInviting] = useState(false);
  // Default the invite role to the first assignable one once roles exist.
  useEffect(() => {
    if (!inviteRole && assignableRoles[0]) setInviteRole(assignableRoles[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roles, inviteRole]);
  const [tempResult, setTempResult] = useState<{ email: string; password: string | null; emailed: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  // Role editor
  const [roleEditor, setRoleEditor] = useState<Role | "new" | null>(null);

  const invite = async () => {
    setInviting(true);
    try {
      const res = await fetch("/api/admin/team/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), roleId: inviteRole || null }),
      });
      const d = await res.json();
      if (!res.ok) {
        setInfo({ title: "Invite failed", message: d.error || "Try again.", ok: false });
      } else {
        setTempResult({ email: inviteEmail.trim(), password: d.tempPassword, emailed: d.emailed });
        setInviteEmail("");
        router.refresh();
      }
    } finally {
      setInviting(false);
    }
  };

  const setMemberRole = async (m: Member, roleId: string) => {
    await fetch(`/api/admin/team/members/${m.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleId: roleId || null }),
    });
    router.refresh();
  };
  const toggleMemberStatus = async (m: Member) => {
    await fetch(`/api/admin/team/members/${m.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: m.status === "active" ? "disabled" : "active" }),
    });
    router.refresh();
  };
  const resendInvite = async (m: Member) => {
    const res = await fetch(`/api/admin/team/members/${m.id}/resend`, { method: "POST" });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      setInfo({ title: "Resend failed", message: d.error || "Try again.", ok: false });
    } else {
      setTempResult({ email: m.email, password: d.tempPassword, emailed: d.emailed });
      router.refresh();
    }
  };
  const removeMember = (m: Member) =>
    setConfirm({
      title: "Remove this member?",
      message: `${m.email} will lose all access. This cannot be undone.`,
      confirmLabel: "Remove",
      tone: "danger",
      onConfirm: async () => {
        setDeleting(true);
        await fetch(`/api/admin/team/members/${m.id}`, { method: "DELETE" });
        setDeleting(false);
        setConfirm(null);
        router.refresh();
      },
    });

  const deleteRole = (r: Role) =>
    setConfirm({
      title: "Delete this role?",
      message: `"${r.name}" will be removed. Members with it will have no role until reassigned.`,
      confirmLabel: "Delete",
      tone: "danger",
      onConfirm: async () => {
        setDeleting(true);
        await fetch(`/api/admin/team/roles/${r.id}`, { method: "DELETE" });
        setDeleting(false);
        setConfirm(null);
        router.refresh();
      },
    });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl text-bg">Team &amp; roles</h1>
        <p className="mt-1 text-sm text-bg/55">
          Invite people, choose what each role can see, and review who did what.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {([
          ["members", `Members (${members.length})`],
          ["roles", `Roles (${roles.length})`],
          ["activity", "Activity"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={
              "rounded-xl px-3.5 py-2 text-sm transition-colors " +
              (tab === key
                ? "bg-gold text-ink font-medium"
                : "border border-bg/12 text-bg/70 hover:text-bg")
            }
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "members" && (
        <>
      {/* Invite */}
      <section className="flex flex-col gap-3 rounded-2xl border border-bg/10 bg-bg/4 p-5">
        <h2 className="flex items-center gap-2 font-display text-lg text-bg">
          <UserPlus size={17} className="text-gold" /> Invite a member
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="name@email.com"
            className="min-w-56 flex-1 rounded-xl border border-bg/15 bg-bg/4 px-3 py-2.5 text-sm text-bg placeholder:text-bg/35 focus:border-gold/50 focus:outline-none"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="rounded-xl border border-bg/15 bg-bg/4 px-3 py-2.5 text-sm text-bg scheme-dark focus:border-gold/50 focus:outline-none"
          >
            {assignableRoles.length === 0 && <option value="">No roles yet</option>}
            {assignableRoles.map((r) => (
              <option key={r.id} value={r.id} className={OPT}>
                {r.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setRoleEditor("new")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-bg/15 px-3 py-2.5 text-sm text-bg/75 hover:border-gold/40 hover:text-bg"
          >
            <Plus size={14} /> New role
          </button>
          <button
            type="button"
            onClick={invite}
            disabled={inviting || !inviteEmail.trim() || assignableRoles.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm font-medium text-ink disabled:opacity-40"
          >
            {inviting ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
            Send invite
          </button>
        </div>
        <p className="text-[12px] text-bg/45">
          They get a temporary password by email and must set their own on first sign-in.
        </p>

        {tempResult && (
          <div className="mt-1 flex flex-col gap-2 rounded-xl border border-gold/25 bg-gold/5 p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[13px] text-bg/80">
                Invited <strong className="text-bg">{tempResult.email}</strong>.{" "}
                {tempResult.password === null
                  ? "They already had a Klario account — they sign in with their existing password."
                  : tempResult.emailed
                    ? "The invite email with their temporary password was sent."
                    : "Email didn't send — share the temp password below."}
              </p>
              <button type="button" onClick={() => setTempResult(null)} className="shrink-0 rounded-lg p-1 text-bg/45 hover:text-bg">
                <X size={14} />
              </button>
            </div>
            {tempResult.password !== null && (
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-bg/8 px-3 py-2 font-mono text-[13px] text-gold">
                  {tempResult.password}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(tempResult.password ?? "");
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-bg/15 px-3 py-2 text-[12px] text-bg/70 hover:text-bg"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Copied" : "Copy"}
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Members */}
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg text-bg">Members ({members.length})</h2>
        {members.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-bg/12 bg-bg/3 px-5 py-8 text-center text-[13px] text-bg/45">
            No invited members yet. Owners (from ADMIN_EMAILS) always have full access.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-bg/10">
            <table className="w-full min-w-[640px] text-left text-[13px]">
              <thead className="border-b border-bg/10 bg-bg/4 text-[11px] uppercase tracking-widest text-bg/45">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Member</th>
                  <th className="px-3 py-2.5 font-medium">Role</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id} className="border-b border-bg/6 last:border-0">
                    <td className="px-4 py-2.5">
                      <p className="text-bg/85">{m.email}</p>
                      <p className="text-[11px] text-bg/40">
                        {m.must_change_password ? "Awaiting first sign-in" : m.last_login_at ? "Active" : "Set up"}
                      </p>
                    </td>
                    <td className="px-3 py-2.5">
                      <select
                        value={m.role_id ?? ""}
                        onChange={(e) => setMemberRole(m, e.target.value)}
                        className="rounded-lg border border-bg/15 bg-bg/4 px-2 py-1.5 text-[12px] text-bg scheme-dark focus:border-gold/50 focus:outline-none"
                      >
                        <option value="" className={OPT}>No role</option>
                        {assignableRoles.map((r) => (
                          <option key={r.id} value={r.id} className={OPT}>{r.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={
                          "rounded-full px-2 py-0.5 text-[11px] " +
                          (m.status === "active" ? "bg-emerald-400/15 text-emerald-300" : "bg-bg/10 text-bg/55")
                        }
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button type="button" onClick={() => resendInvite(m)} className="mr-2 text-[12px] text-gold/80 hover:text-gold" title="Reset password & re-send the invite email">
                        {m.must_change_password ? "Resend invite" : "Reset access"}
                      </button>
                      <button type="button" onClick={() => toggleMemberStatus(m)} className="mr-2 text-[12px] text-bg/60 hover:text-bg">
                        {m.status === "active" ? "Disable" : "Enable"}
                      </button>
                      <button type="button" onClick={() => removeMember(m)} aria-label="Remove" className="rounded-md p-1 text-bg/40 hover:bg-red-400/10 hover:text-red-300">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
        </>
      )}

      {tab === "roles" && (
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg text-bg">Roles ({roles.length})</h2>
          <button
            type="button"
            onClick={() => setRoleEditor("new")}
            className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3.5 py-1.5 text-[12px] font-medium text-ink"
          >
            <Plus size={14} /> New role
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((r) => (
            <div key={r.id} className="flex flex-col gap-2 rounded-2xl border border-bg/10 bg-bg/4 p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="flex items-center gap-1.5 font-medium text-bg">
                  {r.is_superadmin && <Shield size={13} className="text-gold" />}
                  {r.name}
                </p>
                <div className="flex shrink-0 items-center gap-0.5">
                  <button type="button" onClick={() => setRoleEditor(r)} aria-label="Edit" className="rounded-md p-1 text-bg/40 hover:bg-bg/10 hover:text-bg">
                    <Pencil size={13} />
                  </button>
                  <button type="button" onClick={() => deleteRole(r)} aria-label="Delete" className="rounded-md p-1 text-bg/40 hover:bg-red-400/10 hover:text-red-300">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-[12px] text-bg/50">
                {r.is_superadmin
                  ? "Full access to everything"
                  : r.capabilities.length
                    ? `${r.capabilities.length} section${r.capabilities.length === 1 ? "" : "s"}`
                    : "No access yet"}
              </p>
            </div>
          ))}
        </div>
      </section>
      )}

      {tab === "activity" && (
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg text-bg">Recent activity</h2>
        {activity.length === 0 ? (
          <p className="text-[13px] text-bg/45">Nothing yet.</p>
        ) : (
          <div className="rounded-2xl border border-bg/10 h-[65vh]">
            <ul className="max-h-[65vh] overflow-y-auto">
              {activity.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 border-b border-bg/6 px-4 py-2 text-[12.5px] last:border-0">
                  <span className="text-bg/80">
                    <span className="text-bg/50">{a.actor_email}</span>{" "}
                    {a.action.replace(/_/g, " ")}
                    {a.target ? <span className="text-bg/50"> · {a.target}</span> : ""}
                  </span>
                  <span suppressHydrationWarning className="shrink-0 text-[11px] text-bg/40">
                    {new Date(a.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
      )}

      {roleEditor && (
        <RoleEditor
          role={roleEditor === "new" ? null : roleEditor}
          capabilities={capabilities}
          onClose={() => setRoleEditor(null)}
          onSaved={() => {
            setRoleEditor(null);
            router.refresh();
          }}
        />
      )}
      <ConfirmModal state={confirm} onClose={() => setConfirm(null)} loading={deleting} />
      <InfoModal state={info} onClose={() => setInfo(null)} />
    </div>
  );
}

function RoleEditor({
  role,
  capabilities,
  onClose,
  onSaved,
}: {
  role: Role | null;
  capabilities: Cap[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(role?.name ?? "");
  const [caps, setCaps] = useState<Set<string>>(new Set(role?.capabilities ?? []));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (k: string) =>
    setCaps((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      const url = role ? `/api/admin/team/roles/${role.id}` : "/api/admin/team/roles";
      const res = await fetch(url, {
        method: role ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, capabilities: [...caps] }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) setError(d.error || "Could not save.");
      else onSaved();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-ink/65 backdrop-blur-sm" aria-hidden />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-[#0d0e12] shadow-2xl">
        <header className="flex items-center justify-between border-b border-bg/10 px-6 py-4">
          <h2 className="font-display text-lg text-bg">{role ? "Edit role" : "New role"}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-bg/55 hover:text-bg">
            <X size={18} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-bg/45">Role name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Newsletter manager"
              className="w-full rounded-lg border border-bg/15 bg-bg/4 px-3 py-2 text-sm text-bg placeholder:text-bg/35 focus:border-gold/50 focus:outline-none"
            />
          </label>

          <div className="mt-4 flex flex-col gap-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-bg/45">Can access</p>
            {capabilities.map((c) => (
              <label key={c.key} className="flex cursor-pointer items-center gap-2 rounded-lg border border-bg/10 bg-bg/3 px-3 py-2 text-[13px] text-bg/75">
                <input type="checkbox" checked={caps.has(c.key)} onChange={() => toggle(c.key)} className="accent-gold" />
                {c.label}
              </label>
            ))}
          </div>

          {error && (
            <p className="mt-4 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-[12px] text-red-200">{error}</p>
          )}
        </div>
        <footer className="flex items-center justify-end gap-2 border-t border-bg/10 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-full border border-bg/15 px-4 py-2 text-[13px] text-bg/70 hover:text-bg">Cancel</button>
          <button type="button" onClick={save} disabled={busy || !name.trim()} className="rounded-full bg-gold px-4 py-2 text-[13px] font-medium text-ink disabled:opacity-40">
            {busy ? "Saving…" : role ? "Save changes" : "Create role"}
          </button>
        </footer>
      </aside>
    </>
  );
}
