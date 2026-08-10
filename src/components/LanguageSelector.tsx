import React from "react";
import { ArrowLeftRight } from "lucide-react";
import { Language } from "../types";

interface LanguageSelectorProps {
  sourceLang: Language;
  targetLang: Language;
  onSwapLanguages: () => void;
  onSelectSource: (lang: Language) => void;
  onSelectTarget: (lang: Language) => void;
  theme?: "dark" | "light";
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  sourceLang,
  targetLang,
  onSwapLanguages,
  onSelectSource,
  onSelectTarget,
  theme = "dark",
}) => {
  const isLight = theme === "light";

  return (
    <div
      role="region"
      aria-label="Sélection de la direction de traduction"
      className={`rounded-2xl p-1 flex items-center justify-between transition-all max-w-3xl mx-auto my-3 border ${
        isLight
          ? "bg-slate-200/60 border-slate-200 shadow-sm"
          : "bg-slate-900/80 border-slate-800 shadow-lg"
      }`}
    >
      {/* Source Language selector */}
      <div className="flex-1">
        <button
          onClick={() => {
            if (sourceLang !== "fr") {
              onSelectSource("fr");
              onSelectTarget("gcr");
            }
          }}
          aria-label="Traduction du Français vers le Créole Guadeloupéen"
          aria-pressed={sourceLang === "fr"}
          className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            sourceLang === "fr"
              ? isLight
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                : "bg-slate-800 text-amber-300 border border-slate-700 shadow-md"
              : isLight
                ? "text-slate-600 hover:text-slate-900"
                : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span>Français</span>
        </button>
      </div>

      {/* Swap Languages Button */}
      <div className="px-1.5">
        <button
          onClick={onSwapLanguages}
          className={`p-2.5 rounded-xl active:scale-95 transition-all focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center ${
            isLight
              ? "bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-sm"
              : "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30"
          }`}
          title="Échanger les langues (Français ↔ Kréyol Gwadloup)"
          aria-label="Inverser la langue source et la langue cible"
        >
          <ArrowLeftRight className="w-4 h-4" />
        </button>
      </div>

      {/* Target Language selector */}
      <div className="flex-1">
        <button
          onClick={() => {
            if (targetLang !== "gcr") {
              onSelectSource("gcr");
              onSelectTarget("fr");
            }
          }}
          aria-label="Traduction du Créole Guadeloupéen vers le Français"
          aria-pressed={sourceLang === "gcr"}
          className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            targetLang === "gcr"
              ? isLight
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-md"
              : isLight
                ? "text-slate-600 hover:text-slate-900"
                : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span>Kréyol Gwadloup</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
            isLight ? "bg-amber-600 text-white" : "bg-amber-950/80 text-amber-300"
          }`}>
            971
          </span>
        </button>
      </div>
    </div>
  );
};
