import React from "react";
import { BookOpen, Sparkles, CheckCircle2 } from "lucide-react";
import { TranslationResult } from "../types";

interface GrammarBreakdownProps {
  result: TranslationResult;
}

export const GrammarBreakdown: React.FC<GrammarBreakdownProps> = ({ result }) => {
  if (!result || (!result.grammaticalNotes && !result.wordBreakdown?.length && !result.detectedCorrection)) {
    return null;
  }

  return (
    <div className="mt-4 bg-slate-900/90 border border-teal-500/30 rounded-xl p-4 text-slate-200 text-sm shadow-lg space-y-3.5">
      {/* Auto correction notice */}
      {result.detectedCorrection && (
        <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-lg p-3 flex items-start gap-2.5 text-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-emerald-300">Intention déduite (Correction d'orthographe/frappe) :</span>{" "}
            <span className="italic font-medium text-white">"{result.detectedCorrection}"</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-2 text-teal-300 font-semibold border-b border-slate-800 pb-2">
        <BookOpen className="w-4 h-4 text-teal-400" />
        <span>Analyse grammaticale & Orthographe GEREC</span>
      </div>

      {/* Grammatical notes */}
      {result.grammaticalNotes && (
        <div className="bg-slate-800/60 rounded-lg p-3 text-slate-300 border border-slate-700/50 leading-relaxed">
          <p className="font-medium text-teal-200 text-xs uppercase tracking-wider mb-1">
            Règles & marqueurs appliqués :
          </p>
          <p className="text-sm">{result.grammaticalNotes}</p>
        </div>
      )}

      {/* Word breakdown */}
      {result.wordBreakdown && result.wordBreakdown.length > 0 && (
        <div>
          <p className="font-medium text-xs text-slate-400 uppercase tracking-wider mb-2">
            Découpage mot-à-mot :
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {result.wordBreakdown.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-800/40 border border-slate-700/40 rounded-lg p-2.5 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-300">{item.source}</span>
                  <span className="text-emerald-400 font-bold">→ {item.target}</span>
                </div>
                {item.explanation && (
                  <p className="text-xs text-slate-400 mt-1 italic">
                    {item.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alternatives */}
      {result.alternativeExpressions && result.alternativeExpressions.length > 0 && (
        <div className="pt-2 border-t border-slate-800">
          <p className="font-medium text-xs text-amber-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Variantes & tournures métaphoriques :</span>
          </p>
          <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 pl-1">
            {result.alternativeExpressions.map((alt, idx) => (
              <li key={idx} className="italic text-amber-200/90">
                "{alt}"
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
