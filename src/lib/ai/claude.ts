// Claude API wrapper — called from the server-side API route only

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic(); // Uses ANTHROPIC_API_KEY env var

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function streamClaude(
  messages: ChatMessage[],
  systemPrompt: string
) {
  const stream = anthropic.messages.stream({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  });

  return stream;
}
