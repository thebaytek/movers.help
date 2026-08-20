/**
 * Web Speech API TTS wrapper.
 * Speaks text using window.speechSynthesis with a natural voice.
 */

let speaking = false;
let utterance: SpeechSynthesisUtterance | null = null;

export function speak(text: string): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  // TTS is best-effort — never let it throw and break the scan pipeline.
  try {
    // Don't interrupt unless speaking
    if (speaking) {
      window.speechSynthesis.cancel();
    }

    utterance = new SpeechSynthesisUtterance(text);

    // Try to pick a natural English voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) => v.lang.startsWith("en") && v.name.includes("Female"),
    );
    if (preferred) {
      utterance.voice = preferred;
    }

    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 0.9;

    utterance.onstart = () => {
      speaking = true;
    };
    utterance.onend = () => {
      speaking = false;
    };
    utterance.onerror = () => {
      speaking = false;
    };

    window.speechSynthesis.speak(utterance);
  } catch {
    speaking = false;
  }
}

export function stopSpeaking(): void {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    speaking = false;
  }
}

export function isSpeaking(): boolean {
  return speaking;
}
