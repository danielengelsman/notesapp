import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { LogoWordmark } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Bookstead — Your books, yours again.",
  description:
    "Evacuate your QuickBooks® Desktop history into an archive you own forever, plus clean migration files for wherever you go next. 100% in your browser — your books never upload anywhere. Penny-perfect proof before you pay a cent.",
  icons: { icon: "/icon.svg" },
};

const nav = [
  { href: "/how-it-works/", label: "How it works" },
  { href: "/security/", label: "Why it's safe" },
  { href: "/compare/", label: "Compare" },
  { href: "/pricing/", label: "Pricing" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Browser-enforced egress lockdown: every request class is limited to
            this origin (or blocked outright). A static export can't send HTTP
            headers, so the policy ships as a meta tag — the practical effect
            is the same: financial data physically cannot be sent anywhere. */}
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'"
        />
      </head>
      <body>
        <header className="border-b border-rule bg-cream/80 sticky top-0 z-40 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
            <Link href="/" aria-label="Bookstead home">
              <LogoWordmark height={30} />
            </Link>
            <nav className="flex items-center gap-1 text-[15px]">
              {nav.map((n) => (
                <Link key={n.href} href={n.href} className="hidden rounded-md px-3 py-1.5 text-slate2 hover:bg-paper hover:text-ink sm:block">
                  {n.label}
                </Link>
              ))}
              <Link
                href="/app/"
                className="ml-2 rounded-lg bg-stead px-4 py-2 font-semibold text-white shadow-sm hover:bg-pine"
              >
                Open Bookstead
              </Link>
            </nav>
          </div>
        </header>
        {children}
        <footer className="mt-20 border-t border-rule bg-cream">
          <div className="mx-auto max-w-6xl px-5 py-10 text-sm text-slate2">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-md">
                <LogoWordmark height={24} />
                <p className="mt-3">
                  Your books, yours again. Bookstead runs entirely in your browser — your
                  financial data never uploads to us or anyone else.
                </p>
              </div>
              <div className="flex gap-10">
                <div className="flex flex-col gap-1.5">
                  <span className="font-semibold text-ink">Product</span>
                  {nav.map((n) => (
                    <Link key={n.href} href={n.href} className="hover:text-ink">{n.label}</Link>
                  ))}
                  <Link href="/app/" className="hover:text-ink">Open the app</Link>
                </div>
              </div>
            </div>
            <p className="mt-8 border-t border-rule pt-5 text-[13px] leading-relaxed">
              Intuit and QuickBooks are registered trademarks of Intuit Inc. Bookstead is an
              independent product and is not affiliated with, endorsed by, or sponsored by
              Intuit Inc. Bookstead converts data you export from your own licensed copy of
              QuickBooks® Desktop. Bookstead is software, not accounting, tax, or legal advice —
              review converted records with your accountant.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
