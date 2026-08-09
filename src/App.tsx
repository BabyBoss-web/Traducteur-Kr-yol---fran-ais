import React, { useState, useEffect, useCallback } from "react";
import { Header } from "./components/Header";
import { LanguageSelector } from "./components/LanguageSelector";
import { TranslationArea } from "./components/TranslationArea";
import { PhrasebookModal } from "./components/PhrasebookModal";
import { GrammarModal } from "./components/GrammarModal";
import { HistoryModal } from "./components/HistoryModal";
import { Toast } from "./components/Toast";
import { Language, TranslationResult, TranslationHistoryItem } from "./types";
import { PHRASE_CATEGORIES } from "./data/phrases";
import { Sparkles, BookOpen, History, ArrowLeftRight, Check, Copy } from "lucide-react";

export default function App() {
  const [sourceLang, setSourceLang] = useState<Language>("fr");
  const [targetLang, setTargetLang] = useState<Language>("gcr");
  const [sourceText, setSourceText] = useState<string>("");
  const [translatedText, setTranslatedText] = useState<string>("");
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isPhrasebookOpen, setIsPhrasebookOpen] = useState<boolean>(false);
  const [isGrammarOpen, setIsGrammarOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // History state with LocalStorage
  const [history, setHistory] = useState<TranslationHistoryItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("kreyol_translation_history");
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem("kreyol_translation_history", JSON.stringify(history));
    } catch (e) {
      console.error(e);
    }
  }, [history]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Check offline dictionary for quick matches
  const checkOfflineDictionary = (text: string, src: Language): TranslationResult | null => {
    const cleanText = text.trim().toLowerCase();
    for (const cat of PHRASE_CATEGORIES) {
      for (const phrase of cat.phrases) {
        if (src === "fr" && phrase.fr.toLowerCase() === cleanText) {
          return {
            translation: phrase.gcr,
            grammaticalNotes: phrase.context || "Expression courante du créole guadeloupéen",
            wordBreakdown: [{ source: phrase.fr, target: phrase.gcr, explanation: "Expression idiomatique" }],
          };
        } else if (src === "gcr" && phrase.gcr.toLowerCase() === cleanText) {
          return {
            translation: phrase.fr,
            grammaticalNotes: phrase.context || "Traduction française directe",
            wordBreakdown: [{ source: phrase.gcr, target: phrase.fr, explanation: "Expression créole" }],
          };
        }
      }
    }
    return null;
  };

  // Perform AI Translation via Backend API
  const handleTranslate = useCallback(async () => {
    if (!sourceText.trim()) return;

    // First check offline dictionary for instant match
    const offlineMatch = checkOfflineDictionary(sourceText, sourceLang);
    if (offlineMatch) {
      setTranslatedText(offlineMatch.translation);
      setTranslationResult(offlineMatch);
      addToHistory(sourceText, offlineMatch.translation, sourceLang, targetLang, offlineMatch);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: sourceText,
          sourceLang,
          targetLang,
        }),
      });

      const resData = await response.json();

      if (resData.success && resData.data) {
        const result: TranslationResult = resData.data;
        setTranslatedText(result.translation);
        setTranslationResult(result);

        addToHistory(sourceText, result.translation, sourceLang, targetLang, result);
      } else {
        throw new Error(resData.error || "Erreur de traduction");
      }
    } catch (error: any) {
      console.error("Translation error:", error);
      showToast(error.message || "Erreur lors de la traduction.");
    } finally {
      setIsLoading(false);
    }
  }, [sourceText, sourceLang, targetLang]);

  // Add translation to history
  const addToHistory = (
    srcText: string,
    tgtText: string,
    sLang: Language,
    tLang: Language,
    resultObj: TranslationResult
  ) => {
    setHistory((prev) => {
      // Remove duplicate if exists
      const filtered = prev.filter(
        (item) => item.sourceText.toLowerCase() !== srcText.toLowerCase()
      );
      const newItem: TranslationHistoryItem = {
        id: Date.now().toString(),
        sourceText: srcText,
        translatedText: tgtText,
        sourceLang: sLang,
        targetLang: tLang,
        timestamp: Date.now(),
        isFavorite: false,
        grammaticalNotes: resultObj.grammaticalNotes,
        wordBreakdown: resultObj.wordBreakdown,
      };
      return [newItem, ...filtered].slice(0, 30); // keep last 30
    });
  };

  // Swap Languages
  const handleSwapLanguages = () => {
    const newSource = targetLang;
    const newTarget = sourceLang;
    setSourceLang(newSource);
    setTargetLang(newTarget);

    // Swap texts
    if (translatedText) {
      setSourceText(translatedText);
      setTranslatedText(sourceText);
    }
  };

  // Clear text
  const handleClear = () => {
    setSourceText("");
    setTranslatedText("");
    setTranslationResult(null);
  };

  // Copy translated text
  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    showToast("Texte traduit copié dans le presse-papier !");
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Toggle Favorite
  const handleToggleFavorite = (id?: string) => {
    if (!id && !translatedText) return;

    if (id) {
      setHistory((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
        )
      );
    } else if (history.length > 0) {
      const firstId = history[0].id;
      setHistory((prev) =>
        prev.map((item) =>
          item.id === firstId ? { ...item, isFavorite: !item.isFavorite } : item
        )
      );
      showToast("Traduction enregistrée dans les favoris !");
    }
  };

  // Quick select phrase from phrasebook
  const handleSelectPhrase = (phraseText: string, lang: Language) => {
    setSourceLang(lang);
    setTargetLang(lang === "fr" ? "gcr" : "fr");
    setSourceText(phraseText);
  };

  // Handle history item select
  const handleSelectHistoryItem = (item: TranslationHistoryItem) => {
    setSourceLang(item.sourceLang);
    setTargetLang(item.targetLang);
    setSourceText(item.sourceText);
    setTranslatedText(item.translatedText);
    if (item.grammaticalNotes || item.wordBreakdown) {
      setTranslationResult({
        translation: item.translatedText,
        grammaticalNotes: item.grammaticalNotes || "",
        wordBreakdown: item.wordBreakdown || [],
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Navigation Header */}
      <Header
        onOpenPhrasebook={() => setIsPhrasebookOpen(true)}
        onOpenGrammar={() => setIsGrammarOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-6 flex flex-col justify-start space-y-4">
        {/* Language selector bar */}
        <LanguageSelector
          sourceLang={sourceLang}
          targetLang={targetLang}
          onSwapLanguages={handleSwapLanguages}
          onSelectSource={(lang) => {
            setSourceLang(lang);
            setTargetLang(lang === "fr" ? "gcr" : "fr");
          }}
          onSelectTarget={(lang) => {
            setTargetLang(lang);
            setSourceLang(lang === "fr" ? "gcr" : "fr");
          }}
        />

        {/* Translation Box Area */}
        <TranslationArea
          sourceText={sourceText}
          setSourceText={setSourceText}
          translatedText={translatedText}
          translationResult={translationResult}
          sourceLang={sourceLang}
          targetLang={targetLang}
          isLoading={isLoading}
          onTranslate={handleTranslate}
          onClear={handleClear}
          onCopy={handleCopy}
          isCopied={isCopied}
          onToggleFavorite={() => handleToggleFavorite()}
          isFavorite={history.length > 0 && history[0]?.isFavorite}
        />

        {/* Quick Suggestion Chips / Instant Phrases */}
        {!sourceText && (
          <div className="max-w-4xl mx-auto w-full pt-4">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Expressions fréquentes à essayer</span>
              </span>
              <button
                onClick={() => setIsPhrasebookOpen(true)}
                className="text-xs text-emerald-400 hover:underline font-semibold"
              >
                Voir tout le guide →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {[
                { fr: "Bonjour !", gcr: "Bonjou !" },
                { fr: "Comment vas-tu ?", gcr: "Ki jan ou yé ?" },
                { fr: "Je suis en train de travailler", gcr: "Mwen ka travay" },
                { fr: "J'ai fini mon travail", gcr: "Mwen travay" },
                { fr: "J'étais en train de lire", gcr: "Mwen té ka li" },
                { fr: "Je vais venir demain", gcr: "Mwen ké vini demen" },
                { fr: "Où est ma maison ?", gcr: "Koté kaz an mwen yé ?" },
                { fr: "Pas de problème !", gcr: "Pani pwoblèm !" },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSourceLang("fr");
                    setTargetLang("gcr");
                    setSourceText(item.fr);
                  }}
                  className="bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-2.5 text-left transition-all group shadow-sm"
                >
                  <p className="text-xs font-medium text-slate-300 group-hover:text-white">
                    {item.fr}
                  </p>
                  <p className="text-xs font-bold text-emerald-400 mt-1">
                    {item.gcr}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 bg-slate-950 text-center text-xs text-slate-500">
        <p className="flex items-center justify-center gap-1">
          <span>Traducteur Kréyol Gwadloupéyen</span> •
          <span>Orthographe GEREC officielle</span> •
          <span>Marqueurs ka, té ka, ké</span>
        </p>
      </footer>

      {/* Modals & Drawers */}
      <PhrasebookModal
        isOpen={isPhrasebookOpen}
        onClose={() => setIsPhrasebookOpen(false)}
        onSelectPhrase={handleSelectPhrase}
      />

      <GrammarModal
        isOpen={isGrammarOpen}
        onClose={() => setIsGrammarOpen(false)}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistoryItem={handleSelectHistoryItem}
        onToggleFavorite={handleToggleFavorite}
        onClearHistory={() => setHistory([])}
        onCopy={handleCopy}
      />

      {/* Toast Notification */}
      <Toast message={toastMessage} />
    </div>
  );
}
