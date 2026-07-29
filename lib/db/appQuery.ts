import type { SupabaseClient } from "@supabase/supabase-js";

type Row = Record<string, unknown>;
type Apply = (q: any) => any; // eslint-disable-line @typescript-eslint/no-explicit-any

const PAGE = 1000; // PostgREST's default max-rows
const MAX_PAGES = 25; // 25k rows per table is far beyond any real anchor cohort

/**
 * Read every matching row from an app-DB table, paging past PostgREST's 1000-row
 * ceiling (a plain `.select()` silently truncates, which would under-count a
 * heavy user's transactions). Fail-soft: an error or a missing table yields the
 * rows collected so far rather than throwing.
 */
export async function selectAllRows(
  db: SupabaseClient,
  table: string,
  columns: string,
  apply?: Apply
): Promise<Row[]> {
  const out: Row[] = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const from = page * PAGE;
    let q = db.from(table).select(columns).range(from, from + PAGE - 1);
    if (apply) q = apply(q);
    const { data, error } = await q;
    if (error) {
      console.error(`[appdb] ${table} read failed:`, error.message);
      return out;
    }
    const rows = (data ?? []) as unknown as Row[];
    out.push(...rows);
    if (rows.length < PAGE) return out;
  }
  console.warn(`[appdb] ${table} hit the ${MAX_PAGES * PAGE}-row read cap`);
  return out;
}

/** Split ids into chunks so `.in()` lists stay a sane length. */
export function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
