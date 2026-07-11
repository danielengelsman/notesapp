/** Regression tests for the QA red-team findings (deliverables/research/qa-attack.md). */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseIif } from "./iif";
import { parseTxnReport, normalizeDate } from "./txnreport";
import { parseTrialBalance } from "./trialbalance";
import { buildLedger } from "./ledger";
import { reconcile, normalizeAccountLabel } from "./reconcile";
import { exportGnuCash, exportManager, exportGeneric } from "./exporters";
import { parseDelimited } from "./table";

const FIX = join(process.cwd(), "fixtures", "blue-heron");
const read = (f: string) => readFileSync(join(FIX, f), "utf8");

describe("P0 — CSV/TSV formula injection is neutralized in every export", () => {
  // craft a ledger whose text fields carry formula payloads
  const iif =
    "!ACCNT\tNAME\tACCNTTYPE\nACCNT\t=cmd|'/c calc'!A1\tBANK\nACCNT\tSales\tINC\n" +
    "!CUST\tNAME\tEMAIL\nCUST\t@SUM(A1)\tx@y.z\n";
  const csv =
    ',Trans #,Type,Date,Num,Name,Memo,Account,Clr,Split,Debit,Credit\n' +
    ',1,Deposit,01/15/2025,,+2+3,=1+1,=cmd|\'/c calc\'!A1,,Sales,"100.00",\n' +
    ',1,Deposit,01/15/2025,,+2+3,revenue,Sales,,x,,"100.00"\n';
  const ledger = buildLedger([parseIif(iif)], parseTxnReport(csv).transactions);

  // A cell is dangerous only if it starts with a formula trigger AND isn't a
  // plain number (negative amounts like -100.00 are legitimate export data).
  const isNumber = (s: string) => /^[+-]?\d+(\.\d+)?$/.test(s);
  const dangerous = (cell: string) => /^[=+\-@]/.test(cell) && !isNumber(cell) && !cell.startsWith("'");

  it("GnuCash CSV cells never begin with a formula trigger", () => {
    for (const f of exportGnuCash(ledger)) {
      if (!f.name.endsWith(".csv")) continue;
      for (const row of parseDelimited(f.content)) for (const cell of row) {
        expect(dangerous(cell), `${f.name}: ${cell}`).toBe(false);
      }
    }
  });
  it("generic CSV cells never begin with a formula trigger", () => {
    for (const f of exportGeneric(ledger)) {
      if (!f.name.endsWith(".csv")) continue;
      for (const row of parseDelimited(f.content)) for (const cell of row) {
        expect(dangerous(cell), `${f.name}: ${cell}`).toBe(false);
      }
    }
  });
  it("Manager.io TSV cells never begin with a formula trigger", () => {
    for (const f of exportManager(ledger)) {
      if (!f.name.endsWith(".tsv")) continue;
      for (const line of f.content.split("\r\n")) for (const cell of line.split("\t")) {
        expect(dangerous(cell), `${f.name}: ${cell}`).toBe(false);
      }
    }
  });
  it("the escaped value still carries the original text (prefixed, not dropped)", () => {
    const tx = exportGeneric(ledger).find((f) => f.name.endsWith("transactions.csv"))!;
    expect(tx.content).toContain("'=cmd|'"); // payload preserved, defused
  });
});

describe("P1 — reconciliation matches space-separated account numbers", () => {
  it("normalizes '1000 Checking' the same as '1000 · Checking'", () => {
    expect(normalizeAccountLabel("1000 Checking")).toBe("checking");
    expect(normalizeAccountLabel("1000 · Checking")).toBe("checking");
    expect(normalizeAccountLabel("6510 - Utilities:Phone")).toBe("utilities:phone");
  });
  it("reconciles a TB whose labels use space-separated numbers", () => {
    const iif = parseIif(read("lists.iif"));
    const rep = parseTxnReport(read("txn-detail.csv"));
    const ledger = buildLedger([iif], rep.transactions);
    // rewrite the TB middot into a plain space
    const tbText = read("trial-balance-2025.csv").replace(/ · /g, " ");
    const tb = parseTrialBalance(tbText);
    const recon = reconcile(ledger, tb.report, { rangeStart: "2025-01-01", asOf: "2025-12-31" });
    expect(recon.perfect).toBe(true);
  });
});

describe("P2 — calendar-impossible dates are rejected, not emitted", () => {
  it("rejects Feb 30 and month 13", () => {
    expect(normalizeDate("02/30/2024")).toBeNull();
    expect(normalizeDate("13/01/2024")).toBeNull();
    expect(normalizeDate("04/31/2024")).toBeNull();
    expect(normalizeDate("2024-02-30")).toBeNull();
  });
  it("still accepts real leap day", () => {
    expect(normalizeDate("02/29/2024")).toBe("2024-02-29");
    expect(normalizeDate("02/29/2023")).toBeNull(); // 2023 not a leap year
  });
});

describe("P1 — chunked transaction files parse independently", () => {
  // Two files, each with its own title rows + header, different column order in file 2
  it("both files' transactions survive when parsed per-file", () => {
    const f1 = 'Co\nCustom Transaction Detail\n,Trans #,Type,Date,Name,Account,Debit,Credit\n,1,Deposit,01/15/2025,A,Checking,"100.00",\n,1,Deposit,01/15/2025,A,Sales,,"100.00"\n';
    const f2 = 'Co\nCustom Transaction Detail\n,Trans #,Date,Type,Account,Name,Memo,Debit,Credit\n,2,02/15/2025,Check,Rent,B,feb,"50.00",\n,2,02/15/2025,Check,Checking,B,feb,,"50.00"\n';
    const r1 = parseTxnReport(f1);
    const r2 = parseTxnReport(f2);
    expect(r1.transactions.length).toBe(1);
    expect(r2.transactions.length).toBe(1);
    // file 2's differently-ordered columns are read correctly
    const t2 = r2.transactions[0];
    expect(t2.lines.find((l) => l.account === "Rent")?.debit).toBe(5000);
    expect(t2.name).toBe("B");
  });
});
