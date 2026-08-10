import React, { useState, useRef, useEffect } from "react";
import { BookOpen, History, Sparkles, WifiOff, Download, Sun, Moon, Menu, X, ChevronRight } from "lucide-react";
import { GuadeloupeLogo } from "./GuadeloupeLogo";
import { MadrasRibbon } from "./MadrasRibbon";

interface HeaderProps {
  onOpenPhrasebook: () => void;
  onOpenGrammar: () => void;
  onOpenHistory: () => void;
  onOpenOfflineInfo: () => void;
  onOpenInstallApp: () => void;
  onOpenLexicon?: () => void;
  onOpenFeedback?: () => void;
  historyCount: number;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPhrasebook,
  onOpenGrammar,
  onOpenHistory,
  onOpenOfflineInfo,
  onOpenInstallApp,
  onOpenLexicon,
  onOpenFeedback,
  historyCount,
  theme,
  onToggleTheme,
}) => {
  const isLight = theme === "light";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* Skip to main content for screen reader accessibility */}
      <a
        href="#main-translation-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-amber-500 focus:text-slate-950 focus:font-bold focus:rounded-xl focus:shadow-lg"
      >
        Aller au contenu principal de traduction
      </a>

      <header
        role="banner"
        className={`sticky top-0 z-30 transition-colors backdrop-blur-md ${
          isLight 
            ? "bg-white/95 text-slate-800 border-b border-amber-200/80 shadow-sm" 
            : "bg-slate-900/95 text-white border-b border-amber-500/20 shadow-xl"
        }`}
      >
        {/* Traditional Madras Ribbon Line */}
        <MadrasRibbon height="h-1" />

        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-2">
          {/* Brand Logo & Name */}
          <GuadeloupeLogo size="md" theme={theme} />

          {/* Clean Header Controls */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* Direct Access: Guide d'expressions & Proverbes */}
            <button
              onClick={onOpenPhrasebook}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold rounded-xl transition-all border ${
                isLight
                  ? "bg-amber-100/80 hover:bg-amber-200 text-amber-900 border-amber-300"
                  : "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/30"
              }`}
              title="Guide d'expressions & Proverbes"
              aria-label="Ouvrir le guide d'expressions et proverbes"
            >
              <Sparkles className={`w-4 h-4 ${isLight ? "text-amber-700" : "text-amber-400"}`} />
              <span className="hidden sm:inline">Expressions & Proverbes</span>
              <span className="sm:hidden">Guide</span>
            </button>

            {/* Theme Switcher Button */}
            <button
              onClick={onToggleTheme}
              className={`p-2 text-xs font-semibold rounded-xl transition-all border ${
                isLight
                  ? "bg-slate-100 hover:bg-slate-200 text-amber-800 border-slate-200"
                  : "bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700"
              }`}
              title={isLight ? "Basculer en Mode Sombre" : "Basculer en Mode Clair"}
              aria-label={isLight ? "Activer le mode sombre" : "Activer le mode clair"}
            >
              {isLight ? (
                <Moon className="w-4 h-4 text-slate-700" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* Compact Menu / Options Dropdown Trigger */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-expanded={isMenuOpen}
                aria-haspopup="true"
                aria-label="Menu principal et outils d'apprentissage"
                className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition-all border ${
                  isMenuOpen
                    ? "bg-emerald-600 text-white border-emerald-700"
                    : isLight
                      ? "bg-slate-900 text-white hover:bg-slate-800 border-slate-800"
                      : "bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 border-slate-700"
                }`}
                title="Plus de fonctionnalités & Outils"
              >
              {isMenuOpen ? (
                <X className="w-4 h-4 text-white" />
              ) : (
                <Menu className="w-4 h-4 text-amber-400" />
              )}
              <span className="hidden sm:inline">Menu</span>
              {historyCount > 0 && !isMenuOpen && (
                <span className="bg-amber-500 text-slate-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {historyCount > 9 ? "9+" : historyCount}
                </span>
              )}
            </button>

            {/* Dropdown Menu Popup */}
            {isMenuOpen && (
              <div className={`absolute right-0 mt-2 w-72 rounded-2xl shadow-2xl border p-2 z-50 transition-all ${
                isLight
                  ? "bg-white border-amber-200 text-slate-800 shadow-slate-200"
                  : "bg-slate-900 border-amber-500/30 text-white shadow-black"
              }`}>
                <div className="px-3 py-2 border-b border-amber-500/20 mb-1 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                    Outils & Guide Kréyol
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">GEREC 971</span>
                </div>

                <div className="space-y-1">
                  {/* Item 0: Lexique GEREC */}
                  {onOpenLexicon && (
                    <button
                      onClick={() => {
                        onOpenLexicon();
                        setIsMenuOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-colors ${
                        isLight ? "hover:bg-amber-50" : "hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold">Dictionnaire & Lexique GEREC</p>
                          <p className="text-[11px] text-slate-400">Recherche de vocabulaire & orthographe</p>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  )}

                  {/* Item 1: Grammar */}
                  <button
                    onClick={() => {
                      onOpenGrammar();
                      setIsMenuOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-colors ${
                      isLight ? "hover:bg-amber-50" : "hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">Règles Grammaticales GEREC</p>
                        <p className="text-[11px] text-slate-400">Verbes ka, té ka, ké, etc.</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Item 2: History */}
                  <button
                    onClick={() => {
                      onOpenHistory();
                      setIsMenuOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-colors ${
                      isLight ? "hover:bg-amber-50" : "hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                        <History className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">Historique & Favoris</p>
                        <p className="text-[11px] text-slate-400">Vos traductions sauvegardées</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {historyCount > 0 && (
                        <span className="bg-amber-500 text-slate-950 font-bold text-[10px] px-1.5 py-0.5 rounded-full">
                          {historyCount}
                        </span>
                      )}
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </button>

                  {/* Item 3: Offline Mode Info */}
                  <button
                    onClick={() => {
                      onOpenOfflineInfo();
                      setIsMenuOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-colors ${
                      isLight ? "hover:bg-amber-50" : "hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-500">
                        <WifiOff className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">Mode Hors-Ligne</p>
                        <p className="text-[11px] text-slate-400">Dictionnaire local intégré</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Item 3.5: Maké Kréyòl (Contribution) */}
                  {onOpenFeedback && (
                    <button
                      onClick={() => {
                        onOpenFeedback();
                        setIsMenuOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-colors ${
                        isLight ? "hover:bg-amber-50" : "hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold">Proposer une amélioration</p>
                          <p className="text-[11px] text-slate-400">Suggérer une nuance ou un ajustement</p>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  )}

                  {/* Item 4: Download App */}
                  <button
                    onClick={() => {
                      onOpenInstallApp();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-colors bg-gradient-to-r from-amber-500/15 to-emerald-500/15 border border-amber-500/30 mt-1"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-amber-500 text-slate-950">
                        <Download className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-amber-500">Télécharger L'Application</p>
                        <p className="text-[11px] text-slate-400">Accès rapide PC & Smartphone</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-amber-500" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
    </>
  );
};


