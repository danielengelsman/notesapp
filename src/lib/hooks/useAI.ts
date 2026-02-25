'use client';

import { useState, useCallback, useRef } from 'react';
import { parseAIResponse, type ParsedResponse } from '@/lib/ai/commands';
import { routeLocalAI } from '@/lib/ai/router';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actions?: ParsedResponse['actions'];
  isStreaming?: boolean;
}

export function useAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (
      content: string,
      options?: {
        noteContext?: string;
        securityLevel?: 'cloud' | 'local';
      }
    ) => {
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      const assistantId = crypto.randomUUID();

      try {
        // Local mode — use Ollama on-device
        if (options?.securityLevel === 'local') {
          setMessages((prev) => [
            ...prev,
            { id: assistantId, role: 'assistant', content: '', isStreaming: true },
          ]);

          const response = await routeLocalAI(content, options?.noteContext || '');
          const parsed = parseAIResponse(response);

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: parsed.text || response, actions: parsed.actions, isStreaming: false }
                : m
            )
          );

          return parsed;
        }

        // Cloud mode — stream from Claude API
        const apiMessages = [
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: 'user' as const, content },
        ];

        abortRef.current = new AbortController();

        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: apiMessages,
            noteContext: options?.noteContext,
          }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'AI request failed');
        }

        // Add empty assistant message for streaming
        setMessages((prev) => [
          ...prev,
          { id: assistantId, role: 'assistant', content: '', isStreaming: true },
        ]);

        // Read SSE stream
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') break;

                try {
                  const parsed = JSON.parse(data);
                  if (parsed.text) {
                    fullText += parsed.text;
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === assistantId
                          ? { ...m, content: fullText }
                          : m
                      )
                    );
                  }
                  if (parsed.error) {
                    throw new Error(parsed.error);
                  }
                } catch (e) {
                  if (e instanceof SyntaxError) continue;
                  throw e;
                }
              }
            }
          }
        }

        // Parse final response for actions
        const parsed = parseAIResponse(fullText);

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: parsed.text || fullText, actions: parsed.actions, isStreaming: false }
              : m
          )
        );

        return parsed;
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: m.content || 'Cancelled.', isStreaming: false }
                : m
            )
          );
          return null;
        }

        const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: errorMessage, isStreaming: false }
              : m
          ).length > 0
            ? prev.some((m) => m.id === assistantId)
              ? prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: errorMessage, isStreaming: false }
                    : m
                )
              : [
                  ...prev,
                  { id: assistantId, role: 'assistant' as const, content: errorMessage, isStreaming: false },
                ]
            : prev
        );

        return null;
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [messages]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    stopStreaming,
    clearMessages,
  };
}
