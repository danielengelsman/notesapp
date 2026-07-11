import Link from "next/link";

export const metadata = { title: "Why it's safe — Bookstead" };

export default function Security() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="text-4xl font-bold">Your books never leave your machine.<br />Here&apos;s how you can check that yourself.</h1>
      <p className="mt-4 text-lg text-slate2">
        Every conversion tool asks for your complete financial history. Most ask you
        to upload it to their servers and trust them. We designed Bookstead so you
        don&apos;t have to trust us — and can verify that you don&apos;t have to.
      </p>

      <h2 className="mt-10 text-2xl font-bold">The architecture is the promise</h2>
      <ul className="mt-3 list-disc space-y-3 pl-6 text-slate2">
        <li>
          <strong className="text-ink">There is no backend.</strong> Bookstead is a static site: the pages and
          the conversion engine are plain files delivered to your browser. There is no
          server that could receive your books, store them, or leak them — parsing,
          reconciliation, archive generation, even license verification (an Ed25519
          signature check) all execute locally in your tab.
        </li>
        <li>
          <strong className="text-ink">Zero third-party requests.</strong> No analytics, no fonts from a CDN,
          no tag managers, no error trackers. A Content-Security-Policy shipped with every
          page instructs your browser to refuse any connection beyond same-origin page
          files — view the page source and read the policy yourself. The only network
          activity is your browser fetching Bookstead&apos;s own page files from
          Bookstead&apos;s own host.
        </li>
        <li>
          <strong className="text-ink">Your files stay as files.</strong> Dropped files are read with the
          browser&apos;s file API into your tab&apos;s memory, and outputs are handed back to
          you as downloads. Close the tab, and it&apos;s gone.
        </li>
      </ul>

      <h2 className="mt-10 text-2xl font-bold">Three ways to verify us in under a minute</h2>
      <ol className="mt-3 list-decimal space-y-3 pl-6 text-slate2">
        <li>
          <strong className="text-ink">The wifi test.</strong> Load the app, then turn off your wifi (or unplug
          the cable). Drop your files, run the check, download the archive. Everything
          works — because nothing needed the network.
        </li>
        <li>
          <strong className="text-ink">The network tab.</strong> Open your browser&apos;s developer tools →
          Network, then run a conversion. You&apos;ll see the app&apos;s own static files load,
          and nothing else. No request ever contains your data.
        </li>
        <li>
          <strong className="text-ink">The archive test.</strong> The archive we generate is one .html file.
          Open it in a text editor: your data sits in a plainly readable block, followed
          by an ordinary script that renders it. It phones nowhere; it works from a USB
          stick in 2040.
        </li>
      </ol>

      <h2 className="mt-10 text-2xl font-bold">Precision claims, precisely stated</h2>
      <p className="mt-3 text-slate2">
        &quot;Penny-perfect&quot; means: the trial balance we rebuild from your transaction
        export matches the trial balance QuickBooks exported, account by account, in
        integer cents — arithmetic in whole cents, never floating point. When it
        doesn&apos;t match, we show the exact accounts and deltas and you pay nothing.
        The reconciliation covers the general ledger; it cannot vouch for what lives outside the ledger&apos;s postings (audit-trail edit
        history, attachments, payroll item detail) —{" "}
        <Link href="/how-it-works/" className="text-stead underline">we list those exclusions openly</Link>.
      </p>

      <h2 className="mt-10 text-2xl font-bold">An unusual founder, so extra receipts</h2>
      <p className="mt-3 text-slate2">
        Bookstead was built end-to-end by an AI agent. We state that plainly because
        trust built on a hidden fact isn&apos;t trust. It&apos;s also why the product is
        designed to require none: the engine ships to your browser as inspectable
        JavaScript, the math shows its work in the reconciliation report, and the
        architecture makes data collection impossible rather than merely promised.
        Every market claim on this site carries a source in our published research.
      </p>

      <div className="mt-10">
        <Link href="/app/" className="rounded-lg bg-stead px-6 py-3 text-lg font-semibold text-white shadow hover:bg-pine">
          Try it with your wifi off
        </Link>
      </div>
    </main>
  );
}
