import React, { useState, useEffect } from "react";
import { X, Send, Sparkles, CheckCircle2, MessageSquare } from "lucide-react";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceText?: string;
  translatedText?: string;
  theme?: "dark" | "light";
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  sourceText = "",
  translatedText = "",
  theme = "dark",
}) => {
  const isLight = theme === "light";
  const [suggestion, setSuggestion] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestion.trim()) return;

    // Simulate submission / local save
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setSuggestion("");
      setComment("");
      onClose();
    }, 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border transition-all ${
          isLight
            ? "bg-white border-amber-200 text-slate-800"
            : "bg-slate-950 border-amber-500/30 text-white"
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
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-500 rounded-xl border border-amber-500/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 id="feedback-modal-title" className="text-base font-bold flex items-center gap-2">
                Proposer une amélioration / Contribution
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full">
                  GEREC 971
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Proposer une traduction alternative ou une nuance locale
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer la boîte de contribution"
            className={`p-2 rounded-xl transition-colors ${
              isLight
                ? "hover:bg-slate-200 text-slate-600"
                : "hover:bg-slate-800 text-slate-400"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30 animate-bounce">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-emerald-400">
              Mèsi anpil ! (Merci beaucoup)
            </h3>
            <p className="text-xs text-slate-400">
              Votre proposition d'ajustement linguistique a été enregistrée pour enrichir le corpus créole.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            {sourceText && (
              <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Texte original:
                </span>
                <p className="text-slate-700 dark:text-slate-200 font-medium">
                  {sourceText}
                </p>
                {translatedText && (
                  <p className="text-amber-500 italic text-[11px] pt-1 border-t border-slate-200 dark:border-slate-800">
                    Traduction actuelle: {translatedText}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between">
                <span>Votre proposition de traduction créole :</span>
                <span className="text-amber-500 text-[10px]">GEREC 971</span>
              </label>
              <textarea
                required
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                placeholder="Écrivez la formulation créole exacte recommandée (ex: Mwen ka trové sa pli dous...)"
                rows={3}
                className={`w-full p-3 rounded-2xl border focus:outline-none transition-all resize-none text-sm ${
                  isLight
                    ? "bg-slate-50 border-slate-200 text-slate-800 focus:border-amber-500"
                    : "bg-slate-900 border-slate-800 text-slate-100 focus:border-amber-500"
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-600 dark:text-slate-400">
                Note ou explication culturelle (optionnel) :
              </label>
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ex: Utilisé spécifiquement en Grande-Terre / Basse-Terre..."
                className={`w-full p-2.5 rounded-xl border focus:outline-none transition-all ${
                  isLight
                    ? "bg-slate-50 border-slate-200 text-slate-800 focus:border-amber-500"
                    : "bg-slate-900 border-slate-800 text-slate-100 focus:border-amber-500"
                }`}
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-xl font-bold transition-all ${
                  isLight
                    ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                }`}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
              >
                <Send className="w-4 h-4" />
                Envoyer la suggestion
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
