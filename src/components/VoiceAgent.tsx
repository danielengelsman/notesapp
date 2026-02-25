'use client';

import { useConversation } from '@elevenlabs/react';

interface VoiceAgentProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export function VoiceAgent({ isOpen, onClose, userId }: VoiceAgentProps) {
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

  const conversation = useConversation({
    onConnect: () => console.log('Voice agent connected'),
    onDisconnect: () => console.log('Voice agent disconnected'),
    onMessage: (message) => console.log('Agent:', message),
    onError: (error) => console.error('Voice agent error:', error),
  });

  async function startConversation() {
    if (!agentId) {
      alert('ElevenLabs Agent ID not configured. Add NEXT_PUBLIC_ELEVENLABS_AGENT_ID to .env.local');
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId,
        connectionType: 'webrtc',
        dynamicVariables: userId ? { user_id: userId } : undefined,
      });
    } catch (err) {
      console.error('Failed to start voice session:', err);
    }
  }

  async function stopConversation() {
    await conversation.endSession();
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={() => {
          stopConversation();
          onClose();
        }}
      />

      {/* Voice agent overlay */}
      <div className="fixed inset-x-4 bottom-4 top-auto z-50 mx-auto max-w-sm rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl sm:inset-x-auto sm:bottom-8 sm:right-8">
        <div className="flex flex-col items-center">
          {/* Close button */}
          <button
            onClick={() => {
              stopConversation();
              onClose();
            }}
            className="absolute right-3 top-3 rounded-lg p-1 text-stone-400 hover:bg-stone-50 hover:text-stone-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Status visualization */}
          <div className="relative mb-4 flex h-20 w-20 items-center justify-center">
            {conversation.status === 'connected' && (
              <>
                <span className={`absolute inset-0 rounded-full ${
                  conversation.isSpeaking
                    ? 'animate-ping bg-[#2D6A4F]/20'
                    : 'animate-pulse bg-[#2D6A4F]/10'
                }`} />
                <span className={`absolute -inset-2 rounded-full border-2 ${
                  conversation.isSpeaking
                    ? 'animate-pulse border-[#2D6A4F]/30'
                    : 'border-stone-200'
                }`} />
              </>
            )}
            <div className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full ${
              conversation.status === 'connected'
                ? 'bg-[#2D6A4F] text-white'
                : 'bg-stone-100 text-stone-500'
            }`}>
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            </div>
          </div>

          {/* Status text */}
          <p className="mb-1 text-sm font-medium text-stone-800">
            {conversation.status === 'connected'
              ? conversation.isSpeaking
                ? 'Agent is speaking...'
                : 'Listening...'
              : 'Voice Assistant'}
          </p>
          <p className="mb-5 text-xs text-stone-400">
            {conversation.status === 'connected'
              ? 'Speak naturally — I can create notes, set reminders, and search.'
              : 'Start a voice conversation with your AI assistant.'}
          </p>

          {/* Controls */}
          {conversation.status === 'connected' ? (
            <button
              onClick={stopConversation}
              className="rounded-xl bg-red-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600"
            >
              End Conversation
            </button>
          ) : (
            <button
              onClick={startConversation}
              className="rounded-xl bg-[#2D6A4F] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#245A42]"
            >
              Start Voice Chat
            </button>
          )}

          {/* Mode label */}
          <span className="mt-3 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
            Cloud mode · ElevenLabs
          </span>
        </div>
      </div>
    </>
  );
}
