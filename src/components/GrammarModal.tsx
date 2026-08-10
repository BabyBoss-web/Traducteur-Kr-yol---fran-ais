import React, { useEffect } from "react";
import { X, BookOpen, CheckCircle2 } from "lucide-react";
import { GRAMMAR_RULES } from "../data/grammarRules";

interface GrammarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GrammarModal: React.FC<GrammarModalProps> = ({
  isOpen,
  onClose,
}) => {
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

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="grammar-modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-500/10 rounded-xl text-teal-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 id="grammar-modal-title" className="text-lg font-bold text-white">
                Règles grammaticales GEREC
              </h2>
              <p className="text-xs text-slate-400">
                Guide du Créole Guadeloupéen
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer le guide de grammaire"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {GRAMMAR_RULES.map((rule, idx) => (
            <div
              key={idx}
              className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-3"
            >
              <h3 className="text-sm font-bold text-teal-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>{rule.title}</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {rule.description}
              </p>

              <div className="space-y-2 pt-1">
                {rule.examples.map((ex, exIdx) => (
                  <div
                    key={exIdx}
                    className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs"
                  >
                    <div>
                      <span className="text-slate-400 font-medium">
                        {ex.fr} :
                      </span>{" "}
                      <span className="text-emerald-400 font-bold ml-1">
                        {ex.gcr}
                      </span>
                    </div>
                    <span className="text-slate-500 italic text-[11px]">
                      {ex.note}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
