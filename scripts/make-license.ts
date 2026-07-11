/**
 * Mints a Bookstead license key. In production this runs in the
 * merchant-of-record webhook after checkout; locally it lets you (or a
 * reviewer of this repo) create working keys.
 *
 *   npx tsx scripts/make-license.ts buyer@example.com [tier]
 *
 * Key format: BKST1.<base64url payload>.<base64url ed25519 signature>
 * payload = {"e":email,"t":tier,"i":issuedISO}
 */
import { createPrivateKey, sign } from "node:crypto";
import { readFileSync } from "node:fs";

const email = process.argv[2] ?? "demo@bookstead.example";
const tier = process.argv[3] ?? "pro";
const keys = JSON.parse(readFileSync("scripts/license-signing-key.json", "utf8"));
const priv = createPrivateKey({ key: Buffer.from(keys.privatePkcs8Base64, "base64"), format: "der", type: "pkcs8" });

const payload = Buffer.from(JSON.stringify({ e: email, t: tier, i: "2026-07-11" }));
const sig = sign(null, payload, priv);
const b64u = (b: Buffer) => b.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
console.log(`BKST1.${b64u(payload)}.${b64u(sig)}`);
