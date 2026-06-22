/**
 * Minimal but correct CSV parser. Handles quoted fields, escaped quotes ("")
 * inside quotes, commas and newlines inside quotes, and both \n and \r\n line
 * endings. Good enough for contact-list uploads (email, name columns).
 */
export function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  // Strip a UTF-8 BOM if present.
  const text = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }

    if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c === "\r") {
      // handled by the \n branch; ignore lone \r
    } else {
      field += c;
    }
  }

  // Flush the trailing field/row if the file did not end with a newline.
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

export type ParsedContact = {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Find the column that holds emails. Prefers a header named like "email", but
 * falls back to scanning the data and picking the column with the most valid
 * emails - so arbitrary exports (e.g. a Google Form where the address sits under
 * "Username") still work without renaming headers.
 */
function findEmailColumn(rows: string[][], header: string[]): number {
  const alias = header.findIndex(
    (h) => h.includes("email") || h.includes("e-mail") || h === "mail"
  );
  if (alias >= 0) return alias;

  const ncols = rows.reduce((m, r) => Math.max(m, r.length), 0);
  const sample = rows.slice(0, 60);
  let bestIdx = -1;
  let bestCount = 0;
  for (let c = 0; c < ncols; c++) {
    let count = 0;
    for (const r of sample) {
      if (EMAIL_RE.test((r[c] || "").trim().toLowerCase())) count++;
    }
    if (count > bestCount) {
      bestCount = count;
      bestIdx = c;
    }
  }
  return bestCount > 0 ? bestIdx : -1;
}

/**
 * Turn raw CSV text into contacts. Auto-detects the email column (by header or
 * content), and best-effort detects name and phone columns from the header.
 * Returns valid contacts and a count of skipped/invalid rows.
 */
export function csvToContacts(text: string): {
  contacts: ParsedContact[];
  invalid: number;
} {
  const rows = parseCsv(text);
  if (rows.length === 0) return { contacts: [], invalid: 0 };

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const emailIdx = findEmailColumn(rows, header);
  if (emailIdx < 0) return { contacts: [], invalid: rows.length };

  // Row 0 is a header unless it already holds an email in the email column.
  const hasHeader = !EMAIL_RE.test((rows[0][emailIdx] || "").trim().toLowerCase());
  const start = hasHeader ? 1 : 0;

  // Best-effort name/phone columns (only meaningful when there's a header).
  let firstIdx = -1;
  let lastIdx = -1;
  let nameIdx = -1;
  let phoneIdx = -1;
  if (hasHeader) {
    firstIdx = header.findIndex(
      (h, i) => i !== emailIdx && (h.includes("first") || h.includes("firstname"))
    );
    lastIdx = header.findIndex(
      (h, i) =>
        i !== emailIdx && (h.includes("last") || h.includes("surname"))
    );
    nameIdx = header.findIndex(
      (h, i) =>
        i !== emailIdx &&
        i !== firstIdx &&
        i !== lastIdx &&
        h.includes("name") &&
        !h.includes("user")
    );
    phoneIdx = header.findIndex(
      (h, i) =>
        i !== emailIdx &&
        (h.includes("phone") ||
          h.includes("whatsapp") ||
          h.includes("mobile") ||
          h === "tel")
    );
  }

  const contacts: ParsedContact[] = [];
  let invalid = 0;

  for (let i = start; i < rows.length; i++) {
    const cells = rows[i];
    const email = (cells[emailIdx] || "").trim().toLowerCase();
    if (!EMAIL_RE.test(email) || email.length > 254) {
      invalid++;
      continue;
    }

    let firstName = firstIdx >= 0 ? (cells[firstIdx] || "").trim() : "";
    let lastName = lastIdx >= 0 ? (cells[lastIdx] || "").trim() : "";

    // Full-name column ("What is your name?") → split into first/last.
    if (!firstName && nameIdx >= 0) {
      const full = (cells[nameIdx] || "").trim();
      if (full.includes(" ")) {
        const parts = full.split(/\s+/);
        firstName = parts[0];
        lastName = lastName || parts.slice(1).join(" ");
      } else {
        firstName = full;
      }
    }
    // A single "first" column that's actually a full name.
    if (firstName && !lastName && firstName.includes(" ")) {
      const parts = firstName.split(/\s+/);
      firstName = parts[0];
      lastName = parts.slice(1).join(" ");
    }

    const phone = phoneIdx >= 0 ? (cells[phoneIdx] || "").trim() : "";

    contacts.push({
      email,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      phone: phone || undefined,
    });
  }

  return { contacts, invalid };
}
