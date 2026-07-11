import Link from "next/link";

export const metadata = { title: "Compare your escape routes — Bookstead" };

const rows: [string, string, string, string, string, string][] = [
  // [dimension, Bookstead, Dataswitcher, ConversionService, KeepOldPC, DIY]
  ["Price", "$149 once per company file (launch $99)", "Free (funded by QBO/Wave to acquire you)", "$275–$449+ per file", "“Free” until the hardware or activation dies", "Free"],
  ["Your data goes…", "Nowhere. Parses in your browser; provably offline", "Uploaded to their servers", "Emailed/uploaded to a stranger's team", "Stays local", "Stays local"],
  ["History carried", "Everything in your exports — every year, every line", "Typically ~2 years; older activity summarized", "Full history on bigger packages", "Everything, until it doesn't open", "Whatever you retype"],
  ["Destination", "GnuCash, Manager.io, CSV/JSON — your choice, or none", "Their owner's product only", "The services' supported list", "None — you're stuck where you are", "Any, painfully"],
  ["Proof it's complete", "Trial-balance diff, account by account, before you pay", "Spot-check it yourself after", "“Trust us” + your spot-checks", "n/a", "Your own spreadsheet math"],
  ["Permanent archive", "One self-contained HTML file, readable forever", "No — the point is moving you into their app", "No", "Until Windows/activation breaks", "No"],
  ["Time", "~10 minutes, self-serve", "2–4 business days typical", "Days to weeks", "Ongoing life-support", "Days of retyping"],
  ["Works after your QBD sub lapsed", "Yes — view-only mode can still export (within its 12-month window)", "Needs a working install/file", "Usually yes (they use their own licenses)", "That's the plan, until reactivation fails", "Needs a working install"],
];

export default function Compare() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="text-4xl font-bold">Every way out of QuickBooks® Desktop, honestly compared</h1>
      <p className="mt-3 max-w-3xl text-lg text-slate2">
        Including the free ones, because pretending they don&apos;t exist would tell you
        everything about us. Two are genuinely good options for some businesses —
        the table says which.
      </p>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-rule bg-cream">
        <table className="w-full min-w-[900px] text-[14px]">
          <thead>
            <tr className="text-left">
              <th className="p-3"></th>
              <th className="bg-verified-bg p-3 font-bold text-stead">Bookstead</th>
              <th className="p-3 font-semibold">Dataswitcher<br /><span className="font-normal text-slate2">(inside QBO/Wave onboarding)</span></th>
              <th className="p-3 font-semibold">Conversion services<br /><span className="font-normal text-slate2">(E-Tech &amp; co.)</span></th>
              <th className="p-3 font-semibold">Keep an old PC running QBD</th>
              <th className="p-3 font-semibold">DIY spreadsheets</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r[0]} className="border-t border-rule align-top">
                <td className="p-3 font-semibold">{r[0]}</td>
                <td className="bg-verified-bg/50 p-3">{r[1]}</td>
                <td className="p-3 text-slate2">{r[2]}</td>
                <td className="p-3 text-slate2">{r[3]}</td>
                <td className="p-3 text-slate2">{r[4]}</td>
                <td className="p-3 text-slate2">{r[5]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="rounded-xl border border-rule bg-cream p-5">
          <h2 className="font-bold">When Dataswitcher is the right call</h2>
          <p className="mt-2 text-[15px] text-slate2">
            If you&apos;ve already decided on QuickBooks Online or Wave, and two years of
            detail plus summarized history is enough for you, their free conversion is
            legitimate — Intuit and Wave pay for it because they want your subscription.
            Bookstead is for everyone who wants <em>all</em> the history, a destination
            they choose (including free ones), an archive that outlives any vendor —
            or simply doesn&apos;t want their books uploaded anywhere.
          </p>
        </div>
        <div className="rounded-xl border border-rule bg-cream p-5">
          <h2 className="font-bold">When the old-PC plan is the right call</h2>
          <p className="mt-2 text-[15px] text-slate2">
            A perpetual (pre-subscription) QBD license on a machine you never upgrade
            keeps working offline, and for read-only lookups that&apos;s fine — until the
            disk dies or a reinstall needs an activation Intuit no longer grants for
            discontinued versions. Run Bookstead once <em>now</em>, while it still opens,
            and the old-PC plan becomes a convenience instead of a single point of failure.
          </p>
        </div>
      </div>

      <p className="mt-8 text-sm text-slate2">
        Vendor capabilities and prices as researched July 2026 — sources in our published
        research notes. Corrections welcome; honesty is the product.
      </p>

      <div className="mt-8">
        <Link href="/app/" className="rounded-lg bg-stead px-6 py-3 text-lg font-semibold text-white shadow hover:bg-pine">
          Run the free check
        </Link>
      </div>
    </main>
  );
}
