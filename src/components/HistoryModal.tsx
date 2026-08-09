import React from "react";
import { X, History, Trash2, Star, Copy, ArrowRight } from "lucide-react";
import { TranslationHistoryItem, Language } from "../types";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: TranslationHistoryItem[];
  onSelectHistoryItem: (item: TranslationHistoryItem) => void;
  onToggleFavorite: (id: string) => void;
  onClearHistory: () => void;
  onCopy: (text: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistoryItem,
  onToggleFavorite,
  onClearHistory,
  onCopy,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Historique & Favoris
              </h2>
              <p className="text-xs text-slate-400">
                Vos traductions récentes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
                title="Effacer tout l'historique"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Effacer tout</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center text-slate-400 py-12 text-sm">
              <History className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p>Aucune traduction enregistrée pour le moment.</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 rounded-xl p-3.5 transition-all space-y-2 cursor-pointer"
                onClick={() => {
                  onSelectHistoryItem(item);
                  onClose();
                }}
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-emerald-400 uppercase tracking-wide">
                    {item.sourceLang === "fr" ? "Français" : "Créole"} →{" "}
                    {item.targetLang === "fr" ? "Français" : "Créole"}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(item.id);
                      }}
                      className="p-1 rounded text-amber-400 hover:bg-amber-400/10 transition-colors"
                      title="Ajouter aux favoris"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          item.isFavorite ? "fill-amber-400" : ""
                        }`}
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCopy(item.translatedText);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                      title="Copier le texte traduit"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-300">{item.sourceText}</p>
                  <p className="text-sm font-bold text-white mt-1">
                    {item.translatedText}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
