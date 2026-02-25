'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { encryptContent, decryptContent } from '@/lib/encryption/crypto';
import { getMasterKey } from '@/lib/encryption/keyManager';
import type { Note, DecryptedNote, NoteFormData } from '@/types';

export function useNotes() {
  const [notes, setNotes] = useState<DecryptedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchNotes = useCallback(async () => {
    const key = getMasterKey();
    if (!key) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Decrypt all notes client-side
      const decrypted = await Promise.all(
        (data as Note[]).map(async (note) => {
          try {
            // Voice notes are stored as plaintext with a sentinel IV
            if (note.content_iv === '__voice__') {
              const { content_encrypted, content_iv, ...rest } = note;
              return { ...rest, content: content_encrypted } as DecryptedNote;
            }
            const content = await decryptContent(
              note.content_encrypted,
              note.content_iv,
              key
            );
            const { content_encrypted, content_iv, ...rest } = note;
            return { ...rest, content } as DecryptedNote;
          } catch {
            // If decryption fails, return with placeholder
            const { content_encrypted, content_iv, ...rest } = note;
            return { ...rest, content: '[Decryption failed]' } as DecryptedNote;
          }
        })
      );

      setNotes(decrypted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const createNote = useCallback(async (formData: NoteFormData) => {
    const key = getMasterKey();
    if (!key) throw new Error('Encryption not unlocked');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { encrypted, iv } = await encryptContent(formData.content, key);

    const { data, error: insertError } = await supabase
      .from('notes')
      .insert({
        user_id: user.id,
        title: formData.title,
        content_encrypted: encrypted,
        content_iv: iv,
        folder: formData.folder,
        tags: formData.tags,
        security_level: formData.security_level,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    const { content_encrypted, content_iv, ...rest } = data as Note;
    const cleanNote: DecryptedNote = { ...rest, content: formData.content };

    setNotes((prev) => [cleanNote, ...prev]);
    return cleanNote;
  }, [supabase]);

  const updateNote = useCallback(async (id: string, formData: Partial<NoteFormData>) => {
    const key = getMasterKey();
    if (!key) throw new Error('Encryption not unlocked');

    const updateData: Record<string, unknown> = {};

    if (formData.title !== undefined) updateData.title = formData.title;
    if (formData.folder !== undefined) updateData.folder = formData.folder;
    if (formData.tags !== undefined) updateData.tags = formData.tags;
    if (formData.security_level !== undefined) updateData.security_level = formData.security_level;

    if (formData.content !== undefined) {
      const { encrypted, iv } = await encryptContent(formData.content, key);
      updateData.content_encrypted = encrypted;
      updateData.content_iv = iv;
    }

    const { data, error: updateError } = await supabase
      .from('notes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Update local state
    setNotes((prev) =>
      prev.map((note) => {
        if (note.id !== id) return note;
        return {
          ...note,
          ...formData,
          updated_at: (data as Note).updated_at,
        };
      })
    );
  }, [supabase]);

  const deleteNote = useCallback(async (id: string) => {
    const { error: deleteError } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;
    setNotes((prev) => prev.filter((note) => note.id !== id));
  }, [supabase]);

  const getNote = useCallback(async (id: string): Promise<DecryptedNote | null> => {
    const key = getMasterKey();
    if (!key) throw new Error('Encryption not unlocked');

    const { data, error: fetchError } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) return null;

    const note = data as Note;
    // Voice notes are stored as plaintext with a sentinel IV
    if (note.content_iv === '__voice__') {
      const { content_encrypted, content_iv, ...rest } = note;
      return { ...rest, content: content_encrypted };
    }
    const content = await decryptContent(note.content_encrypted, note.content_iv, key);
    const { content_encrypted, content_iv, ...rest } = note;
    return { ...rest, content };
  }, [supabase]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return {
    notes,
    loading,
    error,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    getNote,
  };
}
