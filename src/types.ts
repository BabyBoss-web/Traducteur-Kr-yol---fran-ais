export type Language = "fr" | "gcr";

export interface WordBreakdownItem {
  source: string;
  target: string;
  explanation?: string;
}

export interface TranslationResult {
  translation: string;
  grammaticalNotes: string;
  wordBreakdown: WordBreakdownItem[];
  alternativeExpressions?: string[];
  detectedCorrection?: string;
}

export interface TranslationHistoryItem {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: Language;
  targetLang: Language;
  timestamp: number;
  isFavorite: boolean;
  grammaticalNotes?: string;
  wordBreakdown?: WordBreakdownItem[];
  detectedCorrection?: string;
}

export interface PhraseCategory {
  id: string;
  name: string;
  icon: string;
  phrases: {
    fr: string;
    gcr: string;
    context?: string;
  }[];
}

export interface GrammarRule {
  title: string;
  description: string;
  examples: {
    fr: string;
    gcr: string;
    note: string;
  }[];
}
