/**
 * Generates the sample company used by tests and the in-app demo:
 * "Blue Heron Landscaping LLC" — six years of plausible small-business books
 * (2020–2025), exported the way QuickBooks Desktop exports them:
 *
 *   fixtures/blue-heron/lists.iif                IIF list export (COA, customers, vendors, items)
 *   fixtures/blue-heron/txn-detail.csv           Custom Transaction Detail Report (all dates)
 *   fixtures/blue-heron/trial-balance-2025.csv   Trial Balance as of 12/31/2025
 *   fixtures/blue-heron/expected.json            independently computed balances for tests
 *   fixtures/blue-heron/txn-detail-filtered.csv  deliberately broken export (account filter on)
 *
 * The trial balance here is computed by THIS script's own simple arithmetic —
 * deliberately independent of src/engine — so the engine's reconciliation is
 * tested against an external referee, not against itself.
 *
 * Deterministic: seeded PRNG, no Date.now(). Same output every run.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = join(process.cwd(), "fixtures", "blue-heron");
mkdirSync(OUT, { recursive: true });

// ---------- deterministic PRNG ----------
let seed = 20260711;
const rand = () => {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
};
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const randInt = (lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1));

// ---------- chart of accounts ----------
type Acct = { name: string; type: string; num: string };
const ACCOUNTS: Acct[] = [
  { name: "Checking", type: "BANK", num: "1000" },
  { name: "Savings", type: "BANK", num: "1010" },
  { name: "Accounts Receivable", type: "AR", num: "1200" },
  { name: "Undeposited Funds", type: "OCASSET", num: "1300" },
  { name: "Equipment", type: "FIXASSET", num: "1500" },
  { name: "Accumulated Depreciation", type: "FIXASSET", num: "1510" },
  { name: "Accounts Payable", type: "AP", num: "2000" },
  { name: "Company Credit Card", type: "CCARD", num: "2100" },
  { name: "Sales Tax Payable", type: "OCLIAB", num: "2200" },
  { name: "Equipment Loan", type: "LTLIAB", num: "2500" },
  { name: "Owner's Equity", type: "EQUITY", num: "3000" },
  { name: "Owner Draws", type: "EQUITY", num: "3100" },
  { name: "Retained Earnings", type: "EQUITY", num: "3900" },
  { name: "Landscaping Income", type: "INC", num: "4000" },
  { name: "Snow Removal Income", type: "INC", num: "4100" },
  { name: "Design Income", type: "INC", num: "4200" },
  { name: "Materials & Plants", type: "COGS", num: "5000" },
  { name: "Subcontractors", type: "COGS", num: "5100" },
  { name: "Fuel", type: "EXP", num: "6000" },
  { name: "Equipment Repairs", type: "EXP", num: "6100" },
  { name: "Insurance", type: "EXP", num: "6200" },
  { name: "Office Supplies", type: "EXP", num: "6300" },
  { name: "Software Subscriptions", type: "EXP", num: "6400" },
  { name: "Utilities:Phone", type: "EXP", num: "6510" },
  { name: "Utilities:Internet", type: "EXP", num: "6520" },
  { name: "Payroll Expenses", type: "EXP", num: "6600" },
  { name: "Interest Expense", type: "EXP", num: "6700" },
  { name: "Depreciation Expense", type: "EXP", num: "6800" },
];

const CUSTOMERS = [
  "Meadowbrook HOA", "Tom & Priya Whitfield", "Cascade Office Park", "Juniper Dental",
  "Hartley's Hardware", "Riverbend Apartments", "St. Anne's Church", "Kestrel Brewing Co",
  "The Nguyen Family", "Copper Kettle Cafe", "Fairview School District", "Marisol Ortega",
];
const VENDORS = [
  "Valley Nursery Supply", "Redline Fuel Stop", "Summit Insurance Group", "Beacon Equipment Rental",
  "GreenTech Irrigation", "City of Fairview", "Northside Print Shop", "ToolTown",
];
const ITEMS = [
  { name: "Weekly Maintenance", type: "SERV", desc: "Weekly grounds maintenance", price: 18500, account: "Landscaping Income" },
  { name: "Spring Cleanup", type: "SERV", desc: "Seasonal cleanup package", price: 42500, account: "Landscaping Income" },
  { name: "Snow Plowing", type: "SERV", desc: "Per-visit snow removal", price: 9500, account: "Snow Removal Income" },
  { name: "Landscape Design", type: "SERV", desc: "Design consultation", price: 95000, account: "Design Income" },
  { name: "Mulch Install", type: "SERV", desc: "Mulch delivery and install", price: 30000, account: "Landscaping Income" },
];

// ---------- transactions ----------
type Line = { account: string; debit: number; credit: number; memo?: string; name?: string };
type Txn = { id: number; type: string; date: string; num?: string; name?: string; memo?: string; lines: Line[] };

const txns: Txn[] = [];
let nextId = 1;
let nextInvoice = 1001;
let nextCheck = 5001;

const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

function add(type: string, date: string, lines: Line[], extra: Partial<Txn> = {}) {
  const d = lines.reduce((s, l) => s + l.debit, 0);
  const c = lines.reduce((s, l) => s + l.credit, 0);
  if (d !== c) throw new Error(`fixture bug: unbalanced ${type} on ${date}: ${d} vs ${c}`);
  txns.push({ id: nextId++, type, date, lines, ...extra });
}

// opening: owner funds the company, buys equipment with a loan — Jan 2020
add("Deposit", iso(2020, 1, 6), [
  { account: "Checking", debit: 2500000, credit: 0 },
  { account: "Owner's Equity", debit: 0, credit: 2500000, memo: "Initial capital" },
], { memo: "Initial owner investment" });
add("General Journal", iso(2020, 1, 10), [
  { account: "Equipment", debit: 5400000, credit: 0, memo: "Trucks + mowers" },
  { account: "Checking", debit: 0, credit: 1400000 },
  { account: "Equipment Loan", debit: 0, credit: 4000000 },
], { num: "GJ-1", memo: "Equipment purchase w/ loan" });

for (let y = 2020; y <= 2025; y++) {
  const growth = 1 + (y - 2020) * 0.14;
  // monthly recurring activity
  for (let m = 1; m <= 12; m++) {
    // 3-6 customer invoices a month, seasonal mix
    const isWinter = m <= 3 || m === 12;
    const invoiceCount = randInt(4, 8);
    for (let k = 0; k < invoiceCount; k++) {
      const cust = pick(CUSTOMERS);
      const item = isWinter ? (rand() < 0.6 ? ITEMS[2] : ITEMS[3]) : pick([ITEMS[0], ITEMS[0], ITEMS[1], ITEMS[3], ITEMS[4]]);
      const qty = randInt(2, 8);
      const amount = Math.round(item.price * qty * growth);
      const day = randInt(2, 26);
      add("Invoice", iso(y, m, day), [
        { account: "Accounts Receivable", debit: amount, credit: 0, name: cust },
        { account: item.account, debit: 0, credit: amount, memo: item.desc, name: cust },
      ], { num: String(nextInvoice++), name: cust, memo: item.desc });
      // most invoices get paid within ~40 days
      if (rand() < 0.92) {
        const payDelay = randInt(5, 40);
        const pd = new Date(Date.UTC(y, m - 1, day + payDelay));
        const payIso = pd.toISOString().slice(0, 10);
        if (payIso <= "2025-12-31") {
          add("Payment", payIso, [
            { account: "Checking", debit: amount, credit: 0, name: cust },
            { account: "Accounts Receivable", debit: 0, credit: amount, name: cust },
          ], { name: cust, memo: "Payment received" });
        }
      }
    }
    // vendor bills: materials + fuel
    const matAmt = Math.round(randInt(80000, 240000) * growth);
    const matVendor = pick(["Valley Nursery Supply", "GreenTech Irrigation", "ToolTown"]);
    add("Bill", iso(y, m, randInt(3, 20)), [
      { account: "Materials & Plants", debit: matAmt, credit: 0, name: matVendor },
      { account: "Accounts Payable", debit: 0, credit: matAmt, name: matVendor },
    ], { name: matVendor, memo: "Materials" });
    add("Bill Pmt -Check", iso(y, m, Math.min(28, randInt(15, 28))), [
      { account: "Accounts Payable", debit: matAmt, credit: 0, name: matVendor },
      { account: "Checking", debit: 0, credit: matAmt, name: matVendor },
    ], { num: String(nextCheck++), name: matVendor });

    const fuel = Math.round(randInt(30000, 70000) * growth);
    add("Credit Card Charge", iso(y, m, randInt(5, 25)), [
      { account: "Fuel", debit: fuel, credit: 0, name: "Redline Fuel Stop" },
      { account: "Company Credit Card", debit: 0, credit: fuel, name: "Redline Fuel Stop" },
    ], { name: "Redline Fuel Stop" });

    // payroll-ish + phone/internet
    const payroll = Math.round(randInt(280000, 420000) * growth);
    add("Check", iso(y, m, 28), [
      { account: "Payroll Expenses", debit: payroll, credit: 0 },
      { account: "Checking", debit: 0, credit: payroll },
    ], { num: String(nextCheck++), memo: "Payroll" });
    add("Check", iso(y, m, 15), [
      { account: "Utilities:Phone", debit: 14500, credit: 0, name: "City of Fairview" },
      { account: "Utilities:Internet", debit: 8900, credit: 0, name: "City of Fairview" },
      { account: "Checking", debit: 0, credit: 23400, name: "City of Fairview" },
    ], { num: String(nextCheck++), memo: "Utilities" });

    // credit card payment
    add("Check", iso(y, m, Math.min(28, 27)), [
      { account: "Company Credit Card", debit: fuel, credit: 0 },
      { account: "Checking", debit: 0, credit: fuel },
    ], { num: String(nextCheck++), memo: "Card payment" });

    // loan payment: interest + principal
    if (y <= 2023) {
      add("Check", iso(y, m, 1), [
        { account: "Equipment Loan", debit: 70000, credit: 0 },
        { account: "Interest Expense", debit: 15000, credit: 0 },
        { account: "Checking", debit: 0, credit: 85000 },
      ], { num: String(nextCheck++), memo: "Loan payment" });
    }
  }
  // annuals
  add("Check", iso(y, 3, 10), [
    { account: "Insurance", debit: Math.round(180000 * growth), credit: 0, name: "Summit Insurance Group" },
    { account: "Checking", debit: 0, credit: Math.round(180000 * growth), name: "Summit Insurance Group" },
  ], { num: String(nextCheck++), memo: "Annual GL policy" });
  add("General Journal", iso(y, 12, 31), [
    { account: "Depreciation Expense", debit: 540000, credit: 0 },
    { account: "Accumulated Depreciation", debit: 0, credit: 540000 },
  ], { num: `GJ-DEP-${y}`, memo: "Annual depreciation" });
  add("Check", iso(y, 12, 30), [
    { account: "Owner Draws", debit: Math.round(1200000 * growth), credit: 0 },
    { account: "Checking", debit: 0, credit: Math.round(1200000 * growth) },
  ], { num: String(nextCheck++), memo: "Owner draw" });
  // sales tax accrual + remittance (kept simple)
  add("General Journal", iso(y, 6, 30), [
    { account: "Office Supplies", debit: 45000, credit: 0, name: "Northside Print Shop" },
    { account: "Sales Tax Payable", debit: 0, credit: 3200 },
    { account: "Checking", debit: 0, credit: 41800 },
  ], { num: `GJ-ST-${y}` });
  add("Check", iso(y, 7, 20), [
    { account: "Sales Tax Payable", debit: 3200, credit: 0, name: "City of Fairview" },
    { account: "Checking", debit: 0, credit: 3200, name: "City of Fairview" },
  ], { num: String(nextCheck++), memo: "Sales tax remittance" });
  // software subscriptions, quarterly
  for (const m of [1, 4, 7, 10]) {
    add("Credit Card Charge", iso(y, m, 8), [
      { account: "Software Subscriptions", debit: 32700, credit: 0 },
      { account: "Company Credit Card", debit: 0, credit: 32700 },
    ]);
    add("Check", iso(y, m, 26), [
      { account: "Company Credit Card", debit: 32700, credit: 0 },
      { account: "Checking", debit: 0, credit: 32700 },
    ], { num: String(nextCheck++) });
  }
}

txns.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.id - b.id));

// ---------- independent balance computation (the referee) ----------
const BS_TYPES = new Set(["BANK", "AR", "OCASSET", "FIXASSET", "OASSET", "AP", "CCARD", "OCLIAB", "LTLIAB", "EQUITY"]);
function balances(asOf: string, plFrom: string) {
  const cum = new Map<string, number>();
  const period = new Map<string, number>();
  for (const t of txns) {
    if (t.date > asOf) continue;
    for (const l of t.lines) {
      cum.set(l.account, (cum.get(l.account) ?? 0) + l.debit - l.credit);
      if (t.date >= plFrom) period.set(l.account, (period.get(l.account) ?? 0) + l.debit - l.credit);
    }
  }
  const rows: { account: string; balance: number }[] = [];
  let retained = 0;
  for (const a of ACCOUNTS) {
    if (BS_TYPES.has(a.type)) {
      const b = cum.get(a.name) ?? 0;
      if (b !== 0) rows.push({ account: a.name, balance: b });
    } else {
      const b = period.get(a.name) ?? 0;
      retained += (cum.get(a.name) ?? 0) - b;
      if (b !== 0) rows.push({ account: a.name, balance: b });
    }
  }
  if (retained !== 0) {
    const re = rows.find((r) => r.account === "Retained Earnings");
    if (re) re.balance += retained;
    else rows.push({ account: "Retained Earnings", balance: retained });
  }
  return rows;
}

// ---------- writers that mimic QBD output style ----------
const cents = (n: number) => {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  const int = Math.floor(abs / 100).toLocaleString("en-US");
  return `${sign}${int}.${String(abs % 100).padStart(2, "0")}`;
};
const csvCell = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
const usDate = (isoStr: string) => {
  const [y, m, d] = isoStr.split("-");
  return `${Number(m)}/${Number(d)}/${y}`;
};

// IIF
{
  const L: string[] = [];
  L.push("!HDR\tPROD\tVER\tREL\tIIFVER\tDATE\tTIME\tACCNTNT\tACCNTNTSPLITTIME");
  L.push("HDR\tQuickBooks Pro\tVersion 23.0D\tRelease R7P\t1\t12/31/2025\t1735689600\tN\t0");
  L.push("!ACCNT\tNAME\tACCNTTYPE\tDESC\tACCNUM\tEXTRA");
  for (const a of ACCOUNTS) L.push(`ACCNT\t${a.name}\t${a.type}\t\t${a.num}\t`);
  L.push("!CUST\tNAME\tBADDR1\tBADDR2\tBADDR3\tPHONE1\tEMAIL\tBALANCE");
  CUSTOMERS.forEach((c, i) =>
    L.push(`CUST\t${c}\t${100 + i} Garden Way\tFairview, OR 97024\t\t503-555-01${String(i).padStart(2, "0")}\t${c.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com\t`)
  );
  L.push("!VEND\tNAME\tADDR1\tADDR2\tPHONE1\tEMAIL\tBALANCE");
  VENDORS.forEach((v, i) =>
    L.push(`VEND\t${v}\t${200 + i} Commerce St\tFairview, OR 97024\t503-555-02${String(i).padStart(2, "0")}\t\t`)
  );
  L.push("!INVITEM\tNAME\tINVITEMTYPE\tDESC\tPRICE\tACCNT");
  for (const it of ITEMS) L.push(`INVITEM\t${it.name}\t${it.type}\t${it.desc}\t${(it.price / 100).toFixed(2)}\t${it.account}`);
  writeFileSync(join(OUT, "lists.iif"), L.join("\r\n") + "\r\n");
}

// Custom Transaction Detail Report CSV
function writeTxnCsv(path: string, filter?: (l: Line) => boolean) {
  const L: string[] = [];
  L.push("Blue Heron Landscaping LLC");
  L.push("Custom Transaction Detail Report");
  L.push("January 2020 through December 2025");
  L.push(",Trans #,Type,Date,Num,Name,Memo,Account,Clr,Split,Debit,Credit");
  for (const t of txns) {
    const kept = filter ? t.lines.filter(filter) : t.lines;
    for (const l of kept) {
      const split = t.lines.length > 2 ? "-SPLIT-" : (t.lines.find((x) => x !== l)?.account ?? "");
      L.push([
        "",
        String(t.id),
        t.type,
        usDate(t.date),
        t.num ?? "",
        csvCell(l.name ?? t.name ?? ""),
        csvCell(l.memo ?? t.memo ?? ""),
        csvCell(l.account),
        "",
        csvCell(split),
        l.debit ? csvCell(cents(l.debit)) : "",
        l.credit ? csvCell(cents(l.credit)) : "",
      ].join(","));
    }
  }
  L.push(`,,,,,,,,,Total,${csvCell(cents(txns.reduce((s, t) => s + t.lines.reduce((x, l) => x + l.debit, 0), 0)))},${csvCell(cents(txns.reduce((s, t) => s + t.lines.reduce((x, l) => x + l.credit, 0), 0)))}`);
  writeFileSync(path, L.join("\r\n") + "\r\n");
}
writeTxnCsv(join(OUT, "txn-detail.csv"));
writeTxnCsv(join(OUT, "txn-detail-filtered.csv"), (l) => l.account !== "Checking"); // broken on purpose: filters the highest-balance account

// Trial Balance CSV (as of 12/31/2025, P&L range = calendar 2025)
{
  const rows = balances("2025-12-31", "2025-01-01");
  rows.sort((a, b) => a.account.localeCompare(b.account));
  const L: string[] = [];
  L.push("Blue Heron Landscaping LLC");
  L.push("Trial Balance");
  L.push(csvCell("As of December 31, 2025"));
  L.push(",Debit,Credit");
  let td = 0, tc = 0;
  for (const r of rows) {
    const acct = ACCOUNTS.find((a) => a.name === r.account);
    const label = acct ? `${acct.num} · ${r.account}` : r.account;
    if (r.balance >= 0) { td += r.balance; L.push(`${csvCell(label)},${csvCell(cents(r.balance))},`); }
    else { tc += -r.balance; L.push(`${csvCell(label)},,${csvCell(cents(-r.balance))}`); }
  }
  L.push(`TOTAL,${csvCell(cents(td))},${csvCell(cents(tc))}`);
  writeFileSync(join(OUT, "trial-balance-2025.csv"), L.join("\r\n") + "\r\n");
}

// expected.json — the referee's numbers for the engine tests
{
  const rows = balances("2025-12-31", "2025-01-01");
  const totalDebits = txns.reduce((s, t) => s + t.lines.reduce((x, l) => x + l.debit, 0), 0);
  writeFileSync(
    join(OUT, "expected.json"),
    JSON.stringify(
      {
        txnCount: txns.length,
        lineCount: txns.reduce((s, t) => s + t.lines.length, 0),
        totalDebits,
        accounts: ACCOUNTS.length,
        customers: CUSTOMERS.length,
        vendors: VENDORS.length,
        items: ITEMS.length,
        trialBalance2025: Object.fromEntries(rows.map((r) => [r.account, r.balance])),
        dateRange: { min: txns[0].date, max: txns[txns.length - 1].date },
      },
      null,
      2
    )
  );
}

console.log(`fixtures written to ${OUT}: ${txns.length} transactions`);
