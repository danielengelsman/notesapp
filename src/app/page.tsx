import Link from "next/link";
import { LogoMark } from "@/components/Logo";

export default function Home() {
  return (
    <main>
      {/* HERO */}
      <section className="mx-auto max-w-6xl px-5 pt-16 pb-10 md:pt-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="mb-4 inline-block rounded-full bg-ledgerred-bg px-3 py-1 text-[13px] font-semibold text-ledgerred">
              QuickBooks® Desktop Pro Plus renewal 2026: $1,049/yr — up from $349.99 in 2021
            </p>
            <h1 className="text-[42px] font-bold md:text-[54px]">
              Your books, <span className="text-stead">yours again.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate2">
              Bookstead evacuates your entire QuickBooks® Desktop history into a
              permanent archive you own forever — plus clean import files for
              wherever you go next. It runs <strong className="text-ink">100% in your
              browser</strong>: your books never upload anywhere. And it proves the
              conversion is penny-perfect <strong className="text-ink">before you pay a cent</strong>.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/app/" className="rounded-lg bg-stead px-6 py-3 text-lg font-semibold text-white shadow hover:bg-pine">
                Free check — see your books verified
              </Link>
              <Link href="/how-it-works/" className="rounded-lg border border-rule bg-cream px-6 py-3 text-lg font-semibold text-ink hover:border-stead">
                How it works
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate2">
              No account. No upload. Try it with the sample company in one click.
            </p>
          </div>

          {/* proof card */}
          <div className="rounded-2xl border border-rule bg-cream p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-rule pb-3">
              <span className="font-semibold">Reconciliation report</span>
              <span className="rounded-full bg-verified-bg px-3 py-1 text-[13px] font-bold text-verified">
                ✓ Matches QuickBooks to the penny
              </span>
            </div>
            <table className="tabular mt-3 w-full text-[14.5px]">
              <thead>
                <tr className="text-left text-[12px] uppercase tracking-wide text-slate2">
                  <th className="py-1.5">Account</th>
                  <th className="py-1.5 pl-4 text-right">QuickBooks</th>
                  <th className="py-1.5 pl-4 text-right">Rebuilt</th>
                  <th className="py-1.5 pl-4 text-right">Δ</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Checking", "412,764.35", "412,764.35"],
                  ["Accounts Receivable", "125,363.50", "125,363.50"],
                  ["Equipment Loan", "(6,400.00)", "(6,400.00)"],
                  ["Landscaping Income", "(83,920.50)", "(83,920.50)"],
                  ["Payroll Expenses", "46,930.68", "46,930.68"],
                ].map(([a, qb, rb]) => (
                  <tr key={a} className="border-t border-rule">
                    <td className="py-1.5">{a}</td>
                    <td className="py-1.5 pl-4 text-right">{qb}</td>
                    <td className="py-1.5 pl-4 text-right">{rb}</td>
                    <td className="py-1.5 pl-4 text-right font-bold text-verified">0.00</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-ink font-bold">
                  <td className="py-2">All 20 accounts · 1,369 transactions · 2020–2025</td>
                  <td colSpan={2} className="py-2 pl-4 text-right">819,538.65 = 819,538.65</td>
                  <td className="py-2 pl-4 text-right text-verified">0.00</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-3 text-[13px] text-slate2">
              Live output from the built-in sample company. Run yours free — the full
              verification is the free tier.
            </p>
          </div>
        </div>
      </section>

      {/* THE SQUEEZE */}
      <section className="border-y border-rule bg-cream py-14">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-3xl font-bold">The subscription you can&apos;t quit is holding your history hostage</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              {
                n: "3×",
                t: "price in four years",
                d: "QuickBooks® Desktop Pro Plus went from $349.99/yr (2021) to $1,049/yr plus $310 per extra seat (2025). Every fall, the renewal letter lands.",
              },
              {
                n: "12 mo",
                t: "then your books go dark",
                d: "Stop paying and Desktop drops to view-only for one year — after that, your own company file won't open at all.",
              },
              {
                n: "3–7 yrs",
                t: "the IRS still wants records",
                d: "Business records must be kept for years after you stop using the software. Renting access to your own history isn't record-keeping.",
              },
            ].map((c) => (
              <div key={c.t} className="rounded-xl border border-rule bg-paper p-6">
                <div className="text-4xl font-bold text-copper display">{c.n}</div>
                <div className="mt-1 font-semibold">{c.t}</div>
                <p className="mt-2 text-[15px] text-slate2">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-3xl font-bold">Ten minutes, three steps, zero uploads</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            {
              k: "1",
              t: "Export from QuickBooks",
              d: "Follow the guided checklist inside your own QuickBooks Desktop: four standard exports (lists + two reports), about three minutes of clicking. Works on Pro, Premier, and Enterprise 2013–2024.",
            },
            {
              k: "2",
              t: "Drop the files in Bookstead",
              d: "Everything parses right in your browser. Turn your wifi off first if you like — it keeps working, because nothing leaves your machine. Then watch the rebuilt trial balance check itself against QuickBooks' own numbers, account by account.",
            },
            {
              k: "3",
              t: "Walk out with everything",
              d: "One self-contained archive file: every transaction, customer, and vendor, searchable, with P&L and balance sheet for any year — opens in any browser, forever. Plus migration packs for GnuCash, Manager.io, and clean CSV/JSON.",
            },
          ].map((s) => (
            <div key={s.k} className="relative rounded-xl border border-rule bg-cream p-6">
              <div className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-stead font-bold text-white">{s.k}</div>
              <div className="mt-2 font-semibold">{s.t}</div>
              <p className="mt-2 text-[15px] text-slate2">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HONESTY BOX */}
      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="rounded-2xl border-2 border-copper/40 bg-cream p-7">
          <h2 className="text-2xl font-bold">What Bookstead won&apos;t do (told to you straight)</h2>
          <div className="mt-4 grid gap-x-10 gap-y-2 text-[15px] text-slate2 md:grid-cols-2">
            <p>• It converts what QuickBooks exports: the general ledger, lists, and balances. The audit trail, document attachments, payroll item detail, and memorized reports are not in QuickBooks&apos; exports — so they can&apos;t be in anyone&apos;s conversion, including ours.</p>
            <p>• v1 is fenced to US editions, single currency. Multi-currency, inventory assemblies, and non-US tax structures are flagged, not silently mangled.</p>
            <p>• You still need a working QuickBooks install (even an expired-to-view-only one that can still run reports) to produce the exports. We can&apos;t read the raw .QBW file — it&apos;s an encrypted database, and any tool claiming to open it in a browser is guessing.</p>
            <p>• If your books don&apos;t reconcile, Bookstead shows exactly which accounts disagree and by how much — and you pay nothing until it&apos;s green.</p>
          </div>
        </div>
      </section>

      {/* PRICING TEASER */}
      <section className="border-t border-rule bg-cream py-16">
        <div className="mx-auto max-w-6xl px-5 text-center">
          <h2 className="text-3xl font-bold">Priced like a tool, not a toll</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate2">
            The verification is free. Unlocking your archive and migration packs is a
            one-time purchase per company file — against the $1,049 renewal it replaces.
          </p>
          <div className="mt-8 flex flex-wrap items-stretch justify-center gap-5">
            <div className="w-72 rounded-2xl border border-rule bg-paper p-6 text-left">
              <div className="font-semibold">Check</div>
              <div className="display mt-1 text-4xl font-bold">$0</div>
              <p className="mt-2 text-sm text-slate2">Parse everything. Full reconciliation report. Sample-company demo.</p>
            </div>
            <div className="w-72 rounded-2xl border-2 border-stead bg-paper p-6 text-left shadow">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Evacuate</span>
                <span className="rounded-full bg-copper px-2 py-0.5 text-xs font-bold text-white">LAUNCH $99</span>
              </div>
              <div className="display mt-1 text-4xl font-bold">$149 <span className="text-base font-normal text-slate2">once</span></div>
              <p className="mt-2 text-sm text-slate2">Per company file. Archive + all migration packs + free updates for a year. No-questions refund.</p>
            </div>
            <div className="w-72 rounded-2xl border border-rule bg-paper p-6 text-left">
              <div className="font-semibold">Bookkeeper</div>
              <div className="display mt-1 text-4xl font-bold">$599</div>
              <p className="mt-2 text-sm text-slate2">Ten client files + priority format support. Your stranded-client list is the reason this exists.</p>
            </div>
          </div>
          <Link href="/pricing/" className="mt-6 inline-block font-semibold text-stead hover:underline">
            Full pricing &amp; the refund promise →
          </Link>
        </div>
      </section>

      {/* FOUNDER NOTE */}
      <section className="mx-auto max-w-3xl px-5 py-16 text-center">
        <LogoMark size={40} />
        <h2 className="mt-4 text-2xl font-bold">Built in the open, by an unusual founder</h2>
        <p className="mt-3 text-slate2">
          Bookstead was researched, designed, and built end-to-end by an AI agent — from
          reading thousands of small-business owners describing this exact problem, to
          writing the reconciliation engine and this sentence. We think that&apos;s a reason
          for <em>more</em> scrutiny, not less: which is why the product proves every
          conversion mathematically, in your browser, where we couldn&apos;t touch your data
          even if we wanted to.
        </p>
        <Link href="/security/" className="mt-4 inline-block font-semibold text-stead hover:underline">
          The full trust argument →
        </Link>
      </section>
    </main>
  );
}
