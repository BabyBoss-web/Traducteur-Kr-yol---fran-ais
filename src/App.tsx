import React, { useState, useEffect, useCallback } from "react";
import { Header } from "./components/Header";
import { LanguageSelector } from "./components/LanguageSelector";
import { TranslationArea } from "./components/TranslationArea";
import { PhrasebookModal } from "./components/PhrasebookModal";
import { GrammarModal } from "./components/GrammarModal";
import { HistoryModal } from "./components/HistoryModal";
import { OfflineInfoModal } from "./components/OfflineInfoModal";
import { InstallAppModal } from "./components/InstallAppModal";
import { LexiconModal } from "./components/LexiconModal";
import { FeedbackModal } from "./components/FeedbackModal";
import { Toast } from "./components/Toast";
import { Language, TranslationResult, TranslationHistoryItem } from "./types";
import { PHRASE_CATEGORIES } from "./data/phrases";
import { Sparkles, BookOpen, History, ArrowLeftRight, Check, Copy } from "lucide-react";

export default function App() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("kreyol_theme");
        return (saved as "dark" | "light") || "light";
      } catch (e) {
        return "light";
      }
    }
    return "light";
  });

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    try {
      localStorage.setItem("kreyol_theme", nextTheme);
    } catch (e) {
      console.error(e);
    }
  };

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
  const [isOfflineInfoOpen, setIsOfflineInfoOpen] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [isLexiconOpen, setIsLexiconOpen] = useState<boolean>(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);

  // PWA installation prompt state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  useEffect(() => {
    // Check if running as installed standalone PWA
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes("android-app://");
      setIsStandalone(!!isStandaloneMode);
    };
    checkStandalone();

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        showToast("Installation de l'application lancée !");
        setDeferredPrompt(null);
        setIsInstallModalOpen(false);
      }
    }
  };


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
    const normalize = (s: string) => s.trim().toLowerCase().replace(/[.,!?]+$/, "");
    const cleanText = normalize(text);

    for (const cat of PHRASE_CATEGORIES) {
      for (const phrase of cat.phrases) {
        if (src === "fr" && normalize(phrase.fr) === cleanText) {
          return {
            translation: phrase.gcr,
            grammaticalNotes: phrase.context || "Expression courante du créole guadeloupéen",
            wordBreakdown: [{ source: phrase.fr, target: phrase.gcr, explanation: "Expression idiomatique" }],
          };
        } else if (src === "gcr" && normalize(phrase.gcr) === cleanText) {
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
  const handleTranslate = useCallback(
    async (textParam?: string, srcLangParam?: Language, tgtLangParam?: Language) => {
      const textToTranslate = textParam !== undefined ? textParam : sourceText;
      const srcLang = srcLangParam || sourceLang;
      const tgtLang = tgtLangParam || targetLang;

      const trimmed = textToTranslate.trim();
      if (!trimmed) {
        setTranslatedText("");
        setTranslationResult(null);
        setIsLoading(false);
        return;
      }

      // First check offline dictionary for instant match
      const offlineMatch = checkOfflineDictionary(trimmed, srcLang);
      if (offlineMatch) {
        setTranslatedText(offlineMatch.translation);
        setTranslationResult(offlineMatch);
        addToHistory(trimmed, offlineMatch.translation, srcLang, tgtLang, offlineMatch);
        setIsLoading(false);
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
            text: trimmed,
            sourceLang: srcLang,
            targetLang: tgtLang,
          }),
        });

        const resData = await response.json();

        if (resData.success && resData.data) {
          const result: TranslationResult = resData.data;
          const finalTranslation = result.translation || trimmed;
          setTranslatedText(finalTranslation);
          setTranslationResult(result);

          addToHistory(trimmed, finalTranslation, srcLang, tgtLang, result);
        } else {
          // Graceful fallback if API responds with non-success
          const fallbackResult: TranslationResult = {
            translation: trimmed,
            grammaticalNotes: "Terme ou expression conservé en l'état.",
            wordBreakdown: [{ source: trimmed, target: trimmed, explanation: "Conservation du mot" }],
          };
          setTranslatedText(trimmed);
          setTranslationResult(fallbackResult);
        }
      } catch (error: any) {
        console.error("Translation error fallback:", error);
        // Fallback to displaying entered text as-is if network or server fails
        const fallbackResult: TranslationResult = {
          translation: trimmed,
          grammaticalNotes: "Terme ou expression conservé en l'état.",
          wordBreakdown: [{ source: trimmed, target: trimmed, explanation: "Conservation du mot" }],
        };
        setTranslatedText(trimmed);
        setTranslationResult(fallbackResult);
      } finally {
        setIsLoading(false);
      }
    },
    [sourceText, sourceLang, targetLang]
  );

  // Automatic real-time translation with debouncing
  useEffect(() => {
    const trimmed = sourceText.trim();
    if (!trimmed) {
      setTranslatedText("");
      setTranslationResult(null);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      handleTranslate(sourceText, sourceLang, targetLang);
    }, 500);

    return () => clearTimeout(timer);
  }, [sourceText, sourceLang, targetLang, handleTranslate]);

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
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      theme === "light"
        ? "bg-[#fcfbf9] text-slate-800 selection:bg-amber-400 selection:text-slate-950"
        : "bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950"
    }`}>
      {/* Navigation Header */}
      <Header
        onOpenPhrasebook={() => setIsPhrasebookOpen(true)}
        onOpenGrammar={() => setIsGrammarOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenOfflineInfo={() => setIsOfflineInfoOpen(true)}
        onOpenInstallApp={() => setIsInstallModalOpen(true)}
        onOpenLexicon={() => setIsLexiconOpen(true)}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
        historyCount={history.length}
        theme={theme}
        onToggleTheme={toggleTheme}
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
          theme={theme}
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
          onOpenLexicon={() => setIsLexiconOpen(true)}
          onOpenFeedback={() => setIsFeedbackOpen(true)}
          theme={theme}
        />

        {/* Quick Suggestion Chips / Instant Phrases */}
        {!sourceText && (
          <div className="max-w-4xl mx-auto w-full pt-1 space-y-3">
            {/* Traditional Proverb Banner - Compact & Harmonious */}
            <div className={`rounded-2xl p-3 sm:p-4 shadow-sm relative overflow-hidden transition-all border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ${
              theme === "light"
                ? "bg-amber-50/80 border-amber-200/80 text-slate-800"
                : "bg-slate-900/80 border-amber-500/20 text-slate-200"
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl font-serif text-xs font-bold shrink-0 ${
                  theme === "light" ? "bg-amber-200/80 text-amber-950" : "bg-amber-500/20 text-amber-300"
                }`}>
                  Proverbe
                </div>
                <div>
                  <p className={`text-xs sm:text-sm font-bold font-serif ${
                    theme === "light" ? "text-amber-950" : "text-amber-300"
                  }`}>
                    « Tjenbé rèd, pa molli ! »
                  </p>
                  <p className={`text-[11px] sm:text-xs ${
                    theme === "light" ? "text-slate-600" : "text-slate-400"
                  }`}>
                    « Tiens bon, ne faiblis pas ! » (Slogan de courage)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsPhrasebookOpen(true)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all border shrink-0 flex items-center gap-1 ${
                  theme === "light"
                    ? "bg-white hover:bg-amber-100/80 text-amber-900 border-amber-300 shadow-sm"
                    : "bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Guide d'expressions →</span>
              </button>
            </div>

            {/* Instant Phrases Horizontal Scroll / Compact Bar */}
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${
                  theme === "light" ? "text-slate-500" : "text-slate-400"
                }`}>
                  Suggestions rapides
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {[
                  { fr: "Bonjour !", gcr: "Bonjou !" },
                  { fr: "Comment vas-tu ?", gcr: "Ki jan ou yé ?" },
                  { fr: "Je suis en train de travailler", gcr: "Mwen ka travay" },
                  { fr: "J'ai fini mon travail", gcr: "Mwen travay" },
                  { fr: "Je vais venir demain", gcr: "Mwen ké vini demen" },
                  { fr: "Pas de problème !", gcr: "Pani pwoblèm !" },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSourceLang("fr");
                      setTargetLang("gcr");
                      setSourceText(item.fr);
                    }}
                    className={`whitespace-nowrap rounded-xl px-3 py-2 text-left transition-all border shrink-0 shadow-sm text-xs ${
                      theme === "light"
                        ? "bg-white hover:bg-amber-50 border-slate-200/90 text-slate-800"
                        : "bg-slate-900/90 hover:bg-slate-800 border-slate-800 text-slate-200"
                    }`}
                  >
                    <span className="font-medium text-slate-500 mr-1.5">{item.fr}</span>
                    <span className={`font-bold font-serif ${
                      theme === "light" ? "text-amber-900" : "text-amber-400"
                    }`}>
                      ({item.gcr})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`py-5 text-center text-xs space-y-1.5 border-t ${
        theme === "light"
          ? "bg-slate-100/60 border-slate-200/80 text-slate-600"
          : "bg-slate-950 border-slate-900 text-slate-500"
      }`}>
        <p className={`flex flex-wrap items-center justify-center gap-2 ${
          theme === "light" ? "text-slate-700" : "text-slate-400"
        }`}>
          <span className={`font-bold ${theme === "light" ? "text-amber-900" : "text-amber-400"}`}>Peyi Gwadloup 971</span> •
          <span>Lang an nou, fierte an nou</span> •
          <span>Orthographe GEREC officielle</span>
        </p>
        <p className={`text-[11px] ${theme === "light" ? "text-slate-500" : "text-slate-600"}`}>
          Traduction linguistique spécialisée Français ↔ Kréyol Gwadloupéyen
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

      <OfflineInfoModal
        isOpen={isOfflineInfoOpen}
        onClose={() => setIsOfflineInfoOpen(false)}
        onOpenPhrasebook={() => setIsPhrasebookOpen(true)}
      />

      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        deferredPrompt={deferredPrompt}
        onInstallClick={handleInstallClick}
        isStandalone={isStandalone}
      />

      <LexiconModal
        isOpen={isLexiconOpen}
        onClose={() => setIsLexiconOpen(false)}
        onSelectWord={(word) => {
          setSourceText((prev) => (prev ? `${prev} ${word}` : word));
          showToast(`Mot "${word}" ajouté au texte`);
        }}
        theme={theme}
      />

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        sourceText={sourceText}
        translatedText={translatedText}
        theme={theme}
      />

      {/* Toast Notification */}
      <Toast message={toastMessage} />
    </div>
  );
}
