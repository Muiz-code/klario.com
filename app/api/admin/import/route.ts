import { NextResponse } from "next/server";
import { csvToContacts } from "@/lib/csv";
import { importSignups } from "@/lib/db/signups";
import { createAuditEvent } from "@/lib/db/audit";
import { getAdminEmail } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Import a contacts CSV into beta_signups. Accepts either a multipart upload
 * (field name "file") or a JSON body { csv: string }. New emails are added with
 * status 'pending' and source 'import'; existing emails are left untouched.
 */
export async function POST(req: Request) {
  let text: string | null = null;

  const contentType = req.headers.get("content-type") || "";
  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      if (file && typeof file !== "string") {
        if (file.size > MAX_BYTES) {
          return NextResponse.json({ error: "File too large (max 5 MB)." }, { status: 413 });
        }
        text = await file.text();
      }
    } else {
      const body = (await req.json()) as { csv?: unknown };
      if (typeof body.csv === "string") text = body.csv;
    }
  } catch {
    return NextResponse.json({ error: "Could not read upload." }, { status: 400 });
  }

  if (!text || !text.trim()) {
    return NextResponse.json({ error: "No CSV content found." }, { status: 400 });
  }

  const { contacts, invalid } = csvToContacts(text);
  if (contacts.length === 0) {
    return NextResponse.json(
      { error: "No valid email rows found.", invalid },
      { status: 400 }
    );
  }

  const { added, skipped, fileDuplicates, existingDuplicates } =
    await importSignups(
      contacts.map((c) => ({
        email: c.email,
        first_name: c.firstName ?? null,
        last_name: c.lastName ?? null,
        phone: c.phone ?? null,
      })),
      "import"
    );

  await createAuditEvent({
    action: "import",
    actor: await getAdminEmail(),
    subject: `Imported ${added} contact${added === 1 ? "" : "s"}`,
    template: "CSV import",
    recipientCount: contacts.length,
    meta: {
      parsed: contacts.length,
      added,
      skipped,
      invalid,
      fileDuplicates,
      existingDuplicates,
    },
  });

  return NextResponse.json({
    ok: true,
    parsed: contacts.length,
    added,
    skipped,
    invalid,
    fileDuplicates,
    existingDuplicates,
  });
}
