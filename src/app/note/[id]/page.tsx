'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { NoteEditor } from '@/components/NoteEditor';
import { AIChatPanel } from '@/components/AIChatPanel';
import { VoiceButton } from '@/components/VoiceButton';
import { VoiceAgent } from '@/components/VoiceAgent';
import { useNotes } from '@/lib/hooks/useNotes';
import { getMasterKey } from '@/lib/encryption/keyManager';
import { createClient } from '@/lib/supabase/client';
import type { DecryptedNote, NoteFormData } from '@/types';

export default function NoteEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [note, setNote] = useState<DecryptedNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [voiceAgentOpen, setVoiceAgentOpen] = useState(false);
  const [userId, setUserId] = useState<string | undefined>();
  const { getNote, updateNote, deleteNote } = useNotes();
  const router = useRouter();

  useEffect(() => {
    if (!getMasterKey()) {
      router.push('/');
      return;
    }

    async function load() {
      const fetched = await getNote(id);
      setNote(fetched);
      setLoading(false);
    }
    load();

    // Get current user ID for voice agent
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, [id, getNote, router]);

  const handleSave = useCallback(async (data: NoteFormData) => {
    await updateNote(id, data);
    setNote((prev) => prev ? { ...prev, ...data } : prev);
  }, [id, updateNote]);

  const handleDelete = useCallback(async () => {
    await deleteNote(id);
    router.push('/');
  }, [id, deleteNote, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-stone-200 border-t-[#2D6A4F]" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-white">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-stone-100">
          <svg className="h-7 w-7 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <p className="text-sm text-stone-500">Note not found</p>
        <button
          onClick={() => router.push('/')}
          className="mt-2 text-sm font-medium text-[#2D6A4F] hover:underline"
        >
          Back to notes
        </button>
      </div>
    );
  }

  // Build context string for the AI about this note
  const noteContext = `Title: ${note.title}\nFolder: ${note.folder}\nSecurity: ${note.security_level}\nContent:\n${note.content}`;

  return (
    <>
      <NoteEditor note={note} onSave={handleSave} onDelete={handleDelete} />

      {/* FABs — Voice + AI Chat */}
      <div className="fixed bottom-6 right-6 z-30 flex flex-col items-center gap-3">
        {/* Voice button */}
        <VoiceButton
          securityLevel={note.security_level}
          onTranscript={(text) => {
            setChatOpen(true);
            console.log('Voice transcript:', text);
          }}
          onOpenAgent={() => setVoiceAgentOpen(true)}
        />

        {/* AI Chat button */}
        <button
          onClick={() => setChatOpen(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2D6A4F] text-white shadow-lg transition-transform hover:scale-105 hover:bg-[#245A42]"
          title="AI Assistant"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
        </button>
      </div>

      {/* AI Chat Panel with note context */}
      <AIChatPanel
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        noteContext={noteContext}
        securityLevel={note.security_level}
      />

      {/* ElevenLabs Voice Agent Overlay */}
      <VoiceAgent
        isOpen={voiceAgentOpen}
        onClose={() => setVoiceAgentOpen(false)}
        userId={userId}
      />
    </>
  );
}
