/**
 * Parser for the QuickBooks Desktop "Trial Balance" report export.
 * Shape: title rows, then a header row containing Debit/Credit, then one
 * row per account, then a TOTAL row.
 */
import { parseDelimited, findColumn } from "./table";
import { parseAmount } from "./money";
import { TrialBalanceReport, ParseWarning } from "./types";

export interface TrialBalanceParse {
  report: TrialBalanceReport;
  warnings: ParseWarning[];
}

export function parseTrialBalance(text: string, fileLabel = "Trial Balance"): TrialBalanceParse {
  const rows = parseDelimited(text);
  const warnings: ParseWarning[] = [];

  let headerIdx = -1;
  for (let i = 0; i < Math.min(rows.length, 12); i++) {
    if (findColumn(rows[i], "debit") !== -1 && findColumn(rows[i], "credit") !== -1) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx === -1) {
    warnings.push({ severity: "error", where: fileLabel, message: "Could not find Debit/Credit header row in the trial balance export." });
    return { report: { rows: [], totalDebit: null, totalCredit: null }, warnings };
  }
  const header = rows[headerIdx];
  const debitCol = findColumn(header, "debit");
  const creditCol = findColumn(header, "credit");
  // account label is whatever non-empty cell precedes the debit column
  const asOf = extractAsOf(rows.slice(0, headerIdx));

  const out: TrialBalanceReport = { asOf, rows: [], totalDebit: null, totalCredit: null };
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.join("").trim() === "") continue;
    const label = row
      .slice(0, debitCol)
      .map((c) => c.trim())
      .filter(Boolean)
      .join(" ")
      .trim();
    const debit = parseAmount(row[debitCol]);
    const credit = parseAmount(row[creditCol]);
    if (/^total$/i.test(label) || /^total\b/i.test(label) && debit != null && credit != null && out.rows.length > 0 && i > rows.length - 4) {
      out.totalDebit = debit;
      out.totalCredit = credit;
      continue;
    }
    if (/^total$/i.test(label)) {
      out.totalDebit = debit;
      out.totalCredit = credit;
      continue;
    }
    if (!label) continue;
    if (debit == null && credit == null) continue;
    out.rows.push({ account: label, debit, credit });
  }
  // If the last parsed row is the grand total in disguise (label "TOTAL")
  if (out.totalDebit == null && out.rows.length) {
    const last = out.rows[out.rows.length - 1];
    if (/^total/i.test(last.account)) {
      out.totalDebit = last.debit;
      out.totalCredit = last.credit;
      out.rows.pop();
    }
  }
  if (out.rows.length === 0) {
    warnings.push({ severity: "error", where: fileLabel, message: "No account rows found in the trial balance export." });
  }
  return { report: out, warnings };
}

function extractAsOf(titleRows: string[][]): string | undefined {
  for (const row of titleRows) {
    const joined = row.join(" ");
    const m = joined.match(/as of\s+([A-Za-z]+\s+\d{1,2},?\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4})/i);
    if (m) return m[1];
  }
  return undefined;
}
