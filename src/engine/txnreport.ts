/**
 * Parser for the QuickBooks Desktop "Custom Transaction Detail Report"
 * export (CSV or tab-delimited). This report is the accountant-standard way
 * to get every posting line out of QBD: one row per split line, with
 * Trans # grouping rows into transactions.
 *
 * Real exports look like:
 *
 *   (title rows: company name, report title, date range)
 *   ,Trans #,Type,Date,Num,Name,Memo,Account,Clr,Split,Debit,Credit,Balance
 *   ,1234,Invoice,01/15/2024,1001,Acme Corp,consulting,Accounts Receivable,,-SPLIT-,"1,500.00",,
 *   ,1234,Invoice,01/15/2024,1001,Acme Corp,consulting,Consulting Income,,Accounts Receivable,,"1,500.00",
 *   ...
 *   ,,,,,,,,,,Total,"9,999.99","9,999.99"
 *
 * The parser: finds the header row anywhere in the first ~10 rows, skips
 * blank/total/subtotal rows, groups by Trans # (falling back to
 * Type+Date+Num adjacency when the column is missing), and normalizes
 * dates and amounts.
 */
import { parseDelimited, findColumn, Row } from "./table";
import { parseAmount } from "./money";
import { Transaction, TxnLine, ParseWarning } from "./types";

export interface TxnReportResult {
  transactions: Transaction[];
  warnings: ParseWarning[];
  skippedRows: number;
  dateRange: { min: string; max: string } | null;
}

/** Normalize QBD date strings (MM/DD/YYYY, MM/DD/YY, YYYY-MM-DD) to ISO. */
export function normalizeDate(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  let m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (m) {
    let [, mo, d, y] = m;
    if (y.length === 2) y = Number(y) > 40 ? `19${y}` : `20${y}`;
    return validOrNull(Number(y), Number(mo), Number(d));
  }
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return validOrNull(Number(m[1]), Number(m[2]), Number(m[3]));
  return null;
}

/** Reject calendar-impossible dates (e.g. 02/30/2024, 13/01/2024) rather than
 *  emitting them — a bogus date is a corrupt transaction, not a parseable one. */
function validOrNull(y: number, mo: number, d: number): string | null {
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null;
  return `${String(y).padStart(4, "0")}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

const TOTAL_ROW = /^\s*(total|subtotal|grand total)/i;

export function parseTxnReport(text: string, fileLabel = "Transaction report"): TxnReportResult {
  const rows = parseDelimited(text);
  const warnings: ParseWarning[] = [];
  const warn = (severity: ParseWarning["severity"], line: number, message: string) =>
    warnings.push({ severity, where: fileLabel, line: line + 1, message });

  // locate the header row: must contain Date + Account + (Debit|Credit|Amount)
  let headerIdx = -1;
  for (let i = 0; i < Math.min(rows.length, 12); i++) {
    const h = rows[i];
    if (
      findColumn(h, "date") !== -1 &&
      findColumn(h, "account") !== -1 &&
      (findColumn(h, "debit") !== -1 || findColumn(h, "credit") !== -1 || findColumn(h, "amount") !== -1)
    ) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx === -1) {
    warn("error", 0, "Could not find the report's column header row (need Date, Account, and Debit/Credit or Amount columns). Re-export the report with those columns visible.");
    return { transactions: [], warnings, skippedRows: rows.length, dateRange: null };
  }
  const header = rows[headerIdx];
  const col = {
    transNo: findColumn(header, "trans #", "trans#", "transno", "trans no"),
    type: findColumn(header, "type", "transaction type"),
    date: findColumn(header, "date"),
    num: findColumn(header, "num", "number"),
    name: findColumn(header, "name"),
    memo: findColumn(header, "memo", "memo/description", "description"),
    account: findColumn(header, "account", "account name"),
    split: findColumn(header, "split"),
    debit: findColumn(header, "debit"),
    credit: findColumn(header, "credit"),
    amount: findColumn(header, "amount"),
  };
  if (col.transNo === -1) {
    warn("warn", headerIdx, 'No "Trans #" column found — transactions will be grouped by Type+Date+Num adjacency, which is less precise. Re-export with Trans # for exact grouping.');
  }

  interface RawLine {
    row: Row;
    line: number;
    transNo: string;
    type: string;
    date: string;
    num: string;
    name: string;
    memo: string;
    account: string;
    debit: number | null;
    credit: number | null;
  }
  const lines: RawLine[] = [];
  let skippedRows = 0;

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    const cell = (idx: number) => (idx >= 0 && idx < row.length ? row[idx].trim() : "");
    const joined = row.join("").trim();
    if (joined === "") continue;
    // total / subtotal / section-heading rows
    if (TOTAL_ROW.test(cell(col.type)) || TOTAL_ROW.test(row[0] || "") || TOTAL_ROW.test(cell(col.name)) || TOTAL_ROW.test(cell(col.account))) {
      skippedRows++;
      continue;
    }
    const dateIso = normalizeDate(cell(col.date));
    const account = cell(col.account);
    if (!dateIso || !account) {
      // section headers ("Jan 24"), blank grouping rows, malformed lines
      skippedRows++;
      if (joined.length > 0 && account && !dateIso) {
        warn("info", i, `Row skipped (unparseable date "${cell(col.date)}")`);
      }
      continue;
    }
    let debit = col.debit >= 0 ? parseAmount(cell(col.debit)) : null;
    let credit = col.credit >= 0 ? parseAmount(cell(col.credit)) : null;
    if (debit == null && credit == null && col.amount >= 0) {
      const amt = parseAmount(cell(col.amount));
      if (amt != null) {
        if (amt >= 0) debit = amt;
        else credit = -amt;
      }
    }
    if (debit == null && credit == null) {
      skippedRows++;
      warn("info", i, "Row skipped (no Debit/Credit/Amount value)");
      continue;
    }
    lines.push({
      row,
      line: i,
      transNo: cell(col.transNo),
      type: cell(col.type) || "General Journal",
      date: dateIso,
      num: cell(col.num),
      name: cell(col.name),
      memo: cell(col.memo),
      account,
      debit,
      credit,
    });
  }

  // group into transactions
  const txns: Transaction[] = [];
  const byKey = new Map<string, Transaction>();
  let synth = 0;
  let prevKey = "";
  for (const l of lines) {
    let key: string;
    if (l.transNo) {
      key = `t:${l.transNo}`;
    } else {
      // adjacency fallback: same Type+Date+Num as previous row continues a txn
      const adjacent = `a:${l.type}|${l.date}|${l.num}`;
      key = adjacent === prevKey ? adjacent : (prevKey = adjacent, adjacent);
      // note: distinct same-day same-num same-type txns will merge; recon flags it
    }
    prevKey = l.transNo ? prevKey : key;
    let t = byKey.get(key);
    if (!t) {
      t = {
        id: l.transNo || `synth-${++synth}`,
        type: l.type,
        date: l.date,
        num: l.num || undefined,
        name: l.name || undefined,
        memo: l.memo || undefined,
        lines: [],
      };
      byKey.set(key, t);
      txns.push(t);
    }
    const tl: TxnLine = {
      account: l.account,
      debit: l.debit ?? 0,
      credit: l.credit ?? 0,
      memo: l.memo || undefined,
      name: l.name || undefined,
    };
    t.lines.push(tl);
  }

  // per-transaction balance check
  let unbalanced = 0;
  for (const t of txns) {
    const d = t.lines.reduce((s, l) => s + l.debit, 0);
    const c = t.lines.reduce((s, l) => s + l.credit, 0);
    if (d !== c) {
      unbalanced++;
      warnings.push({
        severity: "warn",
        where: fileLabel,
        message: `Transaction ${t.type} ${t.num ?? t.id} on ${t.date} has debits ${d} ≠ credits ${c} (cents). The report may be filtered to some accounts only — export with "All accounts" and no filters.`,
      });
    }
  }
  if (unbalanced > 0) {
    warnings.push({
      severity: unbalanced > txns.length / 10 ? "error" : "warn",
      where: fileLabel,
      message: `${unbalanced} of ${txns.length} transactions do not balance internally. This usually means the report was exported with account filters on.`,
    });
  }

  let dateRange: TxnReportResult["dateRange"] = null;
  if (txns.length) {
    let min = txns[0].date, max = txns[0].date;
    for (const t of txns) {
      if (t.date < min) min = t.date;
      if (t.date > max) max = t.date;
    }
    dateRange = { min, max };
  }
  return { transactions: txns, warnings, skippedRows, dateRange };
}
