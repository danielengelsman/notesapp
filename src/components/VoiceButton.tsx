'use client';

import { useState, useCallback, useRef } from 'react';
import { WebSpeechSTT, localTTS, isWebSpeechSupported } from '@/lib/voice/webSpeech';
import { getVoiceMode } from '@/lib/voice';

type VoiceStatus = 'idle' | 'listening' | 'processing' | 'speaking';

interface VoiceButtonProps {
  securityLevel: 'cloud' | 'local';
  onTranscript?: (text: string) => void;
  onOpenAgent?: () => void;
}

export function VoiceButton({ securityLevel, onTranscript, onOpenAgent }: VoiceButtonProps) {
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const sttRef = useRef<WebSpeechSTT | null>(null);

  const voiceMode = getVoiceMode(securityLevel);

  const handleClick = useCallback(() => {
    if (voiceMode === 'elevenlabs') {
      // Open ElevenLabs agent overlay
      onOpenAgent?.();
      return;
    }

    // Local mode — Web Speech API
    if (status === 'listening') {
      sttRef.current?.stop();
      setStatus('idle');
      return;
    }

    if (!isWebSpeechSupported()) {
      alert('Speech recognition is not supported in this browser. Try Chrome.');
      return;
    }

    const stt = new WebSpeechSTT();
    sttRef.current = stt;
    setTranscript('');

    const started = stt.start(
      (text, isFinal) => {
        setTranscript(text);
        if (isFinal) {
          onTranscript?.(text);
          setStatus('idle');
        }
      },
      () => setStatus('idle')
    );

    if (started) {
      setStatus('listening');
    }
  }, [voiceMode, status, onTranscript, onOpenAgent]);

  const statusLabel: Record<VoiceStatus, string> = {
    idle: voiceMode === 'elevenlabs' ? 'Voice chat' : 'Tap to speak',
    listening: 'Listening...',
    processing: 'Thinking...',
    speaking: 'Speaking...',
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Voice button */}
      <button
        onClick={handleClick}
        className={`relative flex h-14 w-14 items-center justify-center rounded-full transition-all ${
          status === 'listening'
            ? 'bg-red-500 text-white shadow-lg shadow-red-200'
            : 'bg-[#2D6A4F] text-white shadow-lg shadow-[#2D6A4F]/20 hover:bg-[#245A42]'
        }`}
      >
        {/* Pulse rings when listening */}
        {status === 'listening' && (
          <>
            <span className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-20" />
            <span className="absolute -inset-1 animate-pulse rounded-full border-2 border-red-300 opacity-40" />
          </>
        )}

        {/* Microphone icon */}
        {status === 'listening' ? (
          <svg className="relative z-10 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
          </svg>
        )}
      </button>

      {/* Status label */}
      <span className="text-xs text-stone-500">{statusLabel[status]}</span>

      {/* Live transcript */}
      {transcript && status === 'listening' && (
        <p className="max-w-xs text-center text-sm text-stone-600 italic">
          &ldquo;{transcript}&rdquo;
        </p>
      )}

      {/* Security mode badge */}
      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
        securityLevel === 'local'
          ? 'bg-amber-50 text-amber-600'
          : 'bg-emerald-50 text-emerald-600'
      }`}>
        {securityLevel === 'local' ? 'On-device voice' : 'Cloud voice'}
      </span>
    </div>
  );
}
