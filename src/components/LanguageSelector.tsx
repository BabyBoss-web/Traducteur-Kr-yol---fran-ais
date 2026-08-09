import React from "react";
import { ArrowLeftRight } from "lucide-react";
import { Language } from "../types";

interface LanguageSelectorProps {
  sourceLang: Language;
  targetLang: Language;
  onSwapLanguages: () => void;
  onSelectSource: (lang: Language) => void;
  onSelectTarget: (lang: Language) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  sourceLang,
  targetLang,
  onSwapLanguages,
  onSelectSource,
  onSelectTarget,
}) => {
  const getLangName = (lang: Language) =>
    lang === "fr" ? "Français" : "Créole Guadeloupéen";

  return (
    <div className="bg-slate-800/80 backdrop-blur border border-slate-700/60 rounded-xl p-1.5 flex items-center justify-between shadow-sm max-w-4xl mx-auto my-4">
      {/* Source Language selector */}
      <div className="flex-1 flex items-center justify-center">
        <button
          onClick={() => {
            if (sourceLang !== "fr") {
              onSelectSource("fr");
              onSelectTarget("gcr");
            }
          }}
          className={`px-3 sm:px-5 py-2 rounded-lg text-sm font-semibold transition-all w-full text-center ${
            sourceLang === "fr"
              ? "bg-emerald-600 text-white shadow-md"
              : "text-slate-300 hover:text-white hover:bg-slate-700/50"
          }`}
        >
          Français
        </button>
      </div>

      {/* Swap Languages Button */}
      <div className="px-2">
        <button
          onClick={onSwapLanguages}
          className="p-2.5 rounded-full text-emerald-400 hover:text-emerald-300 hover:bg-slate-700/80 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          title="Échanger les langues (Français ↔ Créole Guadeloupéen)"
          aria-label="Échanger les langues"
        >
          <ArrowLeftRight className="w-5 h-5" />
        </button>
      </div>

      {/* Target Language selector */}
      <div className="flex-1 flex items-center justify-center">
        <button
          onClick={() => {
            if (targetLang !== "gcr") {
              onSelectSource("gcr");
              onSelectTarget("fr");
            }
          }}
          className={`px-3 sm:px-5 py-2 rounded-lg text-sm font-semibold transition-all w-full text-center ${
            targetLang === "gcr"
              ? "bg-emerald-600 text-white shadow-md"
              : "text-slate-300 hover:text-white hover:bg-slate-700/50"
          }`}
        >
          Créole Guadeloupéen
        </button>
      </div>
    </div>
  );
};
