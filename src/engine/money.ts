/**
 * All money is integer cents. Floating point never touches a balance —
 * the product's promise is "matches to the penny", so the math must be
 * incapable of drifting.
 */

/** Parse a QuickBooks-exported amount string into integer cents.
 *  Handles: "1,234.56"  "-1,234.56"  "(1,234.56)"  "$1,234.56"  '"1,234.56"'
 *  "1234"  "" (→ null: absent value, distinct from zero).
 */
export function parseAmount(raw: string | undefined | null): number | null {
  if (raw == null) return null;
  let s = String(raw).trim();
  if (s === "") return null;
  // strip surrounding quotes an exporter may have left
  s = s.replace(/^"+|"+$/g, "").trim();
  if (s === "" || s === "-") return null;
  let negative = false;
  if (/^\(.*\)$/.test(s)) {
    negative = true;
    s = s.slice(1, -1);
  }
  s = s.replace(/[$\s]/g, "");
  if (s.startsWith("-")) {
    negative = !negative ? true : negative;
    s = s.slice(1);
  }
  s = s.replace(/,/g, "");
  if (!/^\d*(\.\d*)?$/.test(s)) return null;
  if (s === "" || s === ".") return null;
  const [intPart, fracPart = ""] = s.split(".");
  const frac = (fracPart + "00").slice(0, 2);
  // round half-up on a possible 3rd decimal (rare, but some reports emit them)
  let cents = Number(intPart || "0") * 100 + Number(frac);
  if (fracPart.length > 2 && Number(fracPart[2]) >= 5) cents += 1;
  return negative ? -cents : cents;
}

/** Format integer cents as "1,234.56" (no currency symbol). */
export function formatCents(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const int = Math.floor(abs / 100);
  const frac = String(abs % 100).padStart(2, "0");
  return `${sign}${int.toLocaleString("en-US")}.${frac}`;
}

/** Format cents in accounting style: negatives in parentheses. */
export function formatAccounting(cents: number): string {
  return cents < 0 ? `(${formatCents(-cents)})` : formatCents(cents);
}
