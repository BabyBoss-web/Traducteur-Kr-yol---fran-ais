import { GrammarRule } from "../types";

export const GRAMMAR_RULES: GrammarRule[] = [
  {
    title: "1. Orthographe officielle GEREC",
    description: "Le créole guadeloupéen s'écrit selon le système phonétique GEREC. Les lettres 'c', 'q', 'x' n'existent pas. Chaque lettre ou digramme correspond à un son unique.",
    examples: [
      { fr: "La maison", gcr: "Kaz-la", note: "Utilisation du 'k' et du 'z' au lieu de 'c' et 's'" },
      { fr: "Qu'est-ce que c'est ?", gcr: "Sa sa yé ?", note: "Pas de 'q', remplacement par 's' et 'k'" },
      { fr: "La tête", gcr: "Tèt-la", note: "Accents graves sur 'è' et 'ò' pour ouvrir la voyelle" },
      { fr: "Saisir / Attraper", gcr: "Tjenbé", note: "Digramme 'tj' pour le son [tʃ]" },
      { fr: "Sauter de joie", gcr: "Djigidji", note: "Digramme 'dj' pour le son [dʒ]" },
    ],
  },
  {
    title: "2. Les marqueurs verbaux du créole guadeloupéen",
    description: "Contrairement au français, les verbes en créole sont invariables. Le temps et l'aspect sont indiqués par des particules appelées 'marqueurs verbaux' placés devant le verbe.",
    examples: [
      { fr: "Présent continu (en train de)", gcr: "ka + verbe", note: "Exemple: Mwen ka travay = Je suis en train de travailler" },
      { fr: "Passé accompli (terminé)", gcr: "verbe seul (sans marqueur)", note: "Exemple: Mwen travay = J'ai travaillé / J'ai fini de travailler" },
      { fr: "Passé continu (était en train de)", gcr: "té ka + verbe", note: "Exemple: Mwen té ka travay = J'étais en train de travailler" },
      { fr: "Passé accompli révolu", gcr: "té + verbe", note: "Exemple: Mwen té travay = J'avais travaillé" },
      { fr: "Futur / Intention", gcr: "ké ou kay + verbe", note: "Exemple: Mwen ké travay = Je vais travailler" },
      { fr: "Conditionnel", gcr: "té ké + verbe", note: "Exemple: Mwen té ké travay = Je travaillerais" },
    ],
  },
  {
    title: "3. Placement des articles définis et des possessifs",
    description: "En créole guadeloupéen, l'article défini et les adjectifs possessifs se placent APRÈS le nom, reliés avec un trait d'union pour l'article.",
    examples: [
      { fr: "La maison", gcr: "Kaz-la", note: "Article -la postposé" },
      { fr: "Le livre", gcr: "Liv-la", note: "Article -la postposé" },
      { fr: "Les maisons", gcr: "Kaz-yo", note: "Article pluriel -yo postposé" },
      { fr: "Mon ami", gcr: "Zanmi an mwen", note: "Possessif postposé 'an mwen'" },
      { fr: "Sa voiture", gcr: "Loto a'y", note: "Possessif postposé 'a'y'" },
      { fr: "Notre pays", gcr: "Péyi an nou", note: "Possessif postposé 'an nou'" },
    ],
  },
  {
    title: "4. Distinctions clés : Guadeloupe (971) vs Martinique (972)",
    description: "Le créole guadeloupéen et le créole martiniquais sont très proches mais possèdent des différences lexicales et grammaticales majeures qu'il convient de respecter :",
    examples: [
      { fr: "Chose / Objet", gcr: "Biten (Guadeloupe)", note: "En Martinique on dit 'Bagay'" },
      { fr: "Mon livre / Ma voiture", gcr: "Liv an mwen / Loto an mwen", note: "Préposition 'an' / 'a' obligatoire en Guadeloupe ('Liv mwen' en Martinique)" },
      { fr: "Vouloir", gcr: "Vlé", note: "En Martinique on utilise souvent 'Lé'" },
      { fr: "Un petit peu", gcr: "Tibwen / Tigout", note: "En Martinique on dit 'Tibren'" },
      { fr: "Tout va bien !", gcr: "Tout biten ka aji !", note: "Expression emblématique de la Guadeloupe" },
    ],
  },
  {
    title: "5. Expressions et tournures idiomatiques de Guadeloupe",
    description: "Le créole guadeloupéen privilégie des tournures vivantes et des métaphores ancrées dans le patrimoine caribéen.",
    examples: [
      { fr: "Tout va très bien", gcr: "Tout biten ka aji !", note: "Littéralement: toutes les choses agissent" },
      { fr: "Pas de problème", gcr: "Pani pwoblèm !", note: "Contraction de 'pa ni' (il n'y a pas)" },
      { fr: "Tenir bon face aux épreuves", gcr: "Tjenbé rèd pa molli !", note: "Encouragement traditionnel guadeloupéen" },
    ],
  },
];
