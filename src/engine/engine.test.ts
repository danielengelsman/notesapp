import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseAmount, formatCents } from "./money";
import { parseDelimited } from "./table";
import { parseIif } from "./iif";
import { parseTxnReport, normalizeDate } from "./txnreport";
import { parseTrialBalance } from "./trialbalance";
import { buildLedger, computeTrialBalance } from "./ledger";
import { reconcile, normalizeAccountLabel } from "./reconcile";

const FIX = join(process.cwd(), "fixtures", "blue-heron");
const read = (f: string) => readFileSync(join(FIX, f), "utf8");
const expected = JSON.parse(read("expected.json"));

describe("money", () => {
  it("parses QuickBooks amount formats", () => {
    expect(parseAmount("1,234.56")).toBe(123456);
    expect(parseAmount("-1,234.56")).toBe(-123456);
    expect(parseAmount("(1,234.56)")).toBe(-123456);
    expect(parseAmount("$2,000.00")).toBe(200000);
    expect(parseAmount('"1,500.00"')).toBe(150000);
    expect(parseAmount("0.10")).toBe(10);
    expect(parseAmount("7")).toBe(700);
    expect(parseAmount("")).toBeNull();
    expect(parseAmount("   ")).toBeNull();
    expect(parseAmount("abc")).toBeNull();
  });
  it("round-trips formatting", () => {
    expect(formatCents(123456)).toBe("1,234.56");
    expect(formatCents(-50)).toBe("-0.50");
  });
});

describe("table", () => {
  it("handles quoted fields with commas and escaped quotes", () => {
    const rows = parseDelimited('a,"b,c","d""e"\n1,2,3');
    expect(rows[0]).toEqual(["a", "b,c", 'd"e']);
    expect(rows[1]).toEqual(["1", "2", "3"]);
  });
  it("sniffs tab delimiter", () => {
    const rows = parseDelimited("a\tb\tc\n1\t2\t3");
    expect(rows[0]).toEqual(["a", "b", "c"]);
  });
});

describe("dates", () => {
  it("normalizes QBD date formats", () => {
    expect(normalizeDate("1/5/2024")).toBe("2024-01-05");
    expect(normalizeDate("12/31/25")).toBe("2025-12-31");
    expect(normalizeDate("12/31/99")).toBe("1999-12-31");
    expect(normalizeDate("2024-06-01")).toBe("2024-06-01");
    expect(normalizeDate("13/45/2024")).toBeNull();
    expect(normalizeDate("Jan 24")).toBeNull();
  });
});

describe("IIF list parsing", () => {
  const iif = parseIif(read("lists.iif"));
  it("parses the full chart of accounts", () => {
    expect(iif.accounts.length).toBe(expected.accounts);
    const checking = iif.accounts.find((a) => a.name === "Checking");
    expect(checking?.type).toBe("BANK");
    expect(checking?.cls).toBe("asset");
    expect(checking?.number).toBe("1000");
  });
  it("parses customers, vendors, items", () => {
    expect(iif.customers.length).toBe(expected.customers);
    expect(iif.vendors.length).toBe(expected.vendors);
    expect(iif.items.length).toBe(expected.items);
    expect(iif.customers[0].email).toContain("@example.com");
  });
  it("classifies sub-accounts", () => {
    const phone = iif.accounts.find((a) => a.name === "Utilities:Phone");
    expect(phone?.cls).toBe("expense");
  });
});

describe("transaction report parsing", () => {
  const rep = parseTxnReport(read("txn-detail.csv"));
  it("parses every transaction and line", () => {
    expect(rep.transactions.length).toBe(expected.txnCount);
    const lines = rep.transactions.reduce((s, t) => s + t.lines.length, 0);
    expect(lines).toBe(expected.lineCount);
  });
  it("every transaction balances internally", () => {
    for (const t of rep.transactions) {
      const d = t.lines.reduce((s, l) => s + l.debit, 0);
      const c = t.lines.reduce((s, l) => s + l.credit, 0);
      expect(d, `${t.type} ${t.id} ${t.date}`).toBe(c);
    }
  });
  it("total debits match the referee", () => {
    const total = rep.transactions.reduce((s, t) => s + t.lines.reduce((x, l) => x + l.debit, 0), 0);
    expect(total).toBe(expected.totalDebits);
  });
  it("captures the date range", () => {
    expect(rep.dateRange).toEqual(expected.dateRange);
  });
  it("flags filtered (unbalanced) exports loudly", () => {
    const broken = parseTxnReport(read("txn-detail-filtered.csv"));
    const errors = broken.warnings.filter((w) => w.severity !== "info");
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe("trial balance parsing", () => {
  const tb = parseTrialBalance(read("trial-balance-2025.csv"));
  it("parses all account rows and the total", () => {
    expect(tb.report.rows.length).toBe(Object.keys(expected.trialBalance2025).length);
    expect(tb.report.totalDebit).not.toBeNull();
    expect(tb.report.totalDebit).toBe(tb.report.totalCredit);
  });
  it("extracts the as-of date", () => {
    expect(tb.report.asOf).toContain("December 31, 2025");
  });
});

describe("account label normalization", () => {
  it("strips account numbers and middots", () => {
    expect(normalizeAccountLabel("1000 · Checking")).toBe("checking");
    expect(normalizeAccountLabel("  6510 - Utilities:Phone ")).toBe("utilities:phone");
  });
});

describe("end-to-end reconciliation (the product's core promise)", () => {
  const iif = parseIif(read("lists.iif"));
  const rep = parseTxnReport(read("txn-detail.csv"));
  const ledger = buildLedger([iif], rep.transactions);
  const tb = parseTrialBalance(read("trial-balance-2025.csv"));

  it("rebuilt trial balance matches QuickBooks to the penny", () => {
    const recon = reconcile(ledger, tb.report, { rangeStart: "2025-01-01", asOf: "2025-12-31" });
    const bad = recon.rows.filter((r) => r.status !== "match");
    expect(bad, JSON.stringify(bad, null, 1)).toEqual([]);
    expect(recon.perfect).toBe(true);
    expect(recon.totalDeltaAbs).toBe(0);
    expect(recon.computedTotalDebit).toBe(tb.report.totalDebit);
    expect(recon.computedTotalCredit).toBe(tb.report.totalCredit);
  });

  it("computed balances equal the referee's, account by account", () => {
    const computed = computeTrialBalance(ledger, "2025-01-01", "2025-12-31");
    const byName = new Map(computed.rows.map((r) => [r.account, r.balance]));
    for (const [account, cents] of Object.entries(expected.trialBalance2025)) {
      expect(byName.get(account), account).toBe(cents);
    }
    expect(computed.rows.length).toBe(Object.keys(expected.trialBalance2025).length);
  });

  it("a filtered export does NOT reconcile (the safety net catches it)", () => {
    const broken = parseTxnReport(read("txn-detail-filtered.csv"));
    const brokenLedger = buildLedger([iif], broken.transactions);
    const recon = reconcile(brokenLedger, tb.report, { rangeStart: "2025-01-01", asOf: "2025-12-31" });
    expect(recon.perfect).toBe(false);
    expect(recon.mismatched + recon.missingInRebuild).toBeGreaterThan(0);
  });
});
