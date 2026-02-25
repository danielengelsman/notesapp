// Ollama local LLM client — runs entirely on-device
// Used for "local only" notes that should never leave the machine

const OLLAMA_URL = 'http://localhost:11434';

export async function callOllama(
  prompt: string,
  context: string
): Promise<string> {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2',
        prompt: `Context: ${context}\n\nUser request: ${prompt}`,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama returned ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch {
    return 'Local AI is not available. Please ensure Ollama is running (`ollama serve`) with a model installed (`ollama pull llama3.2`).';
  }
}
