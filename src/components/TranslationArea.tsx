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
import { RegisterPopover } from "./RegisterPopover";

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
  onOpenLexicon?: () => void;
  onOpenFeedback?: () => void;
  theme?: "dark" | "light";
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
  onOpenLexicon,
  onOpenFeedback,
  theme = "dark",
}) => {
  const isLight = theme === "light";
  const [showAnalysis, setShowAnalysis] = useState<boolean>(true);
  const [showKeyboard, setShowKeyboard] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Helper to insert character at cursor in textarea
  const insertChar = (char: string) => {
    if (!textareaRef.current) {
      setSourceText(sourceText + char);
      return;
    }
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText =
      sourceText.substring(0, start) + char + sourceText.substring(end);
    setSourceText(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + char.length, start + char.length);
    }, 10);
  };

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
    <main id="main-translation-content" className="max-w-4xl mx-auto my-3 px-2 sm:px-0 space-y-4">
      {/* Translation Panels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 items-stretch">
        {/* Source Text Box (Left / Top) */}
        <div className={`rounded-2xl p-4 flex flex-col justify-between transition-all min-h-[220px] shadow-sm ${
          isLight
            ? "bg-white border border-slate-200 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-200/50"
            : "bg-slate-900 border border-slate-800 focus-within:border-amber-500/80 shadow-xl"
        }`}>
          <div>
            {/* Header label & Tools */}
            <div className={`flex items-center justify-between pb-2 mb-2 border-b ${
              isLight ? "border-slate-100" : "border-slate-800"
            }`}>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  isLight ? "text-slate-700" : "text-slate-300"
                }`}>
                  {sourceLang === "fr" ? "Français" : "Créole Guadeloupéen"}
                </span>
                {sourceLang === "gcr" && (
                  <button
                    type="button"
                    onClick={() => setShowKeyboard(!showKeyboard)}
                    aria-expanded={showKeyboard}
                    aria-label="Afficher ou masquer la barre d'accents créoles"
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition-all border ${
                      showKeyboard
                        ? "bg-amber-500/20 text-amber-500 border-amber-500/30"
                        : isLight
                        ? "bg-slate-100 text-slate-600 border-slate-200"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                    title="Afficher/Masquer le clavier à caractères créoles"
                  >
                    Clavier créole
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {onOpenLexicon && (
                  <button
                    type="button"
                    onClick={onOpenLexicon}
                    aria-label="Ouvrir le dictionnaire et lexique GEREC"
                    className={`text-[11px] font-semibold px-2 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                      isLight
                        ? "text-slate-600 hover:bg-slate-100"
                        : "text-amber-400 hover:bg-amber-500/10"
                    }`}
                    title="Dictionnaire & Lexique GEREC"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Lexique</span>
                  </button>
                )}
                {sourceText && (
                  <button
                    onClick={onClear}
                    aria-label="Effacer le texte source"
                    className={`p-1.5 rounded-md transition-colors ${
                      isLight 
                        ? "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                    title="Effacer le texte"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Klavyé Kréyòl (Virtual Creole Accent Bar) - Only displayed when entering Creole */}
            {sourceLang === "gcr" && showKeyboard && (
              <div
                role="group"
                aria-label="Clavier d'accents créoles"
                className="mb-2 p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-1 overflow-x-auto text-xs scrollbar-thin"
              >
                <span className="text-[10px] font-bold text-amber-500 uppercase px-1 shrink-0">
                  Accents:
                </span>
                {["ò", "è", "à", "é", "ñ", "’", "«", "»", "ou", "an", "en", "on", "ka", "té", "ké"].map((keyChar) => (
                  <button
                    key={keyChar}
                    type="button"
                    onClick={() => insertChar(keyChar)}
                    aria-label={`Insérer la lettre ${keyChar}`}
                    className={`px-2 py-1 rounded-lg font-bold text-xs transition-all shrink-0 min-h-[32px] ${
                      isLight
                        ? "bg-white hover:bg-amber-100 text-amber-950 border border-amber-200 shadow-sm"
                        : "bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-slate-700"
                    }`}
                  >
                    {keyChar}
                  </button>
                ))}
              </div>
            )}

            {/* Input Textarea */}
            <textarea
              ref={textareaRef}
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              aria-label={
                sourceLang === "fr"
                  ? "Texte en français à traduire"
                  : "Texte en créole guadeloupéen à traduire"
              }
              placeholder={
                sourceLang === "fr"
                  ? "Saisissez votre texte en français (ex: Je suis en train de travailler à la maison...)"
                  : "Saisissez votre texte en créole (ex: Mwen ka travay a kaz-la...)"
              }
              className={`w-full bg-transparent text-base sm:text-lg resize-none focus:outline-none min-h-[120px] leading-relaxed ${
                isLight 
                  ? "text-slate-900 placeholder-slate-400"
                  : "text-white placeholder-slate-500"
              }`}
              rows={4}
            />
          </div>

          {/* Bottom Bar Controls for Source Box */}
          <div className={`flex items-center justify-between pt-3 border-t text-xs ${
            isLight ? "border-slate-100 text-slate-500" : "border-slate-800/80 text-slate-400"
          }`}>
            <div className="flex items-center space-x-2">
              {/* Mic Input */}
              <button
                onClick={toggleListening}
                aria-label={isListening ? "Arrêter la saisie vocale" : "Démarrer la saisie vocale par microphone"}
                aria-pressed={isListening}
                className={`p-2 rounded-xl transition-all ${
                  isListening
                    ? "bg-rose-500 text-white animate-pulse"
                    : isLight
                      ? "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
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
                  aria-label="Écouter la prononciation du texte source"
                  className={`p-2 rounded-xl transition-colors ${
                    isLight
                      ? "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                      : "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                  }`}
                  title="Écouter la prononciation"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <span className="hidden sm:inline text-[11px] font-medium text-slate-400">
                {sourceText.length} car.
              </span>
              {isLoading ? (
                <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                  <span>Traduction...</span>
                </div>
              ) : sourceText.trim() ? (
                <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl border ${
                  isLight
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                }`}>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>En direct</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-[11px] text-slate-400 italic">
                  <span>Traduction en temps réel</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Target Text Box (Right / Bottom) */}
        <div className={`rounded-2xl p-4 flex flex-col justify-between shadow-sm min-h-[220px] relative overflow-hidden transition-all ${
          isLight
            ? "bg-amber-50/50 border border-amber-200/80"
            : "bg-slate-900 border border-slate-800 shadow-xl"
        }`}>
          {/* Subtle Madras Accent top line for target result */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-500 opacity-80" />

          <div>
            {/* Header label */}
            <div className={`flex items-center justify-between pb-2 mb-2 border-b ${
              isLight ? "border-amber-200/60" : "border-slate-800"
            }`}>
              <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isLight ? "text-amber-900" : "text-amber-400"
              }`}>
                <span>
                  {targetLang === "gcr" ? "Kréyol Gwadloup" : "Français"}
                </span>
                {targetLang === "gcr" && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isLight 
                      ? "bg-amber-200/80 text-amber-900 border-amber-300"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  }`}>
                    GEREC • 971
                  </span>
                )}
              </span>

              {translatedText && onToggleFavorite && (
                <button
                  onClick={onToggleFavorite}
                  aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isLight 
                      ? "text-amber-700 hover:bg-amber-200/60"
                      : "text-amber-400 hover:bg-amber-400/10"
                  }`}
                  title="Enregistrer dans les favoris"
                >
                  <Star
                    className={`w-4 h-4 ${
                      isFavorite ? "fill-amber-500 text-amber-500" : ""
                    }`}
                  />
                </button>
              )}
            </div>

            {/* Translation Output with ARIA live region */}
            <div aria-live="polite" aria-atomic="true" className="min-h-[120px] flex items-center">
              {isLoading ? (
                <div className="w-full flex items-center justify-center text-slate-500 space-x-2">
                  <Loader2 className={`w-6 h-6 animate-spin ${isLight ? "text-amber-600" : "text-amber-400"}`} />
                  <span className={`text-sm font-medium ${isLight ? "text-amber-900" : "text-amber-200/90"}`}>
                    Traduction Kréyol Gwadloup en cours...
                  </span>
                </div>
              ) : translatedText ? (
                <div className="w-full space-y-2">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <p className={`text-base sm:text-lg leading-relaxed select-text font-bold font-serif flex-1 ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}>
                      {translatedText}
                    </p>
                    <RegisterPopover
                      register={translationResult?.expressionRegister || "Courant"}
                      explanation={translationResult?.registerExplanation}
                      word={translatedText}
                      isLight={isLight}
                    />
                  </div>
                </div>
              ) : (
                <div className={`w-full flex items-center justify-center text-sm italic ${
                  isLight ? "text-slate-400" : "text-slate-500"
                }`}>
                  La traduction en Kréyol apparaîtra ici...
                </div>
              )}
            </div>
          </div>

          {/* Bottom Bar Controls for Target Box */}
          <div className={`flex items-center justify-between pt-3 border-t text-xs ${
            isLight ? "border-amber-200/60 text-slate-600" : "border-slate-800/80 text-slate-400"
          }`}>
            <div className="flex items-center space-x-2">
              {/* Listen to Output Audio */}
              {translatedText && (
                <button
                  onClick={() => playAudio(translatedText, targetLang)}
                  disabled={isPlayingAudio}
                  className={`p-2 rounded-xl transition-all flex items-center gap-1.5 border ${
                    isPlayingAudio
                      ? "bg-amber-500/20 text-amber-900 border-amber-400 animate-pulse"
                      : isLight
                        ? "bg-white text-slate-800 hover:bg-amber-100/60 border-amber-300 shadow-sm"
                        : "bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 border-slate-700"
                  }`}
                  title={
                    targetLang === "gcr"
                      ? "Écouter avec l'accent authentique du Créole Guadeloupéen"
                      : "Écouter la prononciation"
                  }
                >
                  <Volume2
                    className={`w-4 h-4 ${
                      isPlayingAudio ? "text-amber-600 animate-spin" : isLight ? "text-amber-700" : "text-amber-400"
                    }`}
                  />
                  <span className="text-xs font-semibold">
                    {isPlayingAudio
                      ? "Lecture..."
                      : targetLang === "gcr"
                      ? "Voix Créole"
                      : "Écouter"}
                  </span>
                </button>
              )}

              {/* Toggle Grammar Analysis button */}
              {translationResult && (
                <button
                  onClick={() => setShowAnalysis(!showAnalysis)}
                  className={`p-2 rounded-xl transition-colors flex items-center gap-1.5 border ${
                    showAnalysis
                      ? isLight
                        ? "bg-amber-100 text-amber-950 border-amber-300"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      : isLight
                        ? "bg-white text-slate-700 hover:bg-slate-100 border-slate-200"
                        : "bg-slate-800 text-slate-300 hover:text-white border-slate-700"
                  }`}
                  title="Afficher/Masquer l'analyse grammaticale"
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="text-xs hidden sm:inline font-semibold">Analyse GEREC</span>
                </button>
              )}
            </div>

            {/* Actions: Feedback & Copy */}
            <div className="flex items-center gap-1.5">
              {translatedText && onOpenFeedback && (
                <button
                  onClick={onOpenFeedback}
                  className={`px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 border transition-all ${
                    isLight
                      ? "bg-white hover:bg-amber-100/60 text-slate-700 border-amber-200"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                  }`}
                  title="Suggérer une alternative de traduction ou une amélioration"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden sm:inline">Proposer une amélioration</span>
                </button>
              )}

              {/* One-click Copy Button */}
              <button
                onClick={() => onCopy(translatedText)}
                disabled={!translatedText}
                className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm ${
                  isCopied
                    ? "bg-emerald-600 text-white font-bold"
                    : isLight
                      ? "bg-slate-900 hover:bg-slate-800 text-white border border-slate-800"
                      : "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40"
                }`}
                title="Copier le texte traduit"
              >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copier</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>

      {/* Embedded Grammar & Orthography Analysis Section */}
      {showAnalysis && translationResult && (
        <GrammarBreakdown result={translationResult} />
      )}
    </main>
  );
};
