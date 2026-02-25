// Parse AI responses for actionable commands

export interface AIAction {
  action: 'create_note' | 'create_reminder' | 'search_notes';
  title?: string;
  content?: string;
  folder?: string;
  tags?: string[];
  text?: string;
  due_date?: string;
  query?: string;
}

export interface ParsedResponse {
  text: string;
  actions: AIAction[];
}

export function parseAIResponse(response: string): ParsedResponse {
  const actions: AIAction[] = [];

  // Look for JSON action blocks in the response
  const jsonRegex = /```json\s*(\{[\s\S]*?\})\s*```|\{"\s*action"\s*:\s*"(\w+)"[^}]*\}/g;
  let match;

  while ((match = jsonRegex.exec(response)) !== null) {
    try {
      const jsonStr = match[1] || match[0];
      const action = JSON.parse(jsonStr) as AIAction;
      if (action.action) {
        actions.push(action);
      }
    } catch {
      // Skip invalid JSON
    }
  }

  // Clean response text (remove JSON blocks for display)
  const cleanText = response
    .replace(/```json\s*\{[\s\S]*?\}\s*```/g, '')
    .replace(/\{"action":\s*"\w+"[^}]*\}/g, '')
    .trim();

  return { text: cleanText, actions };
}

export function buildSystemPrompt(noteContext?: string): string {
  return `You are a secure notes assistant called SecureNotes AI. You help the user manage their encrypted notes, reminders, and tasks.

You can:
- Summarize notes
- Extract action items and to-dos
- Create new notes — include a JSON block like: \`\`\`json\n{"action": "create_note", "title": "...", "content": "...", "folder": "Personal"}\n\`\`\`
- Set reminders — include a JSON block like: \`\`\`json\n{"action": "create_reminder", "text": "...", "due_date": "YYYY-MM-DDTHH:mm:ss"}\n\`\`\`
- Search notes — include a JSON block like: \`\`\`json\n{"action": "search_notes", "query": "..."}\n\`\`\`
- Give briefings on upcoming items

${noteContext ? `Current note context:\n${noteContext}` : 'No specific note selected.'}

Current date: ${new Date().toISOString()}

Be concise and helpful. When creating notes or reminders, include the JSON action block AND a brief confirmation message.`;
}
