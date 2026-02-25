'use client';

import { useState, useCallback, useRef } from 'react';
import { WebSpeechSTT, localTTS, isWebSpeechSupported } from '@/lib/voice/webSpeech';
import { getVoiceMode } from '@/lib/voice';

export function useVoice(securityLevel: 'cloud' | 'local' = 'cloud') {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [agentOpen, setAgentOpen] = useState(false);
  const sttRef = useRef<WebSpeechSTT | null>(null);

  const voiceMode = getVoiceMode(securityLevel);
  const isSupported = typeof window !== 'undefined' && (voiceMode === 'elevenlabs' || isWebSpeechSupported());

  const startListening = useCallback((onFinalTranscript?: (text: string) => void) => {
    if (voiceMode === 'elevenlabs') {
      setAgentOpen(true);
      return;
    }

    if (!isWebSpeechSupported()) return;

    const stt = new WebSpeechSTT();
    sttRef.current = stt;
    setTranscript('');

    stt.start(
      (text, isFinal) => {
        setTranscript(text);
        if (isFinal) {
          onFinalTranscript?.(text);
        }
      },
      () => setIsListening(false)
    );

    setIsListening(true);
  }, [voiceMode]);

  const stopListening = useCallback(() => {
    sttRef.current?.stop();
    setIsListening(false);
  }, []);

  const speak = useCallback(async (text: string) => {
    if (voiceMode === 'web-speech') {
      setIsSpeaking(true);
      await localTTS(text);
      setIsSpeaking(false);
    }
    // Cloud TTS is handled by ElevenLabs agent
  }, [voiceMode]);

  const closeAgent = useCallback(() => {
    setAgentOpen(false);
  }, []);

  return {
    isListening,
    isSpeaking,
    transcript,
    isSupported,
    voiceMode,
    agentOpen,
    startListening,
    stopListening,
    speak,
    closeAgent,
    openAgent: () => setAgentOpen(true),
  };
}
