/**
 * Destination export packs. Each returns a set of named files; the app zips
 * them client-side. Formats follow deliverables/research/research-techspec.md:
 *  - GnuCash: multi-split CSV verified against gnc-imp-props-tx.cpp roles
 *  - Manager.io: Batch Create TSVs + the officially recommended
 *    template-mirroring flow for journal entries (documented in the README)
 *  - Generic: flat CSV + full-fidelity JSON
 */
import { Ledger, isBalanceSheet } from "./types";

export interface ExportFile {
  name: string;
  content: string;
}

/** True for a plain numeric literal (incl. signed/decimal) — safe to leave as
 *  data even though it starts with + or -. Negative amounts are essential to
 *  the export, so we must not quote-prefix them. */
const isNumber = (s: string) => /^[+-]?\d+(\.\d+)?$/.test(s);

/** Neutralize spreadsheet formula injection: a non-numeric cell whose text
 *  begins with = + - @ (or a leading tab/CR) is executed as a formula by
 *  Excel/Sheets/LibreOffice on open. Prefix a single quote so it's shown
 *  literally. Then apply normal CSV quoting. Applied to every emitted cell. */
const q = (raw: string) => {
  let s = raw ?? "";
  if (/^[=+\-@\t\r]/.test(s) && !isNumber(s)) s = "'" + s;
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const money = (cents: number) => {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  return `${sign}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, "0")}`;
};

/** GnuCash account-tree prefix per class, colon-pathed like a GnuCash book. */
const GNC_PREFIX: Record<string, string> = {
  asset: "Assets",
  liability: "Liabilities",
  equity: "Equity",
  income: "Income",
  expense: "Expenses",
};
const GNC_TYPE: Record<string, string> = {
  BANK: "BANK", AR: "RECEIVABLE", OCASSET: "ASSET", FIXASSET: "ASSET", OASSET: "ASSET",
  AP: "PAYABLE", CCARD: "CREDIT", OCLIAB: "LIABILITY", LTLIAB: "LIABILITY",
  EQUITY: "EQUITY", INC: "INCOME", EXINC: "INCOME", EXP: "EXPENSE", EXEXP: "EXPENSE", COGS: "EXPENSE",
};

export function gnucashAccountPath(ledger: Ledger, accountName: string): string {
  const acct = ledger.accounts.get(accountName.toLowerCase());
  const prefix = GNC_PREFIX[acct?.cls ?? "expense"];
  return `${prefix}:${accountName}`;
}

export function exportGnuCash(ledger: Ledger): ExportFile[] {
  // transactions.csv — multi-split, grouped by Transaction ID (verified roles)
  const lines: string[] = ["Transaction ID,Date,Number,Description,Memo,Account,Amount"];
  for (const t of ledger.transactions) {
    t.lines.forEach((l, i) => {
      lines.push(
        [
          q(t.id),
          i === 0 ? t.date : "",
          i === 0 ? q(t.num ?? "") : "",
          i === 0 ? q([t.type, t.name].filter(Boolean).join(" - ")) : "",
          q(l.memo ?? l.name ?? ""),
          q(gnucashAccountPath(ledger, l.account)),
          money(l.debit - l.credit),
        ].join(",")
      );
    });
  }

  // accounts.csv — GnuCash "Import Accounts from CSV" layout
  const acctLines = ["Type,Full Account Name,Name,Account Code,Description,Account Color,Notes,Symbol,Namespace,Hidden,Tax Info,Placeholder"];
  for (const a of ledger.accounts.values()) {
    acctLines.push(
      [
        GNC_TYPE[a.type.toUpperCase()] ?? "EXPENSE",
        q(gnucashAccountPath(ledger, a.name)),
        q(a.name.split(":").pop() ?? a.name),
        q(a.number ?? ""),
        q(a.description ?? ""),
        "", "", "USD", "CURRENCY", "F", "F", "F",
      ].join(",")
    );
  }

  const readme = `GnuCash import — Bookstead migration pack
==========================================

Import order matters. Two steps:

1) ACCOUNTS
   File > Import > Import Accounts from CSV  ->  accounts.csv
   (Creates the account tree. GnuCash's transaction importer cannot
    create missing accounts, so do this first.)

2) TRANSACTIONS
   File > Import > Import Transactions from CSV  ->  transactions.csv
   - Separator: comma
   - CHECK the "Multi-split" checkbox (each row is one split;
     transaction fields appear on the first row of each group)
   - Date format: y-m-d
   - Map columns: Transaction ID, Date, Number, Description, Memo,
     Account, Amount (the headers match GnuCash's role names)
   - On the account-matching page, confirm each account maps to the
     tree imported in step 1.

Amounts are signed: positive = debit side, negative = credit side.
Verify afterwards: Reports > Income & Expense > Trial Balance should
match the reconciliation report Bookstead showed you.
`;
  return [
    { name: "gnucash/transactions.csv", content: lines.join("\r\n") + "\r\n" },
    { name: "gnucash/accounts.csv", content: acctLines.join("\r\n") + "\r\n" },
    { name: "gnucash/README.txt", content: readme },
  ];
}

export function exportManager(ledger: Ledger): ExportFile[] {
  // TSV cells: strip tabs/newlines and neutralize leading formula characters.
  const tc = (raw: string) => {
    let s = (raw ?? "").replace(/[\t\r\n]/g, " ");
    if (/^[=+\-@]/.test(s) && !isNumber(s)) s = "'" + s;
    return s;
  };
  const tsv = (rows: string[][]) => rows.map((r) => r.map(tc).join("\t")).join("\r\n") + "\r\n";

  const coa = tsv([
    ["Name", "Code"],
    ...[...ledger.accounts.values()].map((a) => [a.name.replace(/\t/g, " "), a.number ?? ""]),
  ]);
  const customers = tsv([
    ["Name", "Email", "Business Identifier", "Address"],
    ...ledger.customers.map((c) => [c.name.replace(/\t/g, " "), c.email ?? "", "", (c.address ?? []).join(", ").replace(/\t/g, " ")]),
  ]);
  const suppliers = tsv([
    ["Name", "Email", "Business Identifier", "Address"],
    ...ledger.vendors.map((v) => [v.name.replace(/\t/g, " "), v.email ?? "", "", (v.address ?? []).join(", ").replace(/\t/g, " ")]),
  ]);

  const readme = `Manager.io import — Bookstead migration pack
=============================================

Manager's Batch Create accepts tab-separated rows pasted from the
clipboard, and its exact column layout is minted by YOUR business file —
so the reliable path is Manager's own template-mirroring flow:

STEP 1 — Entities (simple, do these first)
  For each of: Settings > Chart of Accounts, Customers tab, Suppliers tab
   1. Click "Batch Create" then "Copy to clipboard" — this copies the
      column template for YOUR Manager version.
   2. Paste it into a spreadsheet. Open our .tsv file alongside and copy
      our columns into the matching template columns (Name, Code, ...).
   3. Copy the filled sheet INCLUDING the header row, paste back into
      Manager's Batch Create box, click Next, review, commit.

STEP 2 — Opening balances or full history (choose one)
  A. Opening balances only (fast, recommended for most):
     Enter the balances from opening-balances.txt under
     Settings > Starting Balances as of your cutover date.
  B. Full transaction history via Journal Entries:
     Manager encodes multi-line journal entries in a version-specific
     column layout. Discover it exactly as the official guide suggests:
     create ONE 2-line journal entry by hand, open Journal Entries >
     Batch Update > Copy to clipboard, and mirror that layout using
     transactions from the generic-csv pack. (Bookstead keeps this
     manual on purpose — emitting an undocumented layout blind is how
     migrations silently corrupt.)

Why so careful? Manager ignores batch rows whose references don't match
its internal UUIDs; the template-mirroring flow guarantees your columns
are the ones your version expects.
`;

  // opening balances at the ledger's last date
  let last = "";
  for (const t of ledger.transactions) if (t.date > last) last = t.date;
  const bal = new Map<string, number>();
  for (const t of ledger.transactions) for (const l of t.lines) {
    const k = l.account.toLowerCase();
    bal.set(k, (bal.get(k) ?? 0) + l.debit - l.credit);
  }
  const obLines = [`Starting balances as of ${last} (debit-positive):`, ""];
  for (const a of ledger.accounts.values()) {
    if (!isBalanceSheet(a.cls)) continue;
    const b = bal.get(a.name.toLowerCase()) ?? 0;
    if (b !== 0) obLines.push(`${a.name}\t${money(b)}`);
  }

  return [
    { name: "manager-io/chart-of-accounts.tsv", content: coa },
    { name: "manager-io/customers.tsv", content: customers },
    { name: "manager-io/suppliers.tsv", content: suppliers },
    { name: "manager-io/opening-balances.txt", content: obLines.join("\r\n") + "\r\n" },
    { name: "manager-io/README.txt", content: readme },
  ];
}

export function exportGeneric(ledger: Ledger): ExportFile[] {
  const txLines = ["transaction_id,type,date,num,name,memo,account,debit,credit,line_memo,line_name"];
  for (const t of ledger.transactions) {
    for (const l of t.lines) {
      txLines.push(
        [q(t.id), q(t.type), t.date, q(t.num ?? ""), q(t.name ?? ""), q(t.memo ?? ""), q(l.account), l.debit ? money(l.debit) : "", l.credit ? money(l.credit) : "", q(l.memo ?? ""), q(l.name ?? "")].join(",")
      );
    }
  }
  const acctLines = ["name,qb_type,class,number,description"];
  for (const a of ledger.accounts.values()) acctLines.push([q(a.name), a.type, a.cls, q(a.number ?? ""), q(a.description ?? "")].join(","));
  const custLines = ["name,company,email,phone,address"];
  for (const c of ledger.customers) custLines.push([q(c.name), q(c.company ?? ""), q(c.email ?? ""), q(c.phone ?? ""), q((c.address ?? []).join(", "))].join(","));
  const vendLines = ["name,company,email,phone,address"];
  for (const v of ledger.vendors) vendLines.push([q(v.name), q(v.company ?? ""), q(v.email ?? ""), q(v.phone ?? ""), q((v.address ?? []).join(", "))].join(","));
  const itemLines = ["name,type,description,price"];
  for (const i of ledger.items) itemLines.push([q(i.name), i.type, q(i.description ?? ""), i.price != null ? money(i.price) : ""].join(","));

  const json = JSON.stringify(
    {
      accounts: [...ledger.accounts.values()],
      customers: ledger.customers,
      vendors: ledger.vendors,
      items: ledger.items,
      transactions: ledger.transactions,
    },
    null,
    1
  );

  return [
    { name: "generic-csv/transactions.csv", content: txLines.join("\r\n") + "\r\n" },
    { name: "generic-csv/accounts.csv", content: acctLines.join("\r\n") + "\r\n" },
    { name: "generic-csv/customers.csv", content: custLines.join("\r\n") + "\r\n" },
    { name: "generic-csv/vendors.csv", content: vendLines.join("\r\n") + "\r\n" },
    { name: "generic-csv/items.csv", content: itemLines.join("\r\n") + "\r\n" },
    { name: "generic-csv/ledger.json", content: json },
  ];
}

export function exportAll(ledger: Ledger): ExportFile[] {
  return [...exportGnuCash(ledger), ...exportManager(ledger), ...exportGeneric(ledger)];
}
