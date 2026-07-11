import Link from "next/link";

export const metadata = { title: "How it works — Bookstead" };

export default function HowItWorks() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="text-4xl font-bold">How it works</h1>
      <p className="mt-3 text-lg text-slate2">
        Bookstead reads the files QuickBooks® Desktop already knows how to export,
        rebuilds your entire double-entry ledger from them in your browser, and
        proves the rebuild against QuickBooks&apos; own trial balance. Ten minutes,
        start to finish.
      </p>

      <h2 className="mt-10 text-2xl font-bold">Step 1 — Export four things from QuickBooks (~3 minutes)</h2>
      <div className="mt-4 space-y-4">
        {[
          {
            t: "A · Lists (one IIF file)",
            d: <>In QuickBooks Desktop: <em>File → Utilities → Export → Lists to IIF Files</em>. Tick <strong>Chart of Accounts, Customers, Vendors, Items</strong>. Save the .iif file. This carries your account types, contact records, and item catalog.</>,
          },
          {
            t: "B · Every transaction (one CSV)",
            d: <>Run <em>Reports → Custom Reports → Transaction Detail</em>. Set <strong>Dates: All</strong>. In <em>Customize Report → Display</em>, make sure these columns are on: <strong>Trans #, Type, Date, Num, Name, Memo, Account, Debit, Credit</strong>. Remove any filters (Accounts: All). Then <em>Excel → Create New Worksheet → Create a comma separated values (.csv) file</em>.</>,
          },
          {
            t: "C · The referee (one CSV)",
            d: <>Run <em>Reports → Accountant &amp; Taxes → Trial Balance</em>, dates set to your last complete fiscal year (or &quot;All&quot;). Export as CSV the same way. This is the report Bookstead checks itself against — QuickBooks&apos; own numbers.</>,
          },
          {
            t: "D · (Optional) Open invoices",
            d: <>If you&apos;re migrating to a new ledger, an <em>Open Invoices</em> report helps you carry open A/R. The archive works without it.</>,
          },
        ].map((s) => (
          <div key={s.t} className="rounded-xl border border-rule bg-cream p-5">
            <div className="font-bold">{s.t}</div>
            <p className="mt-1 text-[15px] text-slate2">{s.d}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 rounded-lg bg-paper p-4 text-sm text-slate2">
        <strong>Subscription already lapsed?</strong> QuickBooks Desktop&apos;s view-only mode
        (the first 12 months after non-renewal) can still run reports and exports.
        If you&apos;re in that window, do this now — after it closes, the file won&apos;t open at all.
      </p>

      <h2 className="mt-10 text-2xl font-bold">Step 2 — Drop the files into Bookstead</h2>
      <p className="mt-3 text-slate2">
        Open <Link href="/app/" className="font-semibold text-stead underline">the app</Link> and
        drop all the files in. Bookstead identifies each one, parses them
        <strong> entirely in your browser</strong> (wifi off works fine), rebuilds the
        ledger, and re-computes your trial balance from raw transaction lines —
        debits equal credits per transaction, balances rolled up per account,
        prior-year profit folded into retained earnings, the works.
      </p>

      <h2 className="mt-10 text-2xl font-bold">Step 3 — Read the verdict</h2>
      <p className="mt-3 text-slate2">
        The reconciliation report compares the rebuild against your QuickBooks trial
        balance, account by account, in integer cents. Green means{" "}
        <strong>penny-perfect: every account matches exactly</strong>. Red shows you the
        exact account and delta — the usual cause is an accidentally filtered export,
        and the fix is a re-export. <strong>You pay nothing until it&apos;s green.</strong>
      </p>

      <h2 className="mt-10 text-2xl font-bold">Step 4 — Download your property</h2>
      <ul className="mt-3 list-disc space-y-2 pl-6 text-slate2">
        <li>
          <strong className="text-ink">The Bookstead Archive</strong> — one self-contained .html file:
          every transaction searchable, every account drillable, trial balance / P&amp;L /
          balance sheet for any year, printable to PDF. It opens in any browser, on any
          machine, forever. No Bookstead account, no internet, no software to keep alive.
        </li>
        <li>
          <strong className="text-ink">The migration pack</strong> — a zip with import-ready files and
          per-destination instructions: GnuCash (multi-split CSV + account tree), Manager.io
          (Batch Create TSVs + the official template-mirroring guide), and generic CSV/JSON
          for anything else.
        </li>
      </ul>

      <h2 className="mt-10 text-2xl font-bold">What v1 deliberately doesn&apos;t do</h2>
      <p className="mt-3 text-slate2">
        QuickBooks&apos; exports don&apos;t contain the audit trail, attachments, payroll item
        detail, or memorized reports — so no converter can carry them, and we won&apos;t
        pretend otherwise. v1 is fenced to US editions and single currency; files with
        multi-currency or inventory assemblies get flagged clearly instead of quietly
        mangled. Your accountant will find the converted ledger boring. That&apos;s the point.
      </p>

      <div className="mt-10">
        <Link href="/app/" className="rounded-lg bg-stead px-6 py-3 text-lg font-semibold text-white shadow hover:bg-pine">
          Run the free check
        </Link>
      </div>
    </main>
  );
}
