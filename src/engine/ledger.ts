/**
 * Assembles parsed pieces into a Ledger and computes balances.
 * Sign convention: balance = Σdebit − Σcredit (assets/expenses naturally
 * positive; liabilities/equity/income naturally negative).
 */
import { Ledger, Transaction, Account, ParseWarning, classifyAccountType, isBalanceSheet } from "./types";
import { IifResult } from "./iif";

export function buildLedger(iifs: IifResult[], transactions: Transaction[]): Ledger {
  const accounts = new Map<string, Account>();
  const customers: Ledger["customers"] = [];
  const vendors: Ledger["vendors"] = [];
  const items: Ledger["items"] = [];
  const warnings: ParseWarning[] = [];

  for (const iif of iifs) {
    for (const a of iif.accounts) if (!accounts.has(a.name.toLowerCase())) accounts.set(a.name.toLowerCase(), a);
    customers.push(...iif.customers.filter((c) => !customers.some((x) => x.name.toLowerCase() === c.name.toLowerCase())));
    vendors.push(...iif.vendors.filter((v) => !vendors.some((x) => x.name.toLowerCase() === v.name.toLowerCase())));
    items.push(...iif.items.filter((it) => !items.some((x) => x.name.toLowerCase() === it.name.toLowerCase())));
    warnings.push(...iif.warnings);
  }

  // accounts referenced by transactions but missing from the chart export:
  // create implied entries (type guessed from name) and surface loudly.
  const implied: string[] = [];
  for (const t of transactions) {
    for (const l of t.lines) {
      const key = l.account.toLowerCase();
      if (!accounts.has(key)) {
        const type = guessType(l.account);
        accounts.set(key, { name: l.account, type, cls: classifyAccountType(type) });
        implied.push(l.account);
      }
    }
  }
  if (implied.length) {
    warnings.push({
      severity: "warn",
      where: "ledger",
      message: `${implied.length} account(s) appear in transactions but not in the chart-of-accounts export: ${implied.slice(0, 5).join(", ")}${implied.length > 5 ? "…" : ""}. Their type was inferred from the name — check the reconciliation report.`,
    });
  }

  return { accounts, customers, vendors, items, transactions, impliedAccounts: implied, warnings };
}

function guessType(name: string): string {
  const n = name.toLowerCase();
  if (/receivable/.test(n)) return "AR";
  if (/payable/.test(n)) return "AP";
  if (/checking|savings|bank|cash/.test(n)) return "BANK";
  if (/credit card|visa|mastercard|amex/.test(n)) return "CCARD";
  if (/loan|mortgage|note payable/.test(n)) return "LTLIAB";
  if (/equity|capital|retained|opening balance/.test(n)) return "EQUITY";
  if (/income|revenue|sales|fees earned/.test(n)) return "INC";
  if (/cogs|cost of goods/.test(n)) return "COGS";
  if (/inventory|asset|equipment|furniture|vehicle|depreciation/.test(n)) return "OASSET";
  if (/tax payable|payroll liabilit|unearned|deposit/.test(n)) return "OCLIAB";
  return "EXP";
}

/** Σdebit−Σcredit per account for transactions in [from, to] (ISO, inclusive).
 *  Pass from = "" for all history up to `to`. */
export function accountActivity(ledger: Ledger, from: string, to: string): Map<string, number> {
  const out = new Map<string, number>();
  for (const t of ledger.transactions) {
    if (t.date > to || (from && t.date < from)) continue;
    for (const l of t.lines) {
      const key = l.account.toLowerCase();
      out.set(key, (out.get(key) ?? 0) + l.debit - l.credit);
    }
  }
  return out;
}

/**
 * Trial-balance values as QuickBooks computes them for a report ranged
 * [rangeStart, asOf]: balance-sheet accounts show cumulative balance through
 * asOf; income/expense accounts show activity within the range only, with
 * prior-year P&L folded into retained earnings implicitly (QBD shows no
 * Retained Earnings row unless it has explicit postings; we add the
 * roll-in so totals still balance — flagged as "computed").
 */
export function computeTrialBalance(ledger: Ledger, rangeStart: string, asOf: string) {
  const cumulative = accountActivity(ledger, "", asOf);
  const period = accountActivity(ledger, rangeStart, asOf);
  const rows: { account: string; display: string; balance: number; cls: string; computed?: boolean }[] = [];
  let retainedRollIn = 0;

  for (const [key, acct] of ledger.accounts) {
    const bal = isBalanceSheet(acct.cls) ? cumulative.get(key) ?? 0 : period.get(key) ?? 0;
    if (!isBalanceSheet(acct.cls)) {
      const pre = (cumulative.get(key) ?? 0) - (period.get(key) ?? 0);
      retainedRollIn += pre;
    }
    if (bal !== 0) rows.push({ account: acct.name, display: acct.name, balance: bal, cls: acct.cls });
  }

  // fold prior-period P&L into Retained Earnings so debits balance credits
  if (retainedRollIn !== 0) {
    const existing = rows.find((r) => /retained earnings/i.test(r.account));
    if (existing) {
      existing.balance += retainedRollIn;
      existing.computed = true;
    } else {
      rows.push({ account: "Retained Earnings", display: "Retained Earnings (computed)", balance: retainedRollIn, cls: "equity", computed: true });
    }
  }

  rows.sort((a, b) => a.account.localeCompare(b.account));
  const totalDebit = rows.reduce((s, r) => s + Math.max(0, r.balance), 0);
  const totalCredit = rows.reduce((s, r) => s + Math.max(0, -r.balance), 0);
  return { rows, totalDebit, totalCredit };
}
