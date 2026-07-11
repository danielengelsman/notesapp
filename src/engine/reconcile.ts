/**
 * The trust core: compare the ledger we rebuilt against QuickBooks' own
 * exported Trial Balance, account by account, to the penny.
 *
 * The product never asks to be believed — this diff either shows all green
 * or points at exactly which account disagrees and by how much.
 */
import { Ledger } from "./types";
import { computeTrialBalance } from "./ledger";
import { normalizeDate } from "./txnreport";
import { TrialBalanceReport } from "./types";

export type MatchStatus = "match" | "mismatch" | "missing_in_rebuild" | "missing_in_qb";

export interface ReconRow {
  account: string;
  qbDebit: number | null;
  qbCredit: number | null;
  computedBalance: number; // signed cents, debit-positive
  deltaCents: number; // 0 when matched
  status: MatchStatus;
  note?: string;
}

export interface ReconReport {
  rows: ReconRow[];
  matched: number;
  mismatched: number;
  missingInRebuild: number;
  missingInQb: number;
  totalDeltaAbs: number;
  qbTotalDebit: number | null;
  qbTotalCredit: number | null;
  computedTotalDebit: number;
  computedTotalCredit: number;
  perfect: boolean;
  rangeStart: string;
  asOf: string;
}

/** Normalize QBD TB account labels: strip leading account numbers ("1000 ·"),
 *  middot separators, and indentation used for sub-accounts. */
export function normalizeAccountLabel(label: string): string {
  return label
    .replace(/^\s*\d{3,6}(\.\d+)?\s*[·•\-:]\s*/, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function reconcile(ledger: Ledger, qbTb: TrialBalanceReport, opts: { rangeStart: string; asOf: string }): ReconReport {
  const computed = computeTrialBalance(ledger, opts.rangeStart, opts.asOf);
  const compByName = new Map(computed.rows.map((r) => [normalizeAccountLabel(r.account), r]));
  const rows: ReconRow[] = [];
  const seen = new Set<string>();

  for (const qb of qbTb.rows) {
    const key = normalizeAccountLabel(qb.account);
    seen.add(key);
    const comp = compByName.get(key);
    const qbSigned = (qb.debit ?? 0) - (qb.credit ?? 0);
    if (!comp) {
      rows.push({
        account: qb.account,
        qbDebit: qb.debit,
        qbCredit: qb.credit,
        computedBalance: 0,
        deltaCents: qbSigned,
        status: qbSigned === 0 ? "match" : "missing_in_rebuild",
        note: qbSigned === 0 ? "zero balance on both sides" : "account has a QuickBooks balance but no rebuilt activity — usually an account-filtered transaction export",
      });
      continue;
    }
    const delta = comp.balance - qbSigned;
    rows.push({
      account: qb.account,
      qbDebit: qb.debit,
      qbCredit: qb.credit,
      computedBalance: comp.balance,
      deltaCents: delta,
      status: delta === 0 ? "match" : "mismatch",
      note: comp.computed ? "includes computed retained-earnings roll-forward" : undefined,
    });
  }
  for (const comp of computed.rows) {
    const key = normalizeAccountLabel(comp.account);
    if (seen.has(key)) continue;
    if (comp.balance === 0) continue;
    rows.push({
      account: comp.display,
      qbDebit: null,
      qbCredit: null,
      computedBalance: comp.balance,
      deltaCents: comp.balance,
      status: "missing_in_qb",
      note: comp.computed
        ? "computed retained earnings — QuickBooks folds this into its Retained Earnings row"
        : "rebuilt activity exists but the account is absent from the QuickBooks trial balance",
    });
  }

  const matched = rows.filter((r) => r.status === "match").length;
  const mismatched = rows.filter((r) => r.status === "mismatch").length;
  const missingInRebuild = rows.filter((r) => r.status === "missing_in_rebuild").length;
  const missingInQb = rows.filter((r) => r.status === "missing_in_qb").length;
  const totalDeltaAbs = rows.reduce((s, r) => s + Math.abs(r.deltaCents), 0);

  return {
    rows,
    matched,
    mismatched,
    missingInRebuild,
    missingInQb,
    totalDeltaAbs,
    qbTotalDebit: qbTb.totalDebit,
    qbTotalCredit: qbTb.totalCredit,
    computedTotalDebit: computed.totalDebit,
    computedTotalCredit: computed.totalCredit,
    perfect: mismatched === 0 && missingInRebuild === 0 && missingInQb === 0 && rows.length > 0,
    rangeStart: opts.rangeStart,
    asOf: opts.asOf,
  };
}

/** Best-effort ISO date from a TB title like "As of December 31, 2025". */
export function tbAsOfIso(tb: TrialBalanceReport): string | null {
  if (!tb.asOf) return null;
  const direct = normalizeDate(tb.asOf);
  if (direct) return direct;
  const m = tb.asOf.match(/([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/);
  if (!m) return null;
  const months = ["january","february","march","april","may","june","july","august","september","october","november","december"];
  const mi = months.indexOf(m[1].toLowerCase());
  if (mi === -1) return null;
  return `${m[3]}-${String(mi + 1).padStart(2, "0")}-${m[2].padStart(2, "0")}`;
}
