// Voice Security Router
// Decides which voice system to use based on note security level

export type VoiceMode = 'elevenlabs' | 'web-speech';

export function getVoiceMode(securityLevel: 'cloud' | 'local'): VoiceMode {
  if (securityLevel === 'local') {
    return 'web-speech'; // On-device, no data transmitted
  }
  return 'elevenlabs'; // ElevenLabs Agent (STT + Claude + TTS all-in-one)
}
