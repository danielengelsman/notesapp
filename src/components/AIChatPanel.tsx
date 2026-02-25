'use client';

import { useState, useRef, useEffect } from 'react';
import { useAI, type Message } from '@/lib/hooks/useAI';
import { useNotes } from '@/lib/hooks/useNotes';
import type { AIAction } from '@/lib/ai/commands';

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  noteContext?: string;
  securityLevel?: 'cloud' | 'local';
}

export function AIChatPanel({
  isOpen,
  onClose,
  noteContext,
  securityLevel = 'cloud',
}: AIChatPanelProps) {
  const { messages, isLoading, sendMessage, stopStreaming, clearMessages } = useAI();
  const { createNote } = useNotes();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput('');
    const result = await sendMessage(text, { noteContext, securityLevel });

    // Execute any actions from the AI response
    if (result?.actions) {
      for (const action of result.actions) {
        await executeAction(action);
      }
    }
  }

  async function executeAction(action: AIAction) {
    try {
      switch (action.action) {
        case 'create_note':
          await createNote({
            title: action.title || 'Untitled',
            content: action.content || '',
            folder: action.folder || 'Personal',
            tags: action.tags || [],
            security_level: securityLevel,
          });
          break;
        case 'create_reminder':
          // TODO: Wire up reminder creation in Session 5
          console.log('Reminder action:', action);
          break;
        case 'search_notes':
          // Search is handled client-side via the search bar
          console.log('Search action:', action);
          break;
      }
    } catch (err) {
      console.error('Failed to execute action:', err);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed bottom-0 right-0 top-0 z-50 flex w-full flex-col border-l border-stone-200 bg-white shadow-xl sm:w-96">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2D6A4F]">
              <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-stone-800">AI Assistant</h3>
              <p className="text-[10px] text-stone-400">
                {securityLevel === 'local' ? 'Local mode (Ollama)' : 'Cloud mode (Claude)'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={clearMessages}
              className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-50 hover:text-stone-600"
              title="Clear chat"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-50 hover:text-stone-600"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#2D6A4F]/10">
                <svg className="h-5 w-5 text-[#2D6A4F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-stone-700">How can I help?</p>
              <p className="mt-1 text-xs text-stone-400">
                Ask me to summarize, create notes, set reminders, or find information.
              </p>
              {/* Quick actions */}
              <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                {['Summarize this note', 'Extract action items', 'Create a reminder'].map(
                  (suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setInput(suggestion);
                        inputRef.current?.focus();
                      }}
                      className="rounded-full border border-stone-200 px-2.5 py-1 text-[11px] text-stone-500 transition-colors hover:border-[#2D6A4F] hover:text-[#2D6A4F]"
                    >
                      {suggestion}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-stone-100 px-4 py-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              rows={1}
              className="max-h-32 min-h-[36px] flex-1 resize-none rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:border-[#2D6A4F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
            />
            {isLoading ? (
              <button
                onClick={stopStreaming}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-stone-200 text-stone-600 transition-colors hover:bg-stone-300"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="1" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2D6A4F] text-white transition-colors hover:bg-[#245A42] disabled:opacity-40"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`mb-3 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
          isUser
            ? 'bg-[#2D6A4F] text-white'
            : 'bg-stone-100 text-stone-700'
        }`}
      >
        {message.content || (
          <span className="inline-flex items-center gap-1 text-stone-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-stone-400" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-stone-400" style={{ animationDelay: '0.2s' }} />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-stone-400" style={{ animationDelay: '0.4s' }} />
          </span>
        )}

        {/* Show action badges */}
        {message.actions && message.actions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {message.actions.map((action, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium"
              >
                {action.action === 'create_note' && '📝 Note created'}
                {action.action === 'create_reminder' && '⏰ Reminder set'}
                {action.action === 'search_notes' && '🔍 Searching'}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
