import { describe, it, expect, vi, afterEach } from "vitest";
import { speak, stopSpeaking, isSpeaking } from "../guide/speech";

/** jsdom doesn't define SpeechSynthesisUtterance — provide a stand-in. */
class MockUtterance {
  text: string;
  voice: unknown = null;
  rate = 1;
  pitch = 1;
  volume = 1;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(text: string) {
    this.text = text;
  }
}

function defineGlobal<T>(name: string, value: T) {
  try {
    Object.defineProperty(globalThis, name, {
      configurable: true,
      writable: true,
      value,
    });
  } catch {
    // @ts-expect-error assignment fallback for read-only globals
    globalThis[name] = value;
  }
}

function setSpeechSynthesis(impl: unknown) {
  Object.defineProperty(window, "speechSynthesis", {
    configurable: true,
    value: impl,
  });
}

afterEach(() => {
  Object.defineProperty(window, "speechSynthesis", {
    configurable: true,
    value: undefined,
  });
});

describe("speak", () => {
  it("is a no-op (never throws) when speechSynthesis is unavailable", () => {
    setSpeechSynthesis(undefined);
    expect(() => speak("Ready to scan your home.")).not.toThrow();
    expect(isSpeaking()).toBe(false);
  });

  it("never throws when speechSynthesis.speak throws", () => {
    defineGlobal("SpeechSynthesisUtterance", MockUtterance);
    setSpeechSynthesis({
      speak: () => {
        throw new Error("TTS broken");
      },
      cancel: () => {},
      getVoices: () => [],
    });
    expect(() => speak("Ready to scan your home.")).not.toThrow();
    expect(isSpeaking()).toBe(false);
  });

  it("never throws when getVoices throws", () => {
    defineGlobal("SpeechSynthesisUtterance", MockUtterance);
    setSpeechSynthesis({
      speak: () => {},
      cancel: () => {},
      getVoices: () => {
        throw new Error("voices unavailable");
      },
    });
    expect(() => speak("Ready to scan your home.")).not.toThrow();
  });

  it("passes an utterance to speechSynthesis.speak", () => {
    defineGlobal("SpeechSynthesisUtterance", MockUtterance);
    const speakSpy = vi.fn();
    setSpeechSynthesis({
      speak: speakSpy,
      cancel: () => {},
      getVoices: () => [],
    });
    speak("test message");
    expect(speakSpy).toHaveBeenCalledTimes(1);
    const utterance = speakSpy.mock.calls[0][0];
    expect(utterance).toBeInstanceOf(MockUtterance);
    expect(utterance.text).toBe("test message");
  });

  it("stopSpeaking cancels without throwing", () => {
    const cancelSpy = vi.fn();
    setSpeechSynthesis({ speak: () => {}, cancel: cancelSpy, getVoices: () => [] });
    expect(() => stopSpeaking()).not.toThrow();
    expect(cancelSpy).toHaveBeenCalled();
  });
});

