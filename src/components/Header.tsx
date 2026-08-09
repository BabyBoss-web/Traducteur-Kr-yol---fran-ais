import React from "react";
import { BookOpen, History, Sparkles, HelpCircle } from "lucide-react";

interface HeaderProps {
  onOpenPhrasebook: () => void;
  onOpenGrammar: () => void;
  onOpenHistory: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPhrasebook,
  onOpenGrammar,
  onOpenHistory,
  historyCount,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 font-bold text-lg">
            Gw
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-100 flex items-center gap-1.5">
              <span>Traduction Kréyol</span>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 font-medium px-2 py-0.5 rounded-full border border-emerald-500/30">
                GEREC
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Français ↔ Créole Guadeloupéen
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={onOpenPhrasebook}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Expressions courantes & Guide d'expressions"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Expressions</span>
          </button>

          <button
            onClick={onOpenGrammar}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Règles grammaticales GEREC"
          >
            <BookOpen className="w-4 h-4 text-teal-400" />
            <span className="hidden sm:inline">Règles GEREC</span>
          </button>

          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Historique des traductions"
          >
            <History className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Historique</span>
            {historyCount > 0 && (
              <span className="ml-0.5 bg-emerald-500 text-slate-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {historyCount > 9 ? "9+" : historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
