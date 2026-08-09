import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

const CREOLE_SYSTEM_INSTRUCTION = `Vous êtes un traducteur expert diplômé en linguistique créole, spécialisé EXCLUSIVEMENT dans le Créole Guadeloupéen (kréyol gwadloupéyen) et le Français.
Votre rôle est de fournir des traductions ultra-précises, naturelles et parfaitement conformes à l'orthographe officielle GEREC (Groupe d'Études et de Recherches en Espace Créolophone) et aux règles de la grammaire créole de Guadeloupe.

RÈGLE D'OR : NE JAMAIS CONFONDRE LE CRÉOLE GUADELOUPÉEN ET LE CRÉOLE MARTINICAIN !
Distinctions lexicales et grammaticales majeures à respecter impérativement :
- Chose / Objet / Affaire : Utiliser "biten" ou "zafè" (Guadeloupe) et JAMAIS "bagay" (Martinique).
- Possessifs postposés : Utiliser la préposition "an" ou "a" : "loto an mwen", "kaz a'w", "zanmi a'y" (Guadeloupe) et JAMAIS la possession directe sans particule comme "loto mwen" ou "maman i" (Martinique).
- Vouloir : Utiliser "vlé" (Guadeloupe) et JAMAIS "lé" (Martinique).
- Pouvoir : Utiliser "pé" (Guadeloupe).
- Futur : Utiliser "ké" ou "kay" + verbe (Guadeloupe).
- Petit / Un peu : Utiliser "ti", "tibwen", "tigout" (Guadeloupe) et JAMAIS "tibren" (Martinique).
- Aller : Utiliser "a" ou "alé" (Guadeloupe).
- Les expressions typiques de Guadeloupe : "Tout biten ka aji !", "Ké novèl ?", "A pa ti bon !", "Tjenbé rèd pa molli !", "An dousè !".

Règles impératives de traduction :
1. ORTHOGRAPHE GEREC STRICTE :
   - Pas de lettres "c", "q", "x", "w" inutile (sauf dans les digrammes créoles comme "ou", "ch", "dj", "tj", "ny").
   - Utiliser "k" pour le son /k/ (ex: "kaz", "koko", "ki jan").
   - Utiliser "z" pour le son /z/ et "s" pour le son /s/ (ex: "sakasaka", "masikay").
   - Utiliser "è" (open e) et "ò" (open o) quand nécessaire (ex: "frè", "sòti", "alò").
   - Digrammes spécifiques : "dj" (djigidji), "tj" (tjenbé), "ny" (monyen).

2. MARQUEURS VERBAUX DU CRÉOLE GUADELOUPÉEN :
   - Présent continu / habituel ("en train de", "fait habituellement") : "ka" + verbe (ex: "Mwen ka travay", "I ka dormi").
   - Passé accompli ("a fait", "a terminé") : verbe seul sans marqueur (ex: "Mwen travay", "Yo pati", "An mangé").
   - Passé continu ("était en train de") : "té ka" + verbe (ex: "Mwen té ka li yon liv").
   - Passé révolu / antérieur : "té" + verbe (ex: "Mwen té di'w").
   - Futur / Intention ("va", "fera") : "ké" ou "kay" + verbe (ex: "An ké vini", "Yo kay fè fèt").
   - Conditionnel : "té ké" + verbe (ex: "Si mwen té sav, an té ké vini").

3. ARTICLES ET POSSESSIFS POSTPOSÉS (SPÉCIFICITÉ GUADELOUPE) :
   - L'article défini se place TOUJOURS APRÈS le nom avec un trait d'union :
     - -la (ex: "la maison" = "kaz-la", "le livre" = "liv-la")
     - -lan / -an après nasale (ex: "le pain" = "pen-nan" / "pen-an")
     - -yo pour le pluriel ("les maisons" = "kaz-yo", "les enfants" = "timoun-yo")
   - Les adjectifs possessifs se placent APRÈS le nom avec particule "an" / "a" :
     - "mon/ma/mes" = [nom] + "an mwen" / "mwen" (ex: "mon ami" = "zanmi an mwen", "ma maison" = "kaz an mwen")
     - "ton/ta/tes" = [nom] + "a'w" / "ou" (ex: "ton frère" = "frè a'w")
     - "son/sa/ses" = [nom] + "a'y" / "i" (ex: "son père" = "papa a'y")
     - "notre/nos" = [nom] + "an nou" / "nou"
     - "votre/vos" = [nom] + "a zòt" / "zò"
     - "leur/leurs" = [nom] + "a yo" / "yo"

4. TON ET EXPRESSIONS NATURELLES DE GUADELOUPE :
   - Adaptez le ton pour qu'il soit authentique et parlé en Guadeloupe.
   - Préservez les salutations et interjections locales ("Bonjou", "Ké novèl ?", "A pa ti bon !", "Pani pwoblèm", "Sa ka maché", "An dousè", "Tjenbé rèd").

Retournez STRICTEMENT un objet JSON valide correspondant au schéma demandé :
{
  "translation": "La traduction exacte en Créole Guadeloupéen",
  "grammaticalNotes": "Explication brève et pédagogique des choix grammaticaux et marqueurs utilisés (ex: 'Utilisation de biten au lieu de bagay (spécifique Guadeloupe), du marqueur ka pour le présent continu et du possessif postposé an mwen')",
  "wordBreakdown": [
    { "source": "mot/groupe source", "target": "mot/groupe cible", "explanation": "rôle grammatical ou sens" }
  ],
  "alternativeExpressions": ["Alternative 1 ou tournure plus familière/imagée si applicable"]
}`;

// Helper function for resilient Gemini API calls with retries and fallback models
async function generateContentWithRetry(options: {
  models: string[];
  contents: any;
  config: any;
  maxRetriesPerModel?: number;
}) {
  const { models, contents, config, maxRetriesPerModel = 2 } = options;
  let lastError: any;

  for (const model of models) {
    for (let attempt = 0; attempt <= maxRetriesPerModel; attempt++) {
      try {
        if (attempt > 0) {
          const delay = Math.pow(2, attempt) * 500 + Math.random() * 200;
          console.log(`[Retry] Retrying model ${model}, attempt ${attempt}...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        const response = await ai.models.generateContent({
          model,
          contents,
          config,
        });

        return response;
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini API Warning] Model ${model} attempt ${attempt} failed: ${err.message}`);
      }
    }
  }

  throw lastError;
}

// Translation API Endpoint
app.post("/api/translate", async (req, res) => {
  try {
    const { text, sourceLang, targetLang } = req.body;

    if (!text || typeof text !== "string" || text.trim() === "") {
      return res.status(400).json({ error: "Le texte à traduire est requis." });
    }

    const direction =
      sourceLang === "fr" && targetLang === "gcr"
        ? "du Français vers le Créole Guadeloupéen"
        : "du Créole Guadeloupéen vers le Français";

    const prompt = `Traduisez le texte suivant ${direction} :
"${text.trim()}"

Fournissez une traduction exacte respectant parfaitement la grammaire et l'orthographe GEREC du créole guadeloupéen.
Rappel des directions :
- Source : ${sourceLang === "fr" ? "Français" : "Créole Guadeloupéen"}
- Cible : ${targetLang === "gcr" ? "Créole Guadeloupéen (GEREC)" : "Français"}`;

    const response = await generateContentWithRetry({
      models: ["gemini-3.6-flash", "gemini-2.5-flash"],
      contents: prompt,
      config: {
        systemInstruction: CREOLE_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translation: {
              type: Type.STRING,
              description: "Le texte traduit",
            },
            grammaticalNotes: {
              type: Type.STRING,
              description:
                "Explication grammaticale pédagogique des marqueurs verbaux et structure de phrase utilisée",
            },
            wordBreakdown: {
              type: Type.ARRAY,
              description: "Découpage mot à mot ou expression par expression",
              items: {
                type: Type.OBJECT,
                properties: {
                  source: { type: Type.STRING },
                  target: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                },
                required: ["source", "target"],
              },
            },
            alternativeExpressions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Autres manières naturelles d'exprimer la même idée",
            },
          },
          required: ["translation", "grammaticalNotes", "wordBreakdown"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Aucune réponse générée par le modèle.");
    }

    const parsedData = JSON.parse(resultText);
    res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error("Erreur de traduction:", error);
    const is503 = error?.status === 503 || error?.message?.includes("503") || error?.message?.includes("high demand");
    res.status(500).json({
      success: false,
      error: is503
        ? "Le service AI est temporairement très sollicité. Veuillez réessayer dans un instant."
        : error.message || "Erreur lors de la traduction.",
    });
  }
});

// Gemini TTS API Endpoint for authentic Guadeloupean Creole voice synthesis
app.post("/api/tts", async (req, res) => {
  try {
    const { text, lang } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Texte manquant" });
    }

    const isCreole = lang === "gcr";
    const promptText = isCreole
      ? `En tant que locuteur natif de la Guadeloupe, prononcez la phrase suivante en créole guadeloupéen (kréyol gwadloupéyen) avec un accent antillais guadeloupéen authentique, chaleureux, expressif et naturel, en respectant la mélodie et l'intonation locales : "${text}"`
      : `Prononcez la phrase suivante en français de manière claire et naturelle : "${text}"`;

    const response = await generateContentWithRetry({
      models: ["gemini-3.1-flash-tts-preview"],
      contents: [{ parts: [{ text: promptText }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: isCreole ? "Kore" : "Puck" },
          },
        },
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    const base64Audio = part?.inlineData?.data;
    const mimeType = part?.inlineData?.mimeType || "audio/pcm;rate=24000";

    if (base64Audio) {
      return res.json({ success: true, audioBase64: base64Audio, mimeType });
    } else {
      return res.status(500).json({ error: "Impossible de générer l'audio" });
    }
  } catch (error: any) {
    console.error("Erreur TTS:", error);
    res.status(500).json({ error: "Erreur TTS backend: " + error.message });
  }
});

async function startServer() {
  // Vite middleware in development mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
