'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SecurityBadge } from './SecurityBadge';
import type { DecryptedNote, NoteFormData } from '@/types';

interface NoteEditorProps {
  note?: DecryptedNote | null;
  onSave: (data: NoteFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
}

const FOLDERS = ['Personal', 'Work', 'Ideas', 'Archive'];

export function NoteEditor({ note, onSave, onDelete }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title ?? 'Untitled');
  const [content, setContent] = useState(note?.content ?? '');
  const [folder, setFolder] = useState(note?.folder ?? 'Personal');
  const [securityLevel, setSecurityLevel] = useState<'cloud' | 'local'>(
    note?.security_level ?? 'cloud'
  );
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const router = useRouter();

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const save = useCallback(async () => {
    setSaving(true);
    try {
      await onSave({
        title,
        content,
        folder,
        tags: note?.tags ?? [],
        security_level: securityLevel,
      });
      setLastSaved(new Date());
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  }, [title, content, folder, securityLevel, note?.tags, onSave]);

  // Debounced auto-save
  useEffect(() => {
    if (!note) return;
    const timeout = setTimeout(save, 1500);
    return () => clearTimeout(timeout);
  }, [content, title, folder, securityLevel]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-stone-100 px-4 py-2.5 sm:px-6">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-stone-500 transition-colors hover:bg-stone-50 hover:text-stone-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          <span className="hidden sm:inline">Notes</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Security toggle */}
          <SecurityBadge
            level={securityLevel}
            size="md"
            onClick={() => setSecurityLevel(securityLevel === 'cloud' ? 'local' : 'cloud')}
          />

          {/* Folder select */}
          <select
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs text-stone-600 focus:border-[#2D6A4F] focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
          >
            {FOLDERS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>

          {/* Save status */}
          <span className="hidden text-xs text-stone-400 sm:inline">
            {saving ? (
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
                Saving
              </span>
            ) : lastSaved ? (
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Saved
              </span>
            ) : null}
          </span>

          {/* Manual save for new notes */}
          {!note && (
            <button
              onClick={save}
              disabled={saving || !content.trim()}
              className="rounded-lg bg-[#2D6A4F] px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#245A42] disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          )}

          {/* Delete */}
          {onDelete && (
            <button
              onClick={() => {
                if (confirm('Delete this note permanently?')) onDelete();
              }}
              className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-500"
              title="Delete note"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
            className="w-full bg-transparent text-2xl font-semibold leading-tight text-stone-800 placeholder-stone-300 focus:outline-none"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing..."
            className="mt-4 w-full resize-none bg-transparent text-[15px] leading-relaxed text-stone-600 placeholder-stone-300 focus:outline-none"
            style={{ minHeight: 'calc(100vh - 240px)' }}
          />
        </div>
      </div>

      {/* Footer status bar */}
      <div className="flex items-center justify-between border-t border-stone-100 px-4 py-1.5 sm:px-6">
        <span className="text-[11px] text-stone-400">
          {wordCount} {wordCount === 1 ? 'word' : 'words'}
        </span>
        <span className="text-[11px] text-stone-400">
          {securityLevel === 'local' ? 'Encrypted · Local only' : 'Encrypted · Cloud sync'}
        </span>
      </div>
    </div>
  );
}
