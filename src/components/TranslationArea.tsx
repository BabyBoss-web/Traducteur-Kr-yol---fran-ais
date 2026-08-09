import React, { useState, useEffect, useRef } from "react";
import {
  Copy,
  Check,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  RotateCcw,
  BookOpen,
  Sparkles,
  Loader2,
  X,
  Star,
  Send,
} from "lucide-react";
import { Language, TranslationResult } from "../types";
import { GrammarBreakdown } from "./GrammarBreakdown";

interface TranslationAreaProps {
  sourceText: string;
  setSourceText: (text: string) => void;
  translatedText: string;
  translationResult: TranslationResult | null;
  sourceLang: Language;
  targetLang: Language;
  isLoading: boolean;
  onTranslate: () => void;
  onClear: () => void;
  onCopy: (text: string) => void;
  isCopied: boolean;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
}

export const TranslationArea: React.FC<TranslationAreaProps> = ({
  sourceText,
  setSourceText,
  translatedText,
  translationResult,
  sourceLang,
  targetLang,
  isLoading,
  onTranslate,
  onClear,
  onCopy,
  isCopied,
  onToggleFavorite,
  isFavorite,
}) => {
  const [showAnalysis, setShowAnalysis] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Setup SpeechRecognition if supported
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = sourceLang === "fr" ? "fr-FR" : "fr-FR"; // Speech API fallback

        recognition.onresult = (event: any) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setSourceText(transcript);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [sourceLang, setSourceText]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("La reconnaissance vocale n'est pas supportée sur ce navigateur.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
        setIsListening(false);
      }
    }
  };

  // Text-To-Speech handler using Backend Gemini TTS (with Guadeloupean Creole Accent) + Web Speech API fallback
  const playAudio = async (textToPlay: string, lang: Language) => {
    if (!textToPlay || isPlayingAudio) return;
    setIsPlayingAudio(true);

    try {
      // 1. Try server backend Gemini TTS for authentic Guadeloupean accent
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToPlay, lang }),
      });

      const data = await response.json();

      if (data.success && data.audioBase64) {
        const mimeType = data.mimeType || "audio/pcm;rate=24000";

        if (mimeType.includes("pcm")) {
          // Play PCM 16-bit audio via AudioContext
          const binaryString = atob(data.audioBase64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          const rateMatch = mimeType.match(/rate=(\d+)/);
          const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;

          const int16 = new Int16Array(bytes.buffer);
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
            sampleRate,
          });

          const buffer = audioCtx.createBuffer(1, int16.length, sampleRate);
          const channelData = buffer.getChannelData(0);
          for (let i = 0; i < int16.length; i++) {
            channelData[i] = int16[i] / 32768.0;
          }

          const source = audioCtx.createBufferSource();
          source.buffer = buffer;
          source.connect(audioCtx.destination);

          source.onended = () => {
            setIsPlayingAudio(false);
            audioCtx.close();
          };

          source.start(0);
          return;
        } else {
          // Standard MP3 / WAV audio data
          const audio = new Audio(`data:${mimeType};base64,${data.audioBase64}`);
          audio.onended = () => setIsPlayingAudio(false);
          audio.onerror = () => setIsPlayingAudio(false);
          await audio.play();
          return;
        }
      }
    } catch (err) {
      console.warn("Backend TTS playback error, falling back to browser SpeechSynthesis:", err);
    }

    // 2. Fallback to Web Speech API if backend unavailable
    try {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToPlay);
        utterance.lang = "fr-FR";
        utterance.rate = 0.85;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setIsPlayingAudio(false);
      }
    } catch (e) {
      console.error(e);
      setIsPlayingAudio(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-3 px-2 sm:px-0 space-y-4">
      {/* Translation Panels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 items-stretch">
        {/* Source Text Box (Left / Top) */}
        <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between shadow-xl focus-within:border-emerald-500/80 transition-colors min-h-[220px]">
          <div>
            {/* Header label */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {sourceLang === "fr" ? "Français" : "Créole Guadeloupéen"}
              </span>
              {sourceText && (
                <button
                  onClick={onClear}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Effacer le texte"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Input Textarea */}
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder={
                sourceLang === "fr"
                  ? "Saisissez votre texte en français (ex: Je suis en train de travailler à la maison...)"
                  : "Saisissez votre texte en créole (ex: Mwen ka travay a kaz-la...)"
              }
              className="w-full bg-transparent text-white placeholder-slate-500 text-base sm:text-lg resize-none focus:outline-none min-h-[120px] leading-relaxed"
              rows={4}
            />
          </div>

          {/* Bottom Bar Controls for Source Box */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              {/* Mic Input */}
              <button
                onClick={toggleListening}
                className={`p-2 rounded-xl transition-all ${
                  isListening
                    ? "bg-rose-500 text-white animate-pulse"
                    : "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                }`}
                title="Saisie vocale (microphone)"
              >
                {isListening ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>

              {/* Audio Listen for Source */}
              {sourceText.trim() && (
                <button
                  onClick={() => playAudio(sourceText, sourceLang)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                  title="Écouter la prononciation"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span>{sourceText.length} caractères</span>
              <button
                onClick={onTranslate}
                disabled={!sourceText.trim() || isLoading}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Traduction...</span>
                  </>
                ) : (
                  <>
                    <span>Traduire</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Target Text Box (Right / Bottom) */}
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-xl min-h-[220px] relative overflow-hidden">
          <div>
            {/* Header label */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>
                  {targetLang === "gcr" ? "Créole Guadeloupéen" : "Français"}
                </span>
                {targetLang === "gcr" && (
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-emerald-500/30">
                    GEREC
                  </span>
                )}
              </span>

              {translatedText && onToggleFavorite && (
                <button
                  onClick={onToggleFavorite}
                  className="p-1.5 rounded-lg text-amber-400 hover:bg-amber-400/10 transition-colors"
                  title="Enregistrer dans les favoris"
                >
                  <Star
                    className={`w-4 h-4 ${
                      isFavorite ? "fill-amber-400" : ""
                    }`}
                  />
                </button>
              )}
            </div>

            {/* Translation Output */}
            {isLoading ? (
              <div className="min-h-[120px] flex items-center justify-center text-slate-400 space-x-2">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                <span className="text-sm font-medium">
                  Traduction GEREC en cours...
                </span>
              </div>
            ) : translatedText ? (
              <p className="text-white text-base sm:text-lg min-h-[120px] leading-relaxed select-text font-medium">
                {translatedText}
              </p>
            ) : (
              <div className="min-h-[120px] flex items-center justify-center text-slate-500 text-sm italic">
                La traduction apparaîtra ici...
              </div>
            )}
          </div>

          {/* Bottom Bar Controls for Target Box */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              {/* Listen to Output Audio */}
              {translatedText && (
                <button
                  onClick={() => playAudio(translatedText, targetLang)}
                  disabled={isPlayingAudio}
                  className={`p-2 rounded-xl text-slate-200 transition-all flex items-center gap-1.5 ${
                    isPlayingAudio
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse"
                      : "bg-slate-800 hover:text-white hover:bg-slate-700"
                  }`}
                  title={
                    targetLang === "gcr"
                      ? "Écouter avec l'accent authentique du Créole Guadeloupéen"
                      : "Écouter la prononciation"
                  }
                >
                  <Volume2
                    className={`w-4 h-4 ${
                      isPlayingAudio ? "text-emerald-400 animate-spin" : "text-emerald-400"
                    }`}
                  />
                  <span className="text-xs font-semibold">
                    {isPlayingAudio
                      ? "Lecture..."
                      : targetLang === "gcr"
                      ? "Voix Créole (Guadeloupe)"
                      : "Écouter"}
                  </span>
                </button>
              )}

              {/* Toggle Grammar Analysis button */}
              {translationResult && (
                <button
                  onClick={() => setShowAnalysis(!showAnalysis)}
                  className={`p-2 rounded-xl transition-colors flex items-center gap-1.5 ${
                    showAnalysis
                      ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                      : "bg-slate-800 text-slate-300 hover:text-white"
                  }`}
                  title="Afficher/Masquer l'analyse grammaticale"
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="text-xs hidden sm:inline">Règles GEREC</span>
                </button>
              )}
            </div>

            {/* One-click Copy Button */}
            <button
              onClick={() => onCopy(translatedText)}
              disabled={!translatedText}
              className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                isCopied
                  ? "bg-emerald-500 text-slate-950 font-bold"
                  : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
              }`}
              title="Copier le texte traduit en un clic"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-emerald-400" />
                  <span>Copier</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Grammar & Orthography Analysis Section */}
      {showAnalysis && translationResult && (
        <GrammarBreakdown result={translationResult} />
      )}
    </div>
  );
};
