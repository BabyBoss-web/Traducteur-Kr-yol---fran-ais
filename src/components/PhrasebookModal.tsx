import React, { useState, useEffect } from "react";
import { X, Search, Sparkles } from "lucide-react";
import { PHRASE_CATEGORIES } from "../data/phrases";
import { Language } from "../types";
import { MadrasRibbon } from "./MadrasRibbon";
import { RegisterPopover } from "./RegisterPopover";

interface PhrasebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPhrase: (text: string, sourceLang: Language) => void;
}

export const PhrasebookModal: React.FC<PhrasebookModalProps> = ({
  isOpen,
  onClose,
  onSelectPhrase,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>("salutations");
  const [searchQuery, setSearchQuery] = useState<string>("");

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

  const activeCatObj = PHRASE_CATEGORIES.find((c) => c.id === activeCategory);

  const filteredPhrases = PHRASE_CATEGORIES.flatMap((cat) => cat.phrases).filter(
    (p) =>
      p.fr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.gcr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.context && p.context.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="phrasebook-modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden relative"
      >
        <MadrasRibbon height="h-1.5" />
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/15 rounded-xl text-amber-400 border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 id="phrasebook-modal-title" className="text-lg font-bold text-white font-serif">
                Guide d'expressions & Pawòl Gwadloup
              </h2>
              <p className="text-xs text-amber-300/80">
                Phrases utiles & sagesse traditionnelle guadeloupéenne
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer le guide d'expressions"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-3 border-b border-slate-800/80 bg-slate-950/50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Rechercher une phrase ou mot (ex: bonjou, travailler...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
              >
                Effacer
              </button>
            )}
          </div>
        </div>

        {/* Categories Tabs (if not searching) */}
        {!searchQuery && (
          <div className="flex overflow-x-auto border-b border-slate-800/80 p-2 gap-1.5 no-scrollbar bg-slate-900/40">
            {PHRASE_CATEGORIES.map((cat) => {
              const isActive = cat.id === activeCategory;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Phrases List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {searchQuery ? (
            filteredPhrases.length > 0 ? (
              filteredPhrases.map((phrase, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-800/40 hover:bg-slate-800/90 border border-slate-700/50 rounded-xl transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  onClick={() => {
                    onSelectPhrase(phrase.fr, "fr");
                    onClose();
                  }}
                >
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {phrase.fr}
                    </p>
                    <p className="text-sm font-bold text-amber-400 mt-0.5">
                      {phrase.gcr}
                    </p>
                    {phrase.context && (
                      <p className="text-xs text-slate-400 italic mt-0.5">
                        {phrase.context}
                      </p>
                    )}
                  </div>
                  <span className="text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-1 rounded-md self-start sm:self-center">
                    Traduire →
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-400 py-8 text-sm">
                Aucune expression trouvée pour "{searchQuery}".
              </p>
            )
          ) : activeCatObj ? (
            activeCatObj.phrases.map((phrase, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 rounded-xl transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                onClick={() => {
                  onSelectPhrase(phrase.fr, "fr");
                  onClose();
                }}
              >
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    {phrase.fr}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-sm font-bold text-amber-400">
                      {phrase.gcr}
                    </p>
                    <RegisterPopover
                      register={phrase.context?.includes("Proverbe") || phrase.context?.includes("Encouragement") ? "Traditionnel" : "Courant"}
                      explanation={phrase.context}
                      word={phrase.gcr}
                      isLight={false}
                    />
                  </div>
                  {phrase.context && (
                    <p className="text-xs text-slate-400 italic mt-0.5">
                      {phrase.context}
                    </p>
                  )}
                </div>
                <button
                  className="text-xs bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 px-3 py-1.5 rounded-lg transition-colors font-medium self-end sm:self-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPhrase(phrase.fr, "fr");
                    onClose();
                  }}
                >
                  Utiliser
                </button>
              </div>
            ))
          ) : null}
        </div>
      </div>
    </div>
  );
};
