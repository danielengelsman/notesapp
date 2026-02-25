'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useNotes } from '@/lib/hooks/useNotes';
import { useEncryption } from '@/lib/hooks/useEncryption';
import { Sidebar } from '@/components/Sidebar';
import { SearchBar } from '@/components/SearchBar';
import { NoteCard } from '@/components/NoteCard';
import { AIChatPanel } from '@/components/AIChatPanel';
import { VoiceButton } from '@/components/VoiceButton';
import { VoiceAgent } from '@/components/VoiceAgent';

const DEFAULT_FOLDERS = ['Personal', 'Work', 'Ideas', 'Archive'];

export default function HomePage() {
  const { notes, loading, error, deleteNote, createNote } = useNotes();
  const { isUnlocked, unlock } = useEncryption();
  const [password, setPassword] = useState('');
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [activeFolder, setActiveFolder] = useState('All Notes');
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [voiceAgentOpen, setVoiceAgentOpen] = useState(false);
  const router = useRouter();

  // Filter notes by folder and search query
  const filteredNotes = useMemo(() => {
    let result = notes;
    if (activeFolder !== 'All Notes') {
      result = result.filter((n) => n.folder === activeFolder);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [notes, activeFolder, search]);

  // Count notes per folder
  const noteCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const note of notes) {
      counts[note.folder] = (counts[note.folder] || 0) + 1;
    }
    return counts;
  }, [notes]);

  // Encryption unlock screen
  if (!isUnlocked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8]">
        <div className="w-full max-w-sm space-y-5 rounded-xl border border-stone-100 bg-white p-8 shadow-sm">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#2D6A4F]/10">
              <svg className="h-6 w-6 text-[#2D6A4F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-stone-800">Unlock Your Vault</h2>
            <p className="mt-1 text-sm text-stone-500">
              Enter your password to decrypt your notes
            </p>
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setUnlockError(null);
              try {
                await unlock(password);
              } catch {
                setUnlockError('Wrong password or no encryption key found.');
              }
            }}
            className="space-y-3"
          >
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="block w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:border-[#2D6A4F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
            />
            {unlockError && <p className="text-sm text-red-600">{unlockError}</p>}
            <button
              type="submit"
              className="w-full rounded-lg bg-[#2D6A4F] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#245A42] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:ring-offset-2"
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  async function handleCreateNote() {
    setCreating(true);
    try {
      const folder = activeFolder === 'All Notes' ? 'Personal' : activeFolder;
      const note = await createNote({
        title: 'Untitled',
        content: '',
        folder,
        tags: [],
        security_level: 'cloud',
      });
      router.push(`/note/${note.id}`);
    } catch (err) {
      console.error('Failed to create note:', err);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex h-screen bg-[#FAFAF8]">
      {/* Sidebar */}
      <Sidebar
        folders={DEFAULT_FOLDERS}
        activeFolder={activeFolder}
        onFolderChange={setActiveFolder}
        noteCounts={noteCounts}
        totalNotes={notes.length}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-3 border-b border-stone-100 bg-white px-4 py-3 sm:px-6">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-50 lg:hidden"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          {/* Search */}
          <div className="flex-1">
            <SearchBar value={search} onChange={setSearch} />
          </div>

          {/* New note */}
          <button
            onClick={handleCreateNote}
            disabled={creating}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#2D6A4F] px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#245A42] disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="hidden sm:inline">{creating ? 'Creating...' : 'New Note'}</span>
          </button>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          {/* Folder title */}
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold text-stone-800">{activeFolder}</h2>
            <span className="text-sm text-stone-400">
              {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
            </span>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-stone-200 border-t-[#2D6A4F]" />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Empty state */}
          {!loading && filteredNotes.length === 0 && (
            <div className="flex flex-col items-center py-16">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-stone-100">
                <svg className="h-7 w-7 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <p className="text-sm text-stone-500">
                {search ? 'No notes match your search' : 'No notes in this folder'}
              </p>
              {!search && (
                <button
                  onClick={handleCreateNote}
                  className="mt-2 text-sm font-medium text-[#2D6A4F] hover:underline"
                >
                  Create a note
                </button>
              )}
            </div>
          )}

          {/* Notes grid */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredNotes.map((note) => (
              <NoteCard key={note.id} note={note} onDelete={deleteNote} />
            ))}
          </div>
        </div>
      </main>

      {/* FABs — Voice + AI Chat */}
      <div className="fixed bottom-6 right-6 z-30 flex flex-col items-center gap-3">
        {/* Voice button */}
        <VoiceButton
          securityLevel="cloud"
          onTranscript={(text) => {
            setChatOpen(true);
            // The transcript will be sent via the chat panel
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

      {/* AI Chat Panel */}
      <AIChatPanel
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />

      {/* ElevenLabs Voice Agent Overlay */}
      <VoiceAgent
        isOpen={voiceAgentOpen}
        onClose={() => setVoiceAgentOpen(false)}
      />
    </div>
  );
}
