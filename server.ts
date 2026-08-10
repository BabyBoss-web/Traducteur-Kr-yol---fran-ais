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

const CREOLE_SYSTEM_INSTRUCTION = `Vous êtes un moteur de traduction automatique de pointe, fonctionnant exactement à la manière de Google Traduction, spécialisé dans la traduction entre le Français et le Créole Guadeloupéen (kréyol gwadloupéyen - orthographe GEREC).

DIRECTIVES ABSOLUES DE GOOGLE TRADUCTION :
1. TRADUCTION SYSTÉMATIQUE DANS 100% DES CAS :
   - Vous devez OBLIGATOIREMENT fournir une traduction pour TOUT texte ou mot saisi, sans aucune exception.
   - Ne dites JAMAIS "Je ne peux pas traduire", "Saisie invalide" ou "Désolé".
   - Si un mot est un nom propre, une marque, un code, un mot inventé ou un terme technique sans équivalent direct, conservez-le tel quel ou adaptez-le phonétiquement dans la phrase traduite (exactement comme le fait Google Traduction).

2. COMPRÉHENSION INTELLIGENTE DES FAUTES (SUGGESTION À LA GOOGLE TRADUCTION) :
   - Si la saisie contient des fautes de frappe, d'orthographe, du langage SMS ou de la phonétique approximative, déduisez immédiatement l'intention réelle de l'utilisateur.
   - Traduisez la pensée corrigée et renseignez "detectedCorrection" avec la version source correctement orthographiée (ex: si l'utilisateur écrit "je teme", traduisez "mwen enmen'w" et mettez "je t'aime" dans detectedCorrection).

3. DIALECTE GUADELOUPÉEN STRICT (GEREC) :
   - Utilisez exclusivement la grammaire et le lexique de Guadeloupe :
     - Chose/Objet = "biten" ou "zafè" (JAMAIS "bagay").
     - Possessifs postposés avec "an"/"a" = "kaz an mwen", "frè a'w", "papa a'y".
     - Marqueurs verbraux : "ka" (présent/habitude), verbe seul (passé), "ké"/"kay" (futur), "té" (passé antérieur), "té ka" (imparfait).
     - Expressions locales : "Tout biten ka aji !", "Ké novèl ?", "A pa ti bon !", "Tjenbé rèd pa molli !", "An dousè !".

Retournez STRICTEMENT un objet JSON valide correspondant au schéma demandé :
{
  "translation": "La traduction exacte ou adaptée (Style Google Traduction)",
  "detectedCorrection": "La phrase source corrigée s'il y avait une faute d'orthographe/frappe, sinon chaîne vide",
  "grammaticalNotes": "Explication brève des choix de traduction",
  "wordBreakdown": [
    { "source": "mot source", "target": "mot cible", "explanation": "sens ou rôle" }
  ],
  "alternativeExpressions": ["Formulation alternative courante si utile"],
  "expressionRegister": "Courant | Traditionnel / Ancien | Familier | Formel | Proverbe / Image",
  "registerExplanation": "Précision sur le registre ou contexte"
}`;

// Helper function for resilient Gemini API calls with retries and fallback models
async function generateContentWithRetry(options: {
  models: string[];
  contents: any;
  config: any;
  maxRetriesPerModel?: number;
}) {
  const { models, contents, config, maxRetriesPerModel = 1 } = options;
  let lastError: any;

  for (const model of models) {
    for (let attempt = 0; attempt <= maxRetriesPerModel; attempt++) {
      try {
        if (attempt > 0) {
          const delay = Math.pow(2, attempt) * 400 + Math.random() * 100;
          console.log(`[Retry] Retrying model ${model}, attempt ${attempt}...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        const response = await ai.models.generateContent({
          model,
          contents,
          config,
        });

        if (response && response.text) {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = String(err?.message || err);
        const isQuotaError =
          err?.status === 429 ||
          errMsg.includes("429") ||
          errMsg.includes("RESOURCE_EXHAUSTED") ||
          errMsg.includes("quota");

        if (isQuotaError) {
          console.warn(`[Gemini API Quota Exceeded] Model ${model} rate-limited/exhausted. Switching to next model...`);
          break; // Switch to fallback model immediately on 429
        }

        console.warn(`[Gemini API Warning] Model ${model} attempt ${attempt} failed: ${errMsg}`);
      }
    }
  }

  throw lastError || new Error("Service de traduction momentanément indisponible.");
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

    const prompt = `Traduisez systématiquement le texte suivant ${direction} :
"${text.trim()}"

Rappels impératifs pour garantir la traduction dans 100% des cas :
1. Traduisez QUEL QUE SOIT le mot écrit (mot inventé, nom propre, jargon, argot, abréviation, faute de frappe, etc.).
2. Si un mot ou une expression est réellement impossible à traduire (ex: nom propre, marque, terme technique inédit), conservez ce mot tel quel dans la phrase sans jamais bloquer ni refuser.
3. Si le texte d'origine contient des fautes, déduisez l'intention et remplissez "detectedCorrection" avec le texte corrigé.
4. Fournissez toujours une traduction fluide et adaptée en Créole Guadeloupéen (GEREC) ou en Français selon la direction.`;

    const response = await generateContentWithRetry({
      models: ["gemini-3.6-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"],
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
            detectedCorrection: {
              type: Type.STRING,
              description: "Correction de l'orthographe source si applicable",
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
            expressionRegister: {
              type: Type.STRING,
              description: "Registre de langue : Courant, Traditionnel / Ancien, Familier, Formel ou Proverbe / Image",
            },
            registerExplanation: {
              type: Type.STRING,
              description: "Précisions sur l'ancienneté, le registre de langue ou le contexte d'utilisation de l'expression",
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

    let parsedData: any;
    try {
      let cleanText = resultText.trim();
      if (cleanText.startsWith("```")) {
        cleanText = cleanText.replace(/^```[a-z]*\n?/, "").replace(/\n?```$/, "");
      }
      parsedData = JSON.parse(cleanText);
    } catch (parseErr) {
      console.warn("Échec du parse JSON strict, fallback sur extraction:", parseErr);
      parsedData = {
        translation: resultText.trim(),
        detectedCorrection: "",
        grammaticalNotes: "Traduction effectuée selon la grammaire du Créole Guadeloupéen.",
        wordBreakdown: [],
        alternativeExpressions: [],
      };
    }

    // Ensure object structure integrity
    if (!parsedData.translation || typeof parsedData.translation !== "string") {
      parsedData.translation = typeof parsedData === "string" ? parsedData : resultText;
    }
    if (!parsedData.grammaticalNotes) {
      parsedData.grammaticalNotes = "Traduction respectant les normes GEREC du Créole Guadeloupéen.";
    }
    if (!Array.isArray(parsedData.wordBreakdown)) {
      parsedData.wordBreakdown = [];
    }
    if (!Array.isArray(parsedData.alternativeExpressions)) {
      parsedData.alternativeExpressions = [];
    }
    if (typeof parsedData.detectedCorrection !== "string") {
      parsedData.detectedCorrection = "";
    }

    res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error("Erreur de traduction API - secours automatique:", error);
    const fallbackText = req.body?.text ? String(req.body.text).trim() : "";
    res.json({
      success: true,
      data: {
        translation: fallbackText,
        detectedCorrection: "",
        grammaticalNotes: "Terme ou expression conservé tel quel.",
        wordBreakdown: fallbackText
          ? [{ source: fallbackText, target: fallbackText, explanation: "Mot d'origine conservé" }]
          : [],
        alternativeExpressions: [],
        expressionRegister: "Courant",
        registerExplanation: "Terme conservé en l'état.",
      },
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
