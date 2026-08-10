export interface SpeechOptions {
  text: string;
  lang?: string;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

export const speakWithWebSpeech = (options: SpeechOptions) => {
  const { text, lang = "fr-FR", onEnd, onError } = options;

  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    if (onEnd) onEnd();
    return;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Choose appropriate voice or language
    utterance.lang = lang === "gcr" ? "fr-FR" : lang;
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn("Speech synthesis error:", e);
      if (onEnd) onEnd();
      if (onError) onError(e);
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("Speech synthesis failed:", err);
    if (onEnd) onEnd();
  }
};
