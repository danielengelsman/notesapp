'use client';

import { useState, useCallback } from 'react';
import { encryptContent, decryptContent } from '@/lib/encryption/crypto';
import { getMasterKey, unlockEncryption, clearMasterKey } from '@/lib/encryption/keyManager';
import type { Note, DecryptedNote } from '@/types';

export function useEncryption() {
  const [isUnlocked, setIsUnlocked] = useState(() => getMasterKey() !== null);

  const unlock = useCallback(async (password: string) => {
    await unlockEncryption(password);
    setIsUnlocked(true);
  }, []);

  const lock = useCallback(() => {
    clearMasterKey();
    setIsUnlocked(false);
  }, []);

  const encrypt = useCallback(async (content: string) => {
    const key = getMasterKey();
    if (!key) throw new Error('Encryption not unlocked');
    return encryptContent(content, key);
  }, []);

  const decrypt = useCallback(async (encrypted: string, iv: string) => {
    const key = getMasterKey();
    if (!key) throw new Error('Encryption not unlocked');
    return decryptContent(encrypted, iv, key);
  }, []);

  const decryptNote = useCallback(async (note: Note): Promise<DecryptedNote> => {
    const content = await decrypt(note.content_encrypted, note.content_iv);
    const { content_encrypted, content_iv, ...rest } = note;
    return { ...rest, content };
  }, [decrypt]);

  return { isUnlocked, unlock, lock, encrypt, decrypt, decryptNote };
}
