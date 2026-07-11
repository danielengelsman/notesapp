/**
 * Client-side license verification: Ed25519 signature check against the
 * embedded public key, via SubtleCrypto. No server round-trip — like
 * everything else here, it works with the network cable unplugged.
 */
import { LICENSE_PUBKEY_B64 } from "./license-pubkey";

export interface License {
  email: string;
  tier: string;
  issued: string;
}

function b64uToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function verifyLicense(key: string): Promise<License | null> {
  try {
    const m = key.trim().match(/^BKST1\.([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)$/);
    if (!m) return null;
    const payload = b64uToBytes(m[1]);
    const sig = b64uToBytes(m[2]);
    const pub = await crypto.subtle.importKey(
      "raw",
      b64uToBytes(LICENSE_PUBKEY_B64) as unknown as ArrayBuffer,
      { name: "Ed25519" },
      false,
      ["verify"]
    );
    const ok = await crypto.subtle.verify("Ed25519", pub, sig as unknown as ArrayBuffer, payload as unknown as ArrayBuffer);
    if (!ok) return null;
    const p = JSON.parse(new TextDecoder().decode(payload));
    return { email: p.e, tier: p.t, issued: p.i };
  } catch {
    return null;
  }
}
