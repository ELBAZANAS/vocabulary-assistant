import express from "express";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import {
  getWords, deleteWord, addWord, updateWord, registerReview, getLogs, getWorkflowLogs,
  getQuizHistory, addQuizHistoryItem, getPreferences, savePreferences, isKeyValid, recordAgentRun,
} from "./db";
import {
  searchAndEnrichWord, generateQuizForWord, generalSearchAndTranslate,
  generateStoryForWords, getAITutorReply, testKeysDiagnostics,
} from "./agent";
import { processCommand } from "./commands";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(PROJECT_ROOT, ".env") });
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/api/vocabulary", (req, res) => {
    try {
      res.json({
        success: true,
        words: getWords(),
        logs: getLogs(),
        workflowLogs: getWorkflowLogs(),
        quizHistory: getQuizHistory(),
        preferences: getPreferences(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/vocabulary/add", async (req, res) => {
    try {
      const { word } = req.body;
      if (!word || typeof word !== "string" || word.trim() === "") {
        return res.status(400).json({ success: false, error: "Missing required string 'word'" });
      }

      const started = Date.now();
      const agentResult = await searchAndEnrichWord(word);

      if (agentResult.success && agentResult.wordData) {
        addWord(agentResult.wordData);
        recordAgentRun(word, agentResult.logs || [], true, Date.now() - started);
      } else {
        recordAgentRun(word, agentResult.logs || [], false, Date.now() - started);
      }

      res.json(agentResult);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/vocabulary/quiz/result", (req, res) => {
    try {
      const { word, question, selectedOption, correctOption, isCorrect } = req.body;
      if (!word || !question || selectedOption === undefined || correctOption === undefined || isCorrect === undefined) {
        return res.status(400).json({ success: false, error: "Missing required fields for quiz registration" });
      }

      addQuizHistoryItem({
        id: "quiz-" + Math.random().toString(36).substring(2, 9),
        word,
        question,
        selected_option: selectedOption,
        correct_option: correctOption,
        is_correct: isCorrect,
        answered_at: new Date().toISOString(),
      });

      res.json({ success: true, message: "Quiz result registered successfully." });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/preferences/update", (req, res) => {
    try {
      const { provider } = req.body;
      if (!provider) {
        return res.status(400).json({ success: false, error: "Missing model 'provider' selection" });
      }
      savePreferences({ provider, api_key_status: isKeyValid(provider) });
      res.json({ success: true, message: "LLM configuration preference updated." });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete("/api/vocabulary/delete", (req, res) => {
    try {
      const { word } = req.body;
      if (!word) {
        return res.status(400).json({ success: false, error: "Missing string 'word' in body" });
      }
      const success = deleteWord(word);
      res.json({ success, message: success ? `Delete successful for word: ${word}` : "Word not found" });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/vocabulary/update", (req, res) => {
    try {
      const { word, updates } = req.body;
      if (!word || !updates) {
        return res.status(400).json({ success: false, error: "Missing 'word' or 'updates' field" });
      }
      const success = updateWord(word, updates);
      res.json({ success, message: success ? "Updated successfully" : "Word not found" });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/vocabulary/review", (req, res) => {
    try {
      const { word, isCorrect } = req.body;
      if (!word || isCorrect === undefined) {
        return res.status(400).json({ success: false, error: "Missing 'word' or 'isCorrect' boolean in body" });
      }
      const updatedWord = registerReview(word, isCorrect);
      if (updatedWord) {
        res.json({ success: true, word: updatedWord });
      } else {
        res.status(404).json({ success: false, error: "Word not found in database to review" });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get("/api/vocabulary/quiz", async (req, res) => {
    try {
      const words = getWords();
      if (!words || words.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Your vocabulary list is empty. Add words first.",
        });
      }
      const randomWord = words[Math.floor(Math.random() * words.length)];
      const quiz = await generateQuizForWord(randomWord);
      res.json({ success: true, quiz, target_word: randomWord.word });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/agent/general-search-translate", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== "string" || query.trim() === "") {
        return res.status(400).json({ success: false, error: "Missing required string 'query'" });
      }
      res.json(await generalSearchAndTranslate(query));
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/agent/chat", async (req, res) => {
    try {
      const { history, latestPrompt, optionalWord, personaMode } = req.body;
      if (!latestPrompt || typeof latestPrompt !== "string") {
        return res.status(400).json({ success: false, error: "Missing required 'latestPrompt'" });
      }
      const tutorResult = await getAITutorReply(history || [], latestPrompt, optionalWord, personaMode);
      res.json({
        success: true,
        reply: tutorResult.reply,
        provider: tutorResult.provider,
        modelName: tutorResult.modelName,
        isOffline: tutorResult.isOffline,
        actionsExecuted: tutorResult.actionsExecuted || [],
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get("/api/agent/status", (req, res) => {
    try {
      const prefs = getPreferences();
      const provider = prefs.provider;
      const isOfflineStatus = provider === "offline" || !isKeyValid(provider);
      const groqKey = process.env.GROQ_API_KEY || process.env.GROK_API_KEY || "";
      const isXAI = groqKey.startsWith("xai-");
      let modelName = "Llama-3.3-70B (Groq)";
      if (provider === "offline") modelName = "Dictionary fallback";
      else if (provider === "gemini") modelName = "Gemini 3.5 Flash";
      else if (provider === "qwen") modelName = "Qwen-Plus";
      else if (provider === "grok" || isXAI) modelName = "Grok-2 (X.AI)";

      res.json({
        success: true,
        provider,
        isOffline: isOfflineStatus,
        modelName: isOfflineStatus ? (provider === "offline" ? "Dictionary fallback" : "Local dictionary fallback") : modelName,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/story-forge", async (req, res) => {
    try {
      const { words } = req.body;
      if (!words || !Array.isArray(words) || words.length === 0) {
        return res.status(400).json({ success: false, error: "Missing required string array 'words'" });
      }
      const result = await generateStoryForWords(words);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/command", async (req, res) => {
    try {
      const command = req.body?.command ?? req.body?.message ?? req.body?.text;
      if (!command || typeof command !== "string") {
        return res.status(400).json({ success: false, error: "Missing string 'command'" });
      }
      const result = await processCommand(command);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get("/api/diagnostics/keys", async (req, res) => {
    try {
      const reports = await testKeysDiagnostics();
      res.json({ success: true, ...reports });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(PROJECT_ROOT, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LexiFlow running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
