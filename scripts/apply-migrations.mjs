/**
 * Apply DB migrations to the marketing Supabase from the terminal, via the
 * Supabase Management API (no psql / CLI needed).
 *
 * Usage:
 *   1. Create a Personal Access Token: https://supabase.com/dashboard/account/tokens
 *   2. Set it, then run this script:
 *        export SUPABASE_ACCESS_TOKEN=sbp_xxx        # (bash)     or
 *        $env:SUPABASE_ACCESS_TOKEN="sbp_xxx"        # (PowerShell)
 *        node scripts/apply-migrations.mjs
 *
 * It runs supabase/apply_all.sql, which is idempotent (create ... if not exists),
 * so it's safe to run repeatedly and brings the DB up to migration 0023.
 */
import { readFileSync } from "node:fs";

// Load .env.local so NEXT_PUBLIC_SUPABASE_URL (and optionally the token) are available.
const env = { ...process.env };
try {
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {
  /* no .env.local — rely on process env */
}

const token = env.SUPABASE_ACCESS_TOKEN;
if (!token) {
  console.error(
    "Missing SUPABASE_ACCESS_TOKEN.\n" +
      "Create one at https://supabase.com/dashboard/account/tokens, then set it and re-run."
  );
  process.exit(1);
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const ref = url && new URL(url).hostname.split(".")[0];
if (!ref) {
  console.error("Could not derive the project ref from NEXT_PUBLIC_SUPABASE_URL.");
  process.exit(1);
}

const sql = readFileSync("supabase/apply_all.sql", "utf8");
console.log(`Applying supabase/apply_all.sql to project ${ref} …`);

const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ query: sql }),
});

const text = await res.text();
if (!res.ok) {
  console.error(`\n❌ Failed (${res.status}):\n${text}`);
  process.exit(1);
}
console.log("\n✅ Migrations applied successfully.");
if (text.trim() && text.trim() !== "[]") console.log(text);
