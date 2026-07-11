import Link from "next/link";

export const metadata = { title: "Pricing — Bookstead" };

export default function Pricing() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="text-center text-4xl font-bold">One price. Once.</h1>
      <p className="mx-auto mt-3 max-w-2xl text-center text-lg text-slate2">
        Bookstead exists because renting access to your own history is absurd.
        Pricing it as a subscription would be a punchline.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-rule bg-cream p-7">
          <h2 className="text-lg font-bold">Check</h2>
          <div className="display mt-2 text-5xl font-bold">$0</div>
          <ul className="mt-4 space-y-2 text-[15px] text-slate2">
            <li>✓ Parse all your exports</li>
            <li>✓ Full ledger rebuild</li>
            <li>✓ Complete reconciliation report — every account, every delta</li>
            <li>✓ Sample company with downloads unlocked</li>
          </ul>
          <p className="mt-4 text-sm text-slate2">The proof is free. Forever. That&apos;s the whole point of the product.</p>
        </div>

        <div className="relative rounded-2xl border-2 border-stead bg-cream p-7 shadow-md">
          <span className="absolute -top-3 right-6 rounded-full bg-copper px-3 py-1 text-xs font-bold text-white">LAUNCH: $99 (first 8 weeks)</span>
          <h2 className="text-lg font-bold">Evacuate</h2>
          <div className="display mt-2 text-5xl font-bold">$149</div>
          <div className="text-sm text-slate2">one-time, per company file</div>
          <ul className="mt-4 space-y-2 text-[15px] text-slate2">
            <li>✓ Everything in Check</li>
            <li>✓ The Bookstead Archive — one self-contained file, yours forever</li>
            <li>✓ Migration packs: GnuCash, Manager.io, generic CSV/JSON</li>
            <li>✓ Format updates free for 12 months (it keeps working after — updates, not access)</li>
            <li>✓ 30-day refund promise: anything wrong with your conversion, money back</li>
          </ul>
          <Link href="/app/" className="mt-5 block rounded-lg bg-stead py-3 text-center font-semibold text-white hover:bg-pine">
            Start with the free check
          </Link>
        </div>

        <div className="rounded-2xl border border-rule bg-cream p-7">
          <h2 className="text-lg font-bold">Bookkeeper</h2>
          <div className="display mt-2 text-5xl font-bold">$599</div>
          <div className="text-sm text-slate2">ten client files</div>
          <ul className="mt-4 space-y-2 text-[15px] text-slate2">
            <li>✓ Ten Evacuate licenses to use across your client list</li>
            <li>✓ Priority handling for weird exports (you&apos;ll have them)</li>
            <li>✓ $49/file after the ten</li>
          </ul>
          <p className="mt-4 text-sm text-slate2">
            If you keep books for stranded QuickBooks Desktop clients, you are the
            reason this product exists. At service-bureau prices ($275–$449 per file), the pack pays for itself by the second client.
          </p>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-3xl space-y-6">
        <div className="rounded-xl border border-rule bg-cream p-6">
          <h2 className="font-bold">Why you can trust the price with your books</h2>
          <p className="mt-2 text-[15px] text-slate2">
            You see the complete verification <em>before</em> paying: which accounts match,
            which don&apos;t, to the penny. If it isn&apos;t green, you don&apos;t pay. If it&apos;s green and the delivered archive or exports don&apos;t live up to it,
            30-day refund, no argument. Checkout and
            refunds are handled by a merchant-of-record (your card details never touch us
            either). The license unlock is verified locally — even paying doesn&apos;t send
            your data anywhere.
          </p>
        </div>
        <div className="rounded-xl border border-rule bg-cream p-6">
          <h2 className="font-bold">The comparison that matters</h2>
          <table className="tabular mt-3 w-full text-[15px]">
            <tbody>
              {[
                ["QuickBooks® Desktop Pro Plus renewal (Feb 2026)", "$1,149 / every year"],
                ["Conversion service, per file", "$275–$449, plus your books in their inbox"],
                ["Bookstead Evacuate", "$149 once ($99 at launch)"],
              ].map(([a, b], i) => (
                <tr key={a} className={`border-t border-rule ${i === 2 ? "font-bold" : "text-slate2"}`}>
                  <td className="py-2">{a}</td>
                  <td className="py-2 text-right">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-xl border border-rule bg-cream p-6">
          <h2 className="font-bold">Honest small print, in regular-size type</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[15px] text-slate2">
            <li>Converts what QuickBooks exports (general ledger, lists, balances). Audit trail, attachments, payroll item detail, and memorized reports don&apos;t carry into a new ledger with any converter — keep them by exporting the Audit Trail report and copying your Attach folder alongside the archive.</li>
            <li>v1 supports US editions, single currency. Multi-currency and inventory-assembly files get flagged, not mangled.</li>
            <li>You need a QuickBooks install that can still run exports — an active sub, a perpetual license, or view-only mode within 12 months of lapse.</li>
            <li>One license = one company file, on the honor system backed by arithmetic: the license is checked locally and never phones home, because that would betray the entire premise.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
