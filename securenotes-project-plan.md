# SecureNotes AI — Project Plan & Architecture

## Build Guide for Claude Code — Netlify + Supabase

---

## Overview

A voice-first, AI-powered notes and reminders PWA with end-to-end encryption. Built on Next.js + Supabase + Netlify, with Claude API for cloud AI and Ollama for local-only processing.

**Core principle:** Your data stays yours. Every note is encrypted. Sensitive notes never leave your device.

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 14 (App Router) + React | PWA support, SSR, great DX |
| Styling | Tailwind CSS | Fast iteration, responsive |
| Database | Supabase (PostgreSQL + Auth + RLS) | Fastest to launch, built-in auth |
| Hosting | Netlify | Easy deploys, serverless functions, great Next.js support |
| Cloud AI | Anthropic Claude API (Sonnet) | Smart, fast, zero-retention option |
| Local AI | Ollama (via WebSocket to local server) | On-device processing for sensitive notes |
| Voice (Cloud) | ElevenLabs Conversational AI Agents | All-in-one: STT + LLM + TTS in one natural conversation. Uses Claude under the hood. Replaces separate Deepgram + Claude + TTS wiring |
| Voice (Local) | Web Speech API (browser built-in) | On-device fallback for Local Only notes — no data leaves device |
| Encryption | Web Crypto API + Supabase vault | Client-side AES-256-GCM |
| PWA | next-pwa / Serwist | Offline support, installable |

### Voice Architecture: Two Modes

**Cloud Mode (default):** ElevenLabs Agents handles the entire voice pipeline — it listens to your speech, sends it to Claude for reasoning, and speaks the response back in a natural voice. One integration instead of three. It can also call tools (webhooks) mid-conversation to create notes, set reminders, or search your database directly.

**Local Mode (for sensitive notes):** Falls back to the browser's built-in Web Speech API for speech-to-text and text-to-speech. Lower quality, but your voice and note content never leave your device. Ollama handles the AI reasoning locally.

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│  USER'S DEVICE (Browser / PWA)                           │
│                                                          │
│  ┌─────────────┐  ┌──────────────┐                      │
│  │  Next.js    │  │  Web Crypto  │                      │
│  │  React App  │──│  AES-256-GCM │                      │
│  └──────┬──────┘  └──────────────┘                      │
│         │                                                │
│  ┌──────┴──────────────────────┐                        │
│  │    Security Router          │                        │
│  │                             │                        │
│  │  LOCAL MODE    CLOUD MODE   │                        │
│  │  ┌─────────┐  ┌──────────┐ │                        │
│  │  │ Ollama  │  │ Claude   │ │  ← Text-based AI       │
│  │  │ (AI)    │  │ API      │ │                        │
│  │  ├─────────┤  ├──────────┤ │                        │
│  │  │ Web     │  │ElevenLabs│ │  ← Voice interaction   │
│  │  │ Speech  │  │ Agent    │ │    (STT + AI + TTS     │
│  │  │ API     │  │          │ │     all-in-one)        │
│  │  └─────────┘  └────┬─────┘ │                        │
│  └─────────────────────┼───────┘                        │
└────────────────────────┼─────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
   ┌──────▼──────┐ ┌────▼─────────────▼──────┐
   │  Supabase   │ │  ElevenLabs Agent        │
   │  DB + Auth  │ │  ┌─────────────────────┐ │
   │  (encrypted │ │  │ Scribe (STT)        │ │
   │   at rest)  │ │  │ Claude (reasoning)  │ │
   │             │ │  │ Voice (TTS)         │ │
   │             │ │  │ Tools (webhooks to  │ │
   │             │ │  │   create notes,     │ │
   │             │ │  │   set reminders,    │ │
   │             │ │  │   search DB)        │ │
   │             │ │  └─────────────────────┘ │
   └─────────────┘ └─────────────────────────┘
```

---

## Phase 1: Foundation (Week 1)

### 1.1 Project Setup

```bash
# Create Next.js project
npx create-next-app@latest securenotes-ai --typescript --tailwind --app --src-dir

# Install core dependencies
npm install @supabase/supabase-js @supabase/ssr
npm install @anthropic-ai/sdk
npm install next-pwa   # or serwist for newer PWA support

# Netlify adapter for Next.js
npm install @netlify/plugin-nextjs
```

**Netlify config — create `netlify.toml` in project root:**

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[functions]
  # Increase timeout for AI streaming responses (Pro plan: up to 26s)
  external_node_modules = ["@anthropic-ai/sdk"]

# Environment variables are set in Netlify dashboard (Site > Environment variables)
# NEVER put secrets in this file
```

**Folder structure:**

```
src/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Home — notes list
│   ├── note/[id]/page.tsx      # Note editor
│   ├── chat/page.tsx           # AI assistant (full-screen)
│   ├── api/
│   │   ├── ai/chat/route.ts    # Claude API proxy (text-based chat)
│   │   ├── ai/summarize/route.ts
│   │   ├── agent/create-note/route.ts    # ElevenLabs Agent webhook
│   │   ├── agent/create-reminder/route.ts
│   │   ├── agent/search-notes/route.ts
│   │   └── agent/get-upcoming/route.ts
│   └── auth/
│       ├── login/page.tsx
│       └── callback/route.ts
├── components/
│   ├── NoteCard.tsx
│   ├── NoteEditor.tsx
│   ├── AIChatPanel.tsx
│   ├── VoiceButton.tsx
│   ├── SecurityBadge.tsx
│   ├── Sidebar.tsx
│   └── SearchBar.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser client
│   │   ├── server.ts           # Server client
│   │   └── middleware.ts       # Auth middleware
│   ├── encryption/
│   │   ├── crypto.ts           # Web Crypto API wrapper
│   │   └── keyManager.ts       # Key derivation from password
│   ├── ai/
│   │   ├── claude.ts           # Claude API wrapper
│   │   ├── ollama.ts           # Local LLM client
│   │   ├── router.ts           # Routes to local or cloud based on security level
│   │   └── commands.ts         # Parse voice/text commands
│   ├── voice/
│   │   ├── agent.ts            # ElevenLabs Agent wrapper (cloud voice mode)
│   │   └── webSpeech.ts        # Browser Web Speech API fallback (local mode)
│   └── hooks/
│       ├── useNotes.ts
│       ├── useVoice.ts
│       ├── useAI.ts
│       └── useEncryption.ts
├── types/
│   └── index.ts
└── stores/
    └── appStore.ts             # Zustand for client state
```

### 1.2 Supabase Setup

**Create these tables in Supabase SQL editor:**

```sql
-- Enable Row Level Security on all tables
-- Users are handled by Supabase Auth automatically

-- Notes table
CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled',
  content_encrypted TEXT NOT NULL,          -- AES-256-GCM encrypted content
  content_iv TEXT NOT NULL,                 -- Initialization vector for decryption
  folder TEXT NOT NULL DEFAULT 'Personal',
  tags TEXT[] DEFAULT '{}',
  security_level TEXT NOT NULL DEFAULT 'cloud' CHECK (security_level IN ('cloud', 'local')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reminders table
CREATE TABLE reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Folders table (user-custom folders)
CREATE TABLE folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User encryption keys (encrypted master key, wrapped with password-derived key)
CREATE TABLE user_keys (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  wrapped_key TEXT NOT NULL,               -- Master key encrypted with password-derived key
  key_salt TEXT NOT NULL,                  -- Salt for PBKDF2 key derivation
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security policies
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access own notes"
  ON notes FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access own reminders"
  ON reminders FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access own folders"
  ON folders FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access own keys"
  ON user_keys FOR ALL USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 1.3 Client-Side Encryption

```typescript
// src/lib/encryption/crypto.ts

// Key derivation from user's password
export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 600000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

// Encrypt note content
export async function encryptContent(content: string, key: CryptoKey): Promise<{ encrypted: string; iv: string }> {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(content)
  );
  return {
    encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
  };
}

// Decrypt note content
export async function decryptContent(encrypted: string, iv: string, key: CryptoKey): Promise<string> {
  const decoder = new TextDecoder();
  const encryptedBytes = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
  const ivBytes = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes },
    key,
    encryptedBytes
  );
  return decoder.decode(decrypted);
}
```

**How it works:** The user's password derives an encryption key via PBKDF2. All note content is encrypted/decrypted in the browser. Supabase only ever stores ciphertext. Even if the database is breached, notes are unreadable without the user's password.

---

## Phase 2: AI Integration (Week 2)

### 2.1 AI Security Router

```typescript
// src/lib/ai/router.ts

import { callClaude } from './claude';
import { callOllama } from './ollama';

export async function routeAIRequest(
  prompt: string,
  context: string,
  securityLevel: 'cloud' | 'local'
) {
  if (securityLevel === 'local') {
    // Process entirely on-device via Ollama
    return callOllama(prompt, context);
  } else {
    // Use Claude API (zero data retention)
    return callClaude(prompt, context);
  }
}
```

### 2.2 Claude API Integration

```typescript
// src/app/api/ai/chat/route.ts

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';

const anthropic = new Anthropic(); // Uses ANTHROPIC_API_KEY env var

export async function POST(req: Request) {
  // Verify authenticated user
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { messages, noteContext } = await req.json();

  const systemPrompt = `You are a secure notes assistant. You help the user manage their notes, reminders, and tasks.
You can:
- Summarize notes
- Extract action items
- Create new notes (respond with JSON: {"action": "create_note", "title": "...", "content": "...", "folder": "..."})
- Set reminders (respond with JSON: {"action": "create_reminder", "text": "...", "due_date": "ISO date"})
- Search and find information across notes
- Give briefings on upcoming items

Current note context (if any): ${noteContext || 'No specific note selected'}
Current date: ${new Date().toISOString()}

Always be concise and helpful. When creating notes or reminders, include the JSON action in your response.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages,
  });

  return Response.json({
    content: response.content[0].text,
  });
}
```

### 2.3 Ollama (Local LLM) Integration

```typescript
// src/lib/ai/ollama.ts

// Ollama runs locally on the user's machine (localhost:11434)
// For sensitive "local only" notes, AI never leaves the device

const OLLAMA_URL = 'http://localhost:11434';

export async function callOllama(prompt: string, context: string): Promise<string> {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2',  // or mistral, phi3, etc.
        prompt: `Context: ${context}\n\nUser request: ${prompt}`,
        stream: false,
      }),
    });
    const data = await response.json();
    return data.response;
  } catch (error) {
    return 'Local AI is not available. Please ensure Ollama is running (ollama serve).';
  }
}
```

### 2.4 Command Parser

```typescript
// src/lib/ai/commands.ts

// Parse AI responses for actionable commands
export function parseAIResponse(response: string) {
  const actions = [];
  
  // Look for JSON action blocks in the response
  const jsonRegex = /\{"action":\s*"(\w+)"[^}]+\}/g;
  let match;
  
  while ((match = jsonRegex.exec(response)) !== null) {
    try {
      const action = JSON.parse(match[0]);
      actions.push(action);
    } catch {}
  }

  // Clean response text (remove JSON blocks for display)
  const cleanText = response.replace(jsonRegex, '').trim();

  return { text: cleanText, actions };
}
```

---

## Phase 3: Voice Integration (Week 3)

### 3.1 ElevenLabs Conversational AI Agent Setup

Instead of wiring up three separate services (Deepgram STT + Claude API + ElevenLabs TTS), we use ElevenLabs Agents which bundles the entire voice pipeline into one integration.

**Step 1: Create your agent in the ElevenLabs dashboard**

1. Go to elevenlabs.io → Conversational AI → Create Agent
2. Choose Claude as the LLM (Sonnet recommended)
3. Set the system prompt (see below)
4. Add tools (webhooks) for creating notes, setting reminders, searching
5. Choose a voice (or clone your own)

**Agent system prompt:**

```
You are a secure notes assistant called SecureNotes AI. You help the user manage their encrypted notes, reminders, and tasks through natural voice conversation.

You can:
- Create new notes (use the create_note tool)
- Set reminders (use the create_reminder tool)  
- Search notes (use the search_notes tool)
- Summarize notes and give briefings
- Extract action items from notes

Be concise and conversational. Confirm actions briefly. When giving briefings, prioritize urgent items first.

Current date: dynamic (set via metadata)
```

**Step 2: Configure agent tools (webhooks)**

In the ElevenLabs dashboard, add these tools that the agent can call mid-conversation:

```json
// Tool 1: Create Note
{
  "name": "create_note",
  "description": "Create a new note for the user",
  "parameters": {
    "title": { "type": "string", "description": "Note title" },
    "content": { "type": "string", "description": "Note content" },
    "folder": { "type": "string", "description": "Folder name" },
    "tags": { "type": "array", "description": "Tags for the note" }
  },
  "webhook_url": "https://your-app.netlify.app/api/agent/create-note"
}

// Tool 2: Create Reminder
{
  "name": "create_reminder",
  "description": "Set a reminder for the user",
  "parameters": {
    "text": { "type": "string", "description": "Reminder text" },
    "due_date": { "type": "string", "description": "Due date in ISO format" }
  },
  "webhook_url": "https://your-app.netlify.app/api/agent/create-reminder"
}

// Tool 3: Search Notes
{
  "name": "search_notes",
  "description": "Search user's notes by keyword",
  "parameters": {
    "query": { "type": "string", "description": "Search query" }
  },
  "webhook_url": "https://your-app.netlify.app/api/agent/search-notes"
}

// Tool 4: Get Upcoming Reminders
{
  "name": "get_upcoming",
  "description": "Get upcoming reminders and deadlines",
  "parameters": {},
  "webhook_url": "https://your-app.netlify.app/api/agent/get-upcoming"
}
```

**Step 3: Create webhook endpoints in your Next.js app**

```typescript
// src/app/api/agent/create-note/route.ts

import { createClient } from '@/lib/supabase/server';
import { encryptContent } from '@/lib/encryption/crypto';

export async function POST(req: Request) {
  // Verify the request is from ElevenLabs (check webhook secret)
  const signature = req.headers.get('x-elevenlabs-signature');
  // ... verify signature

  const { title, content, folder, tags } = await req.json();
  
  const supabase = createClient();
  const { encrypted, iv } = await encryptContent(content, masterKey);
  
  const { data, error } = await supabase.from('notes').insert({
    title,
    content_encrypted: encrypted,
    content_iv: iv,
    folder: folder || 'Personal',
    tags: tags || [],
    security_level: 'cloud',
  });

  return Response.json({ 
    success: true, 
    message: `Note "${title}" created in ${folder || 'Personal'} folder.` 
  });
}
```

```typescript
// src/app/api/agent/get-upcoming/route.ts

import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = createClient();
  
  const { data: reminders } = await supabase
    .from('reminders')
    .select('*')
    .eq('completed', false)
    .order('due_date', { ascending: true })
    .limit(10);

  const formatted = reminders?.map(r => {
    const days = Math.ceil((new Date(r.due_date).getTime() - Date.now()) / 86400000);
    const when = days <= 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`;
    return `${r.text} — due ${when}`;
  });

  return Response.json({
    upcoming: formatted,
    count: reminders?.length || 0,
  });
}
```

**Step 4: Embed the agent in your React app**

```typescript
// src/components/VoiceAgent.tsx

import { useConversation } from '@11labs/react';

export function VoiceAgent({ onClose }: { onClose: () => void }) {
  const conversation = useConversation({
    agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID!,
    onConnect: () => console.log('Voice agent connected'),
    onDisconnect: () => console.log('Voice agent disconnected'),
    onMessage: (message) => console.log('Agent:', message),
  });

  const startConversation = async () => {
    // Request microphone permission
    await navigator.mediaDevices.getUserMedia({ audio: true });
    await conversation.startSession();
  };

  const stopConversation = async () => {
    await conversation.endSession();
  };

  return (
    <div>
      <div>Status: {conversation.status}</div>
      <div>Agent is {conversation.isSpeaking ? 'speaking' : 'listening'}</div>
      
      <button onClick={startConversation}>Start Voice Chat</button>
      <button onClick={stopConversation}>End</button>
    </div>
  );
}
```

```bash
# Install the ElevenLabs React SDK
npm install @11labs/react
```

### 3.2 Local Voice Fallback (for "Local Only" notes)

When a note is marked as Local Only, the app falls back to the browser's built-in Web Speech API. This keeps everything on-device.

```typescript
// src/lib/voice/webSpeech.ts

export class WebSpeechSTT {
  private recognition: SpeechRecognition | null = null;

  start(onTranscript: (text: string, isFinal: boolean) => void) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    
    this.recognition = new SR();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    
    this.recognition.onresult = (e) => {
      const result = e.results[e.results.length - 1];
      onTranscript(result[0].transcript, result.isFinal);
    };
    
    this.recognition.start();
  }

  stop() {
    this.recognition?.stop();
  }
}

export function localTTS(text: string) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;
  speechSynthesis.speak(utterance);
}
```

### 3.3 Voice Security Router

```typescript
// src/lib/voice/index.ts

// Decides which voice system to use based on note security level

export function getVoiceMode(securityLevel: 'cloud' | 'local') {
  if (securityLevel === 'local') {
    return 'web-speech';   // On-device, no data transmitted
  } else {
    return 'elevenlabs';   // ElevenLabs Agent (STT + Claude + TTS all-in-one)
  }
}
```

---

## Phase 4: PWA & Polish (Week 4)

### 4.1 PWA Configuration

```typescript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA({
  // Next.js config
});
```

```json
// public/manifest.json
{
  "name": "SecureNotes AI",
  "short_name": "SecureNotes",
  "description": "Encrypted, AI-powered notes with voice control",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FAFAF8",
  "theme_color": "#2D6A4F",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### 4.2 Offline Support

Notes are encrypted and cached locally using the service worker. When offline, the app works with cached notes and the local LLM (if Ollama is running). Syncs back to Supabase when connection returns.

### 4.3 Netlify Deployment

```bash
# Option A: Connect Git repo (recommended)
# 1. Push your code to GitHub/GitLab
# 2. In Netlify dashboard: "Add new site" → "Import an existing project"
# 3. Select your repo — Netlify auto-detects Next.js
# 4. Set environment variables in Site > Environment variables
# 5. Deploy

# Option B: CLI deploy
npm install -g netlify-cli
netlify login
netlify init          # Link to your Netlify site
netlify deploy --build --prod
```

**Important Netlify notes:**
- Free tier has a 10-second function timeout. For AI streaming responses, upgrade to Pro ($19/month) for 26-second timeouts.
- API routes (e.g. `/api/ai/chat`) automatically become Netlify Functions — no code changes needed.
- Set all environment variables in the Netlify dashboard under Site > Environment variables.

---

## Environment Variables

```bash
# .env.local (NEVER commit this file)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Anthropic (Claude) — used for text-based AI chat
ANTHROPIC_API_KEY=sk-ant-...

# ElevenLabs — Conversational AI Agent (handles all voice: STT + Claude + TTS)
ELEVENLABS_API_KEY=...
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=...     # Your agent ID from the ElevenLabs dashboard
ELEVENLABS_WEBHOOK_SECRET=...            # For verifying webhook calls from the agent
```

---

## Claude Code Session Plan

Here's the order to build this in Claude Code, phase by phase:

### Session 1: "Set up the foundation"
```
Create a Next.js 14 app with TypeScript and Tailwind.
Set up Supabase client with auth (email + password).
Create the database schema (notes, reminders, folders, user_keys tables).
Implement client-side AES-256-GCM encryption using Web Crypto API.
Build the basic notes CRUD — create, read, update, delete with encryption.
All note content must be encrypted before storing and decrypted after fetching.
```

### Session 2: "Build the UI"
```
Port the UI design from our prototype (I'll paste the JSX).
Build: Sidebar with folders, note cards grid, note editor, search bar.
Light warm colour palette: cream background (#FAFAF8), sage green accent (#2D6A4F).
Make it fully responsive — works as PWA on mobile.
Add the security level toggle (Local / Cloud) on each note.
```

### Session 3: "Add AI chat"
```
Create the AI chat panel component with the conversation UI.
Build API route that proxies to Claude API.
Implement the command parser — detect when AI wants to create notes, set reminders, search.
Wire up: summarize notes, smart search, extract action items, create reminders.
AI security router: cloud notes use Claude API, local notes use Ollama.
```

### Session 4: "Add voice"
```
Integrate ElevenLabs Conversational AI Agent for cloud voice mode.
Install @11labs/react SDK and embed the voice agent component.
Create webhook API routes for the agent tools: create-note, create-reminder, search-notes, get-upcoming.
The agent uses Claude under the hood for reasoning — configure in ElevenLabs dashboard.
Keep Web Speech API as fallback for local-only mode (on-device).
Build the voice button with pulse animation and status indicators (listening/speaking).
Security routing: local notes use on-device Web Speech API only, cloud notes use ElevenLabs Agent.
```

### Session 5: "PWA + deploy"
```
Add PWA manifest and service worker.
Configure offline caching for notes.
Add netlify.toml config with @netlify/plugin-nextjs.
Deploy to Netlify (connect Git repo or use netlify-cli).
Set environment variables in Netlify dashboard.
Test the full flow: sign up, create note, encrypt, AI chat, voice commands, reminders.
```

---

## API Costs (Estimated Monthly)

| Service | Free Tier | Estimated Cost at Scale |
|---------|-----------|------------------------|
| Supabase | 500MB DB, 50K auth users | Free for personal use |
| Netlify | 100GB bandwidth, 300 build min | Free (Starter); Pro $19/month for longer function timeouts |
| Claude API (Sonnet) | — | ~$5–15/month (text-based AI chat) |
| ElevenLabs | 10K chars/month free; Conversational AI included on paid plans | ~$5–22/month (Starter/Creator plan covers voice agent) |
| **Total** | **Nearly free to start** | **~$10–55/month** |

**Note:** With ElevenLabs Agents, you no longer need a separate Deepgram account. ElevenLabs handles speech-to-text, AI reasoning (via Claude), and text-to-speech all in one. The Claude API key is still used for the text-based chat in the app (typing, not voice).

---

## Security Summary

| Threat | Protection |
|--------|-----------|
| Database breach | All content AES-256-GCM encrypted client-side |
| Man-in-the-middle | HTTPS + encrypted payloads |
| Supabase admin access | Content is ciphertext — unreadable without user password |
| AI provider data leak | Cloud: Claude zero-retention; Local: Ollama on-device |
| Voice data exposure | Cloud: ElevenLabs Agent (audio transits their servers, SOC 2 / GDPR compliant); Local: Web Speech API (fully on-device) |
| Session hijacking | Supabase Auth with RLS policies |
| Password cracking | PBKDF2 with 600K iterations + unique salt |

---

## Getting Started

1. **Install Claude Code:** `npm install -g @anthropic-ai/claude-code`
2. **Create Supabase project:** supabase.com → New Project
3. **Create Netlify site:** netlify.com → Add new site (or wait until Session 5)
4. **Create ElevenLabs account:** elevenlabs.io → Sign up → Set up a Conversational AI Agent
5. **Start Session 1** with the prompt above
6. **Iterate** — each session builds on the last

**You no longer need a Deepgram account.** ElevenLabs Agents handles speech-to-text, AI reasoning, and text-to-speech in one integration.

The prototype JSX we already built can be pasted into Session 2 as the design reference.
