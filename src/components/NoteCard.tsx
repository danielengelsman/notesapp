'use client';

import Link from 'next/link';
import { SecurityBadge } from './SecurityBadge';
import type { DecryptedNote } from '@/types';

interface NoteCardProps {
  note: DecryptedNote;
  onDelete: (id: string) => void;
}

export function NoteCard({ note, onDelete }: NoteCardProps) {
  const preview = note.content.length > 140
    ? note.content.substring(0, 140) + '...'
    : note.content;

  const timeAgo = getTimeAgo(new Date(note.updated_at));

  return (
    <Link
      href={`/note/${note.id}`}
      className="group relative flex flex-col rounded-xl border border-stone-150 bg-white p-4 shadow-sm transition-all hover:border-stone-200 hover:shadow-md"
    >
      {/* Header */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-medium leading-snug text-stone-800 line-clamp-1 group-hover:text-[#2D6A4F]">
          {note.title}
        </h3>
        <SecurityBadge level={note.security_level} />
      </div>

      {/* Preview */}
      <p className="flex-1 text-[13px] leading-relaxed text-stone-500 line-clamp-3">
        {preview || 'Empty note'}
      </p>

      {/* Footer */}
      <div className="mt-3 flex items-center gap-1.5 border-t border-stone-50 pt-2.5">
        <span className="text-[11px] text-stone-400">{note.folder}</span>
        <span className="text-stone-300">&middot;</span>
        <span className="text-[11px] text-stone-400">{timeAgo}</span>
        {note.tags.length > 0 && (
          <>
            <span className="text-stone-300">&middot;</span>
            <div className="flex gap-1">
              {note.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-500"
                >
                  {tag}
                </span>
              ))}
            </div>
          </>
        )}
        {/* Delete button (appears on hover) */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (confirm('Delete this note?')) onDelete(note.id);
          }}
          className="ml-auto rounded p-0.5 text-stone-300 opacity-0 transition-all hover:text-red-500 group-hover:opacity-100"
          title="Delete note"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </Link>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}
