/**
 * Tolerant delimited-text parsing for the files QuickBooks Desktop actually
 * produces: comma CSV (report exports), tab-delimited (IIF and some report
 * exports), quoted fields, CRLF/CR/LF, stray BOM, Windows-1252 leftovers.
 */

export type Row = string[];

/** Sniff the delimiter from the first non-empty lines: tab wins if present. */
export function sniffDelimiter(text: string): "\t" | "," {
  const head = text.slice(0, 4000);
  const tabCount = (head.match(/\t/g) || []).length;
  const commaCount = (head.match(/,/g) || []).length;
  return tabCount > 0 && tabCount >= commaCount / 4 ? "\t" : ",";
}

export function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/** RFC-4180-ish parser that also tolerates QuickBooks' quirks
 *  (unescaped quotes mid-field, fields with embedded newlines). */
export function parseDelimited(text: string, delimiter?: "\t" | ","): Row[] {
  const src = stripBom(text.replace(/\r\n/g, "\n").replace(/\r/g, "\n"));
  const delim = delimiter ?? sniffDelimiter(src);
  const rows: Row[] = [];
  let field = "";
  let row: Row = [];
  let inQuotes = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"' && field === "") {
      inQuotes = true;
    } else if (ch === delim) {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  // drop fully-empty trailing rows
  while (rows.length && rows[rows.length - 1].every((c) => c.trim() === "")) rows.pop();
  return rows;
}

/** Case-insensitive header lookup that survives QB renaming columns slightly. */
export function findColumn(header: Row, ...names: string[]): number {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z#]/g, "");
  const H = header.map(norm);
  for (const n of names) {
    const idx = H.indexOf(norm(n));
    if (idx !== -1) return idx;
  }
  return -1;
}
