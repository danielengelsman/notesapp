// AI Security Router
// Routes requests to Claude (cloud) or Ollama (local) based on note security level

import { callOllama } from './ollama';

export type AIMode = 'cloud' | 'local';

export function getAIMode(securityLevel: 'cloud' | 'local'): AIMode {
  return securityLevel;
}

// For local-only notes, process entirely on-device via Ollama
export async function routeLocalAI(
  prompt: string,
  context: string
): Promise<string> {
  return callOllama(prompt, context);
}
