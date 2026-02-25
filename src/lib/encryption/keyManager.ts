import {
  deriveKey,
  generateMasterKey,
  wrapMasterKey,
  unwrapMasterKey,
  generateSalt,
} from './crypto';
import { createClient } from '@/lib/supabase/client';

// In-memory master key — lives only in the browser session
let masterKey: CryptoKey | null = null;

export function getMasterKey(): CryptoKey | null {
  return masterKey;
}

export function clearMasterKey(): void {
  masterKey = null;
}

// Called on signup: generate master key, wrap it with password, store in Supabase
export async function initializeEncryption(password: string, userId: string): Promise<void> {
  const salt = generateSalt();
  const wrappingKey = await deriveKey(password, salt);
  const newMasterKey = await generateMasterKey();
  const { wrappedKey, iv } = await wrapMasterKey(newMasterKey, wrappingKey);

  // Store the wrapped key in the format: iv:wrappedKey
  const wrappedKeyWithIv = `${iv}:${wrappedKey}`;

  const supabase = createClient();
  const { error } = await supabase.from('user_keys').insert({
    user_id: userId,
    wrapped_key: wrappedKeyWithIv,
    key_salt: btoa(String.fromCharCode(...salt)),
  });

  if (error) throw new Error(`Failed to store encryption key: ${error.message}`);
  masterKey = newMasterKey;
}

// Called on login: fetch wrapped key from Supabase, unwrap with password
export async function unlockEncryption(password: string): Promise<void> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_keys')
    .select('wrapped_key, key_salt')
    .single();

  if (error || !data) {
    throw new Error('No encryption key found. Please sign up again.');
  }

  // Parse salt
  const saltBinary = atob(data.key_salt);
  const salt = new Uint8Array(saltBinary.length);
  for (let i = 0; i < saltBinary.length; i++) {
    salt[i] = saltBinary.charCodeAt(i);
  }

  // Parse iv and wrapped key
  const [ivBase64, wrappedKeyBase64] = data.wrapped_key.split(':');

  const wrappingKey = await deriveKey(password, salt);
  masterKey = await unwrapMasterKey(wrappedKeyBase64, wrappingKey, ivBase64);
}
