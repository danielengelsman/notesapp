"use client";

/**
 * The Bookstead app: drop QuickBooks Desktop exports → rebuild the ledger →
 * reconcile against QuickBooks' own trial balance → download the archive and
 * migration packs. Every byte of work happens in this tab.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import JSZip from "jszip";
import { parseIif, IifResult } from "@/engine/iif";
import { parseTxnReport, TxnReportResult } from "@/engine/txnreport";
import { parseTrialBalance, TrialBalanceParse } from "@/engine/trialbalance";
import { buildLedger } from "@/engine/ledger";
import { reconcile, ReconReport, tbAsOfIso } from "@/engine/reconcile";
import { generateArchive } from "@/engine/archive";
import { exportAll } from "@/engine/exporters";
import { formatCents } from "@/engine/money";
import { Ledger, ParseWarning } from "@/engine/types";
import { verifyLicense, License } from "@/lib/license";
import { DEMO_COMPANY, DEMO_IIF, DEMO_TXN_CSV, DEMO_TB_CSV } from "./demo-data";

type FileKind = "iif" | "txn" | "tb" | "unknown";
interface LoadedFile { name: string; text: string; kind: FileKind; }

function classify(name: string, text: string): FileKind {
  const head = text.slice(0, 3000);
  if (/^!(HDR|ACCNT|CUST|VEND|INVITEM|TRNS)/m.test(head) || name.toLowerCase().endsWith(".iif")) return "iif";
  if (/trial balance/i.test(head)) return "tb";
  if (/trans\s*#/i.test(head) || (/debit/i.test(head) && /credit/i.test(head) && /date/i.test(head))) return "txn";
  if (/debit/i.test(head) && /credit/i.test(head)) return "tb";
  return "unknown";
}

const KIND_LABEL: Record<FileKind, string> = {
  iif: "Lists (IIF)",
  txn: "Transaction detail report",
  tb: "Trial balance report",
  unknown: "Unrecognized",
};

interface Results {
  ledger: Ledger;
  recon: ReconReport | null;
  warnings: ParseWarning[];
  txnRes: TxnReportResult;
  isDemo: boolean;
}

export default function App() {
  const [files, setFiles] = useState<LoadedFile[]>([]);
  const [company, setCompany] = useState("");
  const [results, setResults] = useState<Results | null>(null);
  const [busy, setBusy] = useState(false);
  const [licenseKey, setLicenseKey] = useState("");
  const [license, setLicense] = useState<License | null>(null);
  const [licenseErr, setLicenseErr] = useState<string | null>(null);
  const [showAllRows, setShowAllRows] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("bookstead.license");
    if (saved) verifyLicense(saved).then((l) => { if (l) { setLicense(l); setLicenseKey(saved); } });
  }, []);

  const addFiles = useCallback(async (list: FileList | File[]) => {
    const loaded: LoadedFile[] = [];
    for (const f of Array.from(list)) {
      const text = await f.text();
      loaded.push({ name: f.name, text, kind: classify(f.name, text) });
    }
    setFiles((prev) => [...prev.filter((p) => !loaded.some((l) => l.name === p.name)), ...loaded]);
    setResults(null);
  }, []);

  const loadDemo = useCallback(() => {
    setFiles([
      { name: "lists.iif", text: DEMO_IIF, kind: "iif" },
      { name: "txn-detail.csv", text: DEMO_TXN_CSV, kind: "txn" },
      { name: "trial-balance-2025.csv", text: DEMO_TB_CSV, kind: "tb" },
    ]);
    setCompany(DEMO_COMPANY);
    setResults(null);
  }, []);

  const have = useMemo(() => ({
    iif: files.some((f) => f.kind === "iif"),
    txn: files.some((f) => f.kind === "txn"),
    tb: files.some((f) => f.kind === "tb"),
  }), [files]);

  const run = useCallback(() => {
    setBusy(true);
    setTimeout(() => {
      try {
        const iifs: IifResult[] = files.filter((f) => f.kind === "iif").map((f) => parseIif(f.text, f.name));
        const txnFiles = files.filter((f) => f.kind === "txn");
        const txnRes: TxnReportResult = parseTxnReport(txnFiles.map((f) => f.text).join("\n"), txnFiles.map((f) => f.name).join(", "));
        const ledger = buildLedger(iifs, txnRes.transactions);
        const tbFile = files.find((f) => f.kind === "tb");
        let recon: ReconReport | null = null;
        const warnings: ParseWarning[] = [...ledger.warnings, ...txnRes.warnings];
        if (tbFile) {
          const tb: TrialBalanceParse = parseTrialBalance(tbFile.text, tbFile.name);
          warnings.push(...tb.warnings);
          const asOf = tbAsOfIso(tb.report) ?? txnRes.dateRange?.max ?? "2026-12-31";
          const rangeStart = `${asOf.slice(0, 4)}-01-01`;
          recon = reconcile(ledger, tb.report, { rangeStart, asOf });
        }
        const isDemo = files.some((f) => f.text === DEMO_TXN_CSV);
        setResults({ ledger, recon, warnings, txnRes, isDemo });
      } finally {
        setBusy(false);
      }
    }, 30);
  }, [files]);

  const applyLicense = useCallback(async () => {
    setLicenseErr(null);
    const l = await verifyLicense(licenseKey);
    if (l) {
      setLicense(l);
      localStorage.setItem("bookstead.license", licenseKey.trim());
    } else {
      setLicenseErr("That key didn't verify. Keys look like BKST1.xxxx.xxxx — paste the whole thing.");
    }
  }, [licenseKey]);

  const download = useCallback((name: string, content: string | Blob, type = "text/html") => {
    const blob = content instanceof Blob ? content : new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const downloadArchive = useCallback(() => {
    if (!results) return;
    const html = generateArchive(results.ledger, results.recon, {
      companyName: company || "My Company",
      generatedAt: new Date().toISOString(),
      appVersion: "1.0.0",
    });
    download(`${(company || "bookstead-archive").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-archive.html`, html);
  }, [results, company, download]);

  const downloadPack = useCallback(async () => {
    if (!results) return;
    const zip = new JSZip();
    for (const f of exportAll(results.ledger)) zip.file(f.name, f.content);
    const blob = await zip.generateAsync({ type: "blob" });
    download(`${(company || "bookstead").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-migration-pack.zip`, blob);
  }, [results, company, download]);

  const unlocked = license != null || (results?.isDemo ?? false);

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <h1 className="text-3xl font-bold">Evacuate a company file</h1>
      <p className="mt-2 max-w-2xl text-slate2">
        Everything on this page happens in your browser. Feel free to open your
        network inspector — or turn your wifi off — and carry on.
      </p>

      {/* STEP 1: files */}
      <section className="mt-8 rounded-2xl border border-rule bg-cream p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">1 · Your QuickBooks exports</h2>
          <button onClick={loadDemo} className="rounded-lg border border-stead px-3 py-1.5 text-sm font-semibold text-stead hover:bg-verified-bg">
            Try the sample company
          </button>
        </div>
        <p className="mt-2 text-sm text-slate2">
          From QuickBooks Desktop: <strong>Lists → Export (IIF)</strong> for accounts, customers, vendors, items ·{" "}
          <strong>Reports → Custom Transaction Detail</strong> (all dates, all columns) exported as CSV ·{" "}
          <strong>Reports → Trial Balance</strong> exported as CSV.{" "}
          <Link href="/how-it-works/" className="text-stead underline">Step-by-step guide →</Link>
        </p>
        <div
          className="mt-4 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-rule bg-paper p-6 text-center hover:border-stead"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
        >
          <p className="font-semibold">Drop your export files here (or click to choose)</p>
          <p className="mt-1 text-sm text-slate2">.iif and .csv — multiple files welcome</p>
          <input ref={inputRef} type="file" multiple accept=".iif,.csv,.txt,.tsv" className="hidden"
            onChange={(e) => e.target.files && addFiles(e.target.files)} />
        </div>
        {files.length > 0 && (
          <ul className="mt-4 grid gap-2 sm:grid-cols-3">
            {files.map((f) => (
              <li key={f.name} className={`rounded-lg border px-3 py-2 text-sm ${f.kind === "unknown" ? "border-ledgerred bg-ledgerred-bg" : "border-rule bg-paper"}`}>
                <div className="truncate font-semibold">{f.name}</div>
                <div className="text-slate2">{KIND_LABEL[f.kind]}</div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Company name (for the archive)"
            className="w-72 rounded-lg border border-rule bg-paper px-3 py-2"
          />
          <button
            onClick={run}
            disabled={!have.txn || busy}
            className="rounded-lg bg-stead px-5 py-2.5 font-semibold text-white shadow disabled:opacity-40 hover:bg-pine"
          >
            {busy ? "Rebuilding your ledger…" : "Run the free check"}
          </button>
          {!have.txn && files.length > 0 && (
            <span className="text-sm text-ledgerred">Need the transaction detail report to proceed.</span>
          )}
          {have.txn && !have.tb && (
            <span className="text-sm text-copper">No trial balance file — we can convert, but we can&apos;t <em>prove</em> it. Add the TB export for verification.</span>
          )}
        </div>
      </section>

      {/* STEP 2: results */}
      {results && (
        <section className="mt-8 rounded-2xl border border-rule bg-cream p-6">
          <h2 className="text-xl font-bold">2 · The check</h2>
          {results.recon ? (
            results.recon.perfect ? (
              <div className="mt-3 rounded-xl bg-verified-bg p-4 text-verified">
                <div className="text-lg font-bold">✓ Your rebuilt books match QuickBooks to the penny.</div>
                <div className="tabular mt-1 text-sm">
                  {results.recon.matched} accounts reconciled exactly · total debits {formatCents(results.recon.computedTotalDebit)} = QuickBooks {formatCents(results.recon.qbTotalDebit ?? 0)} · as of {results.recon.asOf}
                </div>
              </div>
            ) : (
              <div className="mt-3 rounded-xl bg-ledgerred-bg p-4 text-ledgerred">
                <div className="text-lg font-bold">
                  ⚠ {results.recon.mismatched + results.recon.missingInRebuild + results.recon.missingInQb} account(s) don&apos;t reconcile.
                </div>
                <div className="mt-1 text-sm">
                  Total absolute difference: {formatCents(results.recon.totalDeltaAbs)}. The usual cause is a filtered
                  transaction export — re-export with <em>All</em> dates and <em>All</em> accounts. You pay nothing until this is green.
                </div>
              </div>
            )
          ) : (
            <div className="mt-3 rounded-xl bg-paper p-4 text-slate2">
              Converted without verification (no trial balance provided).
            </div>
          )}

          <div className="tabular mt-5 grid grid-cols-2 gap-3 text-center sm:grid-cols-5">
            {[
              [results.ledger.transactions.length.toLocaleString(), "transactions"],
              [results.ledger.accounts.size.toString(), "accounts"],
              [results.ledger.customers.length.toString(), "customers"],
              [results.ledger.vendors.length.toString(), "vendors"],
              [results.txnRes.dateRange ? `${results.txnRes.dateRange.min.slice(0, 4)}–${results.txnRes.dateRange.max.slice(0, 4)}` : "—", "years covered"],
            ].map(([n, l]) => (
              <div key={l as string} className="rounded-lg border border-rule bg-paper p-3">
                <div className="text-xl font-bold">{n}</div>
                <div className="text-xs uppercase tracking-wide text-slate2">{l}</div>
              </div>
            ))}
          </div>

          {results.recon && (
            <div className="mt-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Account-by-account</h3>
                <label className="flex items-center gap-2 text-sm text-slate2">
                  <input type="checkbox" checked={showAllRows} onChange={(e) => setShowAllRows(e.target.checked)} />
                  show matching rows too
                </label>
              </div>
              <div className="mt-2 max-h-80 overflow-auto rounded-lg border border-rule">
                <table className="tabular w-full text-sm">
                  <thead className="sticky top-0 bg-paper">
                    <tr className="text-left text-xs uppercase tracking-wide text-slate2">
                      <th className="p-2">Account</th>
                      <th className="p-2 text-right">QuickBooks</th>
                      <th className="p-2 text-right">Rebuilt</th>
                      <th className="p-2 text-right">Δ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.recon.rows
                      .filter((r) => showAllRows || r.status !== "match")
                      .slice(0, 500)
                      .map((r) => (
                        <tr key={r.account} className={`border-t border-rule ${r.status !== "match" ? "bg-ledgerred-bg" : ""}`}>
                          <td className="p-2">{r.account}{r.note ? <span className="block text-xs text-slate2">{r.note}</span> : null}</td>
                          <td className="p-2 text-right">{r.qbDebit != null ? formatCents(r.qbDebit) : r.qbCredit != null ? `(${formatCents(r.qbCredit)})` : "—"}</td>
                          <td className="p-2 text-right">{formatCents(r.computedBalance)}</td>
                          <td className={`p-2 text-right font-bold ${r.deltaCents === 0 ? "text-verified" : "text-ledgerred"}`}>{formatCents(r.deltaCents)}</td>
                        </tr>
                      ))}
                    {!showAllRows && results.recon.rows.every((r) => r.status === "match") && (
                      <tr><td colSpan={4} className="p-4 text-center text-verified">Every account matches. Tick the box to see them all.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {results.warnings.filter((w) => w.severity !== "info").length > 0 && (
            <details className="mt-4 rounded-lg border border-rule bg-paper p-3 text-sm">
              <summary className="cursor-pointer font-semibold">
                {results.warnings.filter((w) => w.severity !== "info").length} warning(s) from parsing
              </summary>
              <ul className="mt-2 space-y-1 text-slate2">
                {results.warnings.filter((w) => w.severity !== "info").slice(0, 50).map((w, i) => (
                  <li key={i}><strong>[{w.where}{w.line ? `:${w.line}` : ""}]</strong> {w.message}</li>
                ))}
              </ul>
            </details>
          )}
        </section>
      )}

      {/* STEP 3: downloads */}
      {results && (
        <section className="mt-8 rounded-2xl border border-rule bg-cream p-6">
          <h2 className="text-xl font-bold">3 · Walk out with everything</h2>
          {unlocked ? (
            <>
              {results.isDemo && !license && (
                <p className="mt-2 rounded-lg bg-verified-bg px-3 py-2 text-sm text-verified">
                  Sample company — downloads unlocked so you can inspect exactly what you&apos;d get.
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-4">
                <button onClick={downloadArchive} className="rounded-lg bg-stead px-5 py-3 font-semibold text-white shadow hover:bg-pine">
                  Download the archive (.html)
                </button>
                <button onClick={downloadPack} className="rounded-lg border-2 border-stead px-5 py-3 font-semibold text-stead hover:bg-verified-bg">
                  Download the migration pack (.zip)
                </button>
              </div>
              <p className="mt-3 text-sm text-slate2">
                The archive is one self-contained file: open it in any browser, forever — no Bookstead required.
                The pack contains GnuCash, Manager.io, and generic CSV/JSON exports, each with import instructions.
              </p>
            </>
          ) : (
            <div className="mt-3 max-w-xl">
              <p className="text-slate2">
                The verification above was free. Unlocking downloads for your own company file is a one-time purchase —{" "}
                <Link href="/pricing/" className="font-semibold text-stead underline">$149 (launch: $99)</Link>, refunded
                without questions if anything&apos;s wrong.
              </p>
              <div className="mt-3 flex gap-2">
                <input
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  placeholder="Paste your license key (BKST1.…)"
                  className="flex-1 rounded-lg border border-rule bg-paper px-3 py-2 font-mono text-sm"
                />
                <button onClick={applyLicense} className="rounded-lg bg-stead px-4 py-2 font-semibold text-white hover:bg-pine">
                  Unlock
                </button>
              </div>
              {licenseErr && <p className="mt-2 text-sm text-ledgerred">{licenseErr}</p>}
            </div>
          )}
          {license && (
            <p className="mt-3 text-xs text-slate2">Licensed to {license.email} · {license.tier} · verified locally via Ed25519 — no server was asked.</p>
          )}
        </section>
      )}
    </main>
  );
}
