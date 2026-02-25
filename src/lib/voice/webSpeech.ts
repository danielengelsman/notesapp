// Web Speech API — on-device STT and TTS for local-only mode
// No data leaves the device

export class WebSpeechSTT {
  private recognition: SpeechRecognition | null = null;
  private _isListening = false;

  get isListening() {
    return this._isListening;
  }

  start(onTranscript: (text: string, isFinal: boolean) => void, onEnd?: () => void) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      console.warn('SpeechRecognition not supported in this browser');
      return false;
    }

    this.recognition = new SR();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (e) => {
      const result = e.results[e.results.length - 1];
      onTranscript(result[0].transcript, result.isFinal);
    };

    this.recognition.onend = () => {
      this._isListening = false;
      onEnd?.();
    };

    this.recognition.onerror = (e) => {
      console.error('Speech recognition error:', e.error);
      this._isListening = false;
      onEnd?.();
    };

    this.recognition.start();
    this._isListening = true;
    return true;
  }

  stop() {
    this.recognition?.stop();
    this._isListening = false;
  }
}

export function localTTS(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      console.warn('SpeechSynthesis not supported');
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    speechSynthesis.speak(utterance);
  });
}

export function isWebSpeechSupported(): boolean {
  return !!(
    (typeof window !== 'undefined') &&
    (window.SpeechRecognition || window.webkitSpeechRecognition)
  );
}
