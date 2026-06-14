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
};

/**
 * Turn raw CSV text into contacts. Detects a header row by looking for an
 * "email" column; if absent, assumes columns are [email, first_name,
 * last_name]. Returns valid contacts and a count of skipped/invalid rows.
 */
export function csvToContacts(text: string): {
  contacts: ParsedContact[];
  invalid: number;
} {
  const rows = parseCsv(text);
  if (rows.length === 0) return { contacts: [], invalid: 0 };

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Detect header.
  let emailIdx = 0;
  let firstIdx = 1;
  let lastIdx = 2;
  let start = 0;

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const headerHasEmail = header.some((h) => h.includes("email"));
  if (headerHasEmail) {
    start = 1;
    emailIdx = header.findIndex((h) => h.includes("email"));
    firstIdx = header.findIndex(
      (h) => h.includes("first") || h === "name" || h.includes("full")
    );
    lastIdx = header.findIndex((h) => h.includes("last") || h.includes("surname"));
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

    // If the "first" column was actually a full name, split it.
    if (firstName && !lastName && firstName.includes(" ")) {
      const parts = firstName.split(/\s+/);
      firstName = parts[0];
      lastName = parts.slice(1).join(" ");
    }

    contacts.push({
      email,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
    });
  }

  return { contacts, invalid };
}
