import React from "react";
import { X, WifiOff, Sparkles, BookOpen, Clock, CheckCircle2 } from "lucide-react";

interface OfflineInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPhrasebook: () => void;
}

export const OfflineInfoModal: React.FC<OfflineInfoModalProps> = ({
  isOpen,
  onClose,
  onOpenPhrasebook,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Mode Hors-Ligne
              </h2>
              <p className="text-xs text-emerald-400 font-medium">
                Dictionnaire & Expressions disponibles sans connexion
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-slate-300 text-sm">
          <p className="text-slate-200 font-medium leading-relaxed">
            L'application intègre des fonctionnalités autonomes utilisables sans aucune connexion Internet :
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-white text-xs sm:text-sm">
                  1. Dictionnaire d'expressions courantes
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Accédez au guide complet classé par catégories (salutations, sentiments, proverbes, questions, repas...).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-white text-xs sm:text-sm">
                  2. Traduction instantanée locale
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Saisissez des expressions du quotidien : si elles figurent dans la base locale, la traduction s'affiche immédiatement même sans réseau.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl">
              <Clock className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-white text-xs sm:text-sm">
                  3. Historique & Favoris enregistrés
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Toutes vos traductions passées sont sauvegardées localement dans votre navigateur et restent consultables sans réseau.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-end">
            <button
              onClick={() => {
                onClose();
                onOpenPhrasebook();
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Ouvrir le Guide d'expressions</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs sm:text-sm rounded-xl transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
