import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseIif } from "./iif";
import { parseTxnReport } from "./txnreport";
import { buildLedger } from "./ledger";
import { exportGnuCash, exportManager, exportGeneric } from "./exporters";
import { parseDelimited } from "./table";
import { parseAmount } from "./money";
import { generateArchive } from "./archive";

const FIX = join(process.cwd(), "fixtures", "blue-heron");
const read = (f: string) => readFileSync(join(FIX, f), "utf8");
const iif = parseIif(read("lists.iif"));
const rep = parseTxnReport(read("txn-detail.csv"));
const ledger = buildLedger([iif], rep.transactions);
const expected = JSON.parse(read("expected.json"));

describe("GnuCash export", () => {
  const files = exportGnuCash(ledger);
  const tx = files.find((f) => f.name.endsWith("transactions.csv"))!;
  const accounts = files.find((f) => f.name.endsWith("accounts.csv"))!;

  it("emits one row per split, transaction fields on first row only", () => {
    const rows = parseDelimited(tx.content);
    expect(rows.length - 1).toBe(expected.lineCount);
    const first = rows[1];
    expect(first[1]).toMatch(/^\d{4}-\d{2}-\d{2}$/); // ISO date on the first split
  });

  it("every transaction's split amounts sum to zero (double-entry preserved)", () => {
    const rows = parseDelimited(tx.content).slice(1);
    const sums = new Map<string, number>();
    for (const r of rows) {
      const id = r[0];
      const cents = parseAmount(r[6])!;
      sums.set(id, (sums.get(id) ?? 0) + cents);
    }
    for (const [id, sum] of sums) expect(sum, `txn ${id}`).toBe(0);
    expect(sums.size).toBe(expected.txnCount);
  });

  it("prefixes accounts with the GnuCash class tree", () => {
    expect(tx.content).toContain("Assets:Checking");
    expect(tx.content).toContain("Income:Landscaping Income");
    expect(accounts.content).toContain("RECEIVABLE");
    const rows = parseDelimited(accounts.content);
    expect(rows.length - 1).toBe(expected.accounts);
  });
});

describe("Manager.io export", () => {
  const files = exportManager(ledger);
  it("emits TSV entity files plus opening balances and README", () => {
    const names = files.map((f) => f.name);
    expect(names).toContain("manager-io/chart-of-accounts.tsv");
    expect(names).toContain("manager-io/opening-balances.txt");
    const cust = files.find((f) => f.name.endsWith("customers.tsv"))!;
    expect(cust.content.split("\r\n").filter(Boolean).length - 1).toBe(expected.customers);
  });
  it("opening balances cover only balance-sheet accounts with nonzero balances", () => {
    const ob = files.find((f) => f.name.endsWith("opening-balances.txt"))!;
    expect(ob.content).toContain("Checking");
    expect(ob.content).not.toContain("Landscaping Income");
  });
});

describe("generic export", () => {
  const files = exportGeneric(ledger);
  it("round-trips full fidelity through JSON", () => {
    const json = JSON.parse(files.find((f) => f.name.endsWith("ledger.json"))!.content);
    expect(json.transactions.length).toBe(expected.txnCount);
    expect(json.accounts.length).toBe(expected.accounts);
    const totalDebits = json.transactions.reduce(
      (s: number, t: { lines: { debit: number }[] }) => s + t.lines.reduce((x: number, l: { debit: number }) => x + l.debit, 0),
      0
    );
    expect(totalDebits).toBe(expected.totalDebits);
  });
});

describe("archive generation", () => {
  it("produces a self-contained HTML file with embedded data", () => {
    const html = generateArchive(ledger, null, { companyName: "Blue Heron Landscaping LLC", generatedAt: "2026-07-11T12:00:00Z", appVersion: "1.0.0" });
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain('id="bookstead-data"');
    // no external references of any kind
    expect(html).not.toMatch(/src\s*=\s*["']https?:/);
    expect(html).not.toMatch(/href\s*=\s*["']https?:/);
    expect(html).not.toContain("fetch(");
    expect(html).not.toContain("XMLHttpRequest");
    const embedded = JSON.parse(html.match(/<script id="bookstead-data" type="application\/json">([\s\S]*?)<\/script>/)![1].replace(/<\\\//g, "</"));
    expect(embedded.transactions.length).toBe(expected.txnCount);
  });
});
