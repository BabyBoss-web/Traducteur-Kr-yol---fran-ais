import React, { useState, useEffect } from "react";
import { X, Search, BookOpen, Volume2, Sparkles, Filter } from "lucide-react";
import { LEXICON_ENTRIES, LexiconEntry } from "../data/lexiconData";
import { speakWithWebSpeech } from "../utils/speech";
import { RegisterPopover } from "./RegisterPopover";

interface LexiconModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWord?: (word: string) => void;
  theme?: "dark" | "light";
}

export const LexiconModal: React.FC<LexiconModalProps> = ({
  isOpen,
  onClose,
  onSelectWord,
  theme = "dark",
}) => {
  const isLight = theme === "light";
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredEntries = LEXICON_ENTRIES.filter((entry) => {
    const matchesSearch =
      entry.wordGcr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.wordFr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.definition.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || entry.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lexicon-modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden border transition-all ${
          isLight
            ? "bg-white border-amber-200 text-slate-800"
            : "bg-slate-950 border-amber-500/30 text-white shadow-amber-950/20"
        }`}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 flex items-center justify-between border-b ${
            isLight
              ? "bg-amber-50/80 border-amber-200/80"
              : "bg-slate-900 border-amber-500/20"
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-500 rounded-2xl border border-amber-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 id="lexicon-modal-title" className="text-lg font-bold flex items-center gap-2">
                Dictionnaire & Lexique GEREC
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  GEREC 971
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mots-clés, vocabulaire usuel et orthographe créole officielle
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer la fenêtre du dictionnaire"
            className={`p-2 rounded-xl transition-colors ${
              isLight
                ? "hover:bg-slate-200 text-slate-600"
                : "hover:bg-slate-800 text-slate-400"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/80 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un mot en Français ou en Créole (ex: Kaz, Manger, Ti-moun)..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm border focus:outline-none transition-all ${
                isLight
                  ? "bg-slate-100/80 border-slate-200 text-slate-800 focus:border-amber-500"
                  : "bg-slate-900 border-slate-800 text-slate-100 focus:border-amber-500"
              }`}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 text-[11px] font-semibold mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Catégorie:
            </span>
            {[
              { id: "all", label: "Tous" },
              { id: "nom", label: "Noms" },
              { id: "verbe", label: "Verbes" },
              { id: "expression", label: "Expressions" },
              { id: "adverbe", label: "Adverbes" },
              { id: "adjectif", label: "Adjectifs" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-xl transition-all font-medium whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                    : isLight
                    ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredEntries.length > 0 ? (
            filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isLight
                    ? "bg-white hover:bg-amber-50/50 border-slate-200"
                    : "bg-slate-900/90 hover:bg-slate-900 border-slate-800"
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-bold text-amber-500 font-serif">
                      {entry.wordGcr}
                    </span>
                    <RegisterPopover
                      register={entry.register || "Courant"}
                      explanation={entry.registerExplanation}
                      word={entry.wordGcr}
                      isLight={isLight}
                    />
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {entry.wordFr}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        entry.category === "verbe"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : entry.category === "expression"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}
                    >
                      {entry.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {entry.definition}
                  </p>

                  <div className="text-xs bg-slate-100 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/80 space-y-1">
                    <p className="text-amber-600 dark:text-amber-400 font-medium">
                      <span className="text-slate-400 mr-1">Ex:</span> {entry.exampleGcr}
                    </p>
                    <p className="text-slate-500 italic text-[11px]">
                      {entry.exampleFr}
                    </p>
                  </div>

                  {entry.gerecNote && (
                    <p className="text-[11px] text-amber-600/90 dark:text-amber-400/90 flex items-center gap-1 font-medium pt-0.5">
                      <Sparkles className="w-3 h-3 shrink-0" />
                      Règle GEREC: {entry.gerecNote}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() =>
                      speakWithWebSpeech({ text: entry.wordGcr, lang: "gcr" })
                    }
                    className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 transition-colors"
                    title="Écouter la prononciation"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  {onSelectWord && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectWord(entry.wordGcr);
                        onClose();
                      }}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm"
                    >
                      Utiliser
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 space-y-2 text-slate-400">
              <BookOpen className="w-8 h-8 mx-auto opacity-50 text-amber-500" />
              <p className="text-sm">Aucun mot trouvé dans le lexique pour "{searchTerm}"</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-100 dark:bg-slate-900 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
          Source lexicale GEREC Gwadloup • Lang, fierte é patrimwan an nou
        </div>
      </div>
    </div>
  );
};
