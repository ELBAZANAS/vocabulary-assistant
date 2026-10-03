import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { applySrs } from "../src/lib/srs.ts";

export interface VocabularyWord {
  word: string;
  phonetic: string;
  part_of_speech: string;
  meaning: string;
  meaning_pinyin?: string;
  example: string;
  translation: string;
  translation_pinyin?: string;
  source_name: string;
  source_url: string;
  synonyms: string[];
  antonyms: string[];
  collocations: string[];
  created_at: string;
  last_reviewed_at: string | null;
  review_count: number;
  proficiency: number; // 0: new, 1-5: mastery level
  ease_factor?: number;
  interval_days?: number;
  next_review_at?: string | null;
}

export interface ReviewLog {
  id: string;
  word: string;
  is_correct: boolean;
  reviewed_at: string;
}

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DB_PATH = path.join(PROJECT_ROOT, "data", "vocabulary.json");

const DEFAULT_WORDS: VocabularyWord[] = [
  {
    word: "sanction",
    phonetic: "/ˈsæŋkʃn/",
    part_of_speech: "noun",
    meaning: "制裁，处罚；批准，认可",
    example: "The government imposed new sanctions on several foreign companies, aiming to enforce compliance with recent ecological standards.",
    translation: "政府对几家外国公司实施了新制裁，旨在强制遵守近期的生态标准。",
    source_name: "Sample",
    source_url: "",
    synonyms: ["penalty", "embargo", "ban", "restriction"],
    antonyms: ["approval", "permission", "authorization"],
    collocations: ["economic sanctions", "impose sanctions", "lift sanctions"],
    created_at: new Date("2026-06-15T10:00:00.000Z").toISOString(),
    last_reviewed_at: new Date("2026-06-16T15:00:00.000Z").toISOString(),
    review_count: 2,
    proficiency: 3,
    ease_factor: 2.5,
    interval_days: 3,
    next_review_at: new Date("2026-06-19T15:00:00.000Z").toISOString(),
  },
  {
    word: "abandon",
    phonetic: "/əˈbændən/",
    part_of_speech: "verb",
    meaning: "放弃，遗弃，中途而废",
    example: "The crew members had to abandon the ship when the water level began to rise rapidly during the summer gale.",
    translation: "在夏日大风中水位开始迅速上升时，船员们不得不弃船。",
    source_name: "Sample",
    source_url: "",
    synonyms: ["desert", "forsake", "discard", "relinquish"],
    antonyms: ["keep", "retain", "maintain", "uphold"],
    collocations: ["abandon a project", "abandon hope", "abandon ship"],
    created_at: new Date("2026-06-12T08:30:00.000Z").toISOString(),
    last_reviewed_at: null,
    review_count: 0,
    proficiency: 1,
    ease_factor: 2.5,
    interval_days: 0,
    next_review_at: new Date("2026-06-12T08:30:00.000Z").toISOString(),
  },
  {
    word: "resilience",
    phonetic: "/rɪˈzɪliəns/",
    part_of_speech: "noun",
    meaning: "韧性，弹力，快速恢复的能力",
    example: "Local business owners demonstrated extraordinary economic resilience in adapting to supply chain disruptions over the past quarter.",
    translation: "在过去一个季度里，当地的企业主在适应供应链中断方面展现了非凡的经济韧性。",
    source_name: "Sample",
    source_url: "",
    synonyms: ["elasticity", "flexibility", "grit", "toughness"],
    antonyms: ["fragility", "weakness", "vulnerability"],
    collocations: ["community resilience", "psychological resilience", "economic resilience"],
    created_at: new Date("2026-06-16T18:45:00.000Z").toISOString(),
    last_reviewed_at: new Date("2026-06-16T21:00:00.000Z").toISOString(),
    review_count: 1,
    proficiency: 2,
    ease_factor: 2.5,
    interval_days: 1,
    next_review_at: new Date("2026-06-17T21:00:00.000Z").toISOString(),
  },
];

export interface WorkflowStep {
  status: string;
  detail: string;
  timestamp: string;
  durationMs: number;
  apiUsed: string;
  tokensConsumed: number;
}

export interface WorkflowLog {
  id: string;
  word: string;
  timestamp: string;
  totalDurationMs: number;
  success: boolean;
  steps: WorkflowStep[];
}

export interface QuizHistoryItem {
  id: string;
  word: string;
  question: string;
  selected_option: string;
  correct_option: string;
  is_correct: boolean;
  answered_at: string;
}

export interface UserPreferences {
  provider: "gemini" | "openai" | "deepseek" | "offline" | "qwen" | "groq" | "grok";
  api_key_status: boolean;
}

interface DBStructure {
  words: VocabularyWord[];
  review_logs: ReviewLog[];
  workflow_logs: WorkflowLog[];
  quiz_history: QuizHistoryItem[];
  preferences: UserPreferences;
}

function ensureDbExists() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const initialData: DBStructure = {
      words: DEFAULT_WORDS,
      review_logs: [],
      workflow_logs: [],
      quiz_history: [
        {
          id: "hist-1",
          word: "sanction",
          question: "The government imposed new ___ on several foreign companies, aiming to enforce compliance with recent ecological standards.",
          selected_option: "sanctions",
          correct_option: "sanctions",
          is_correct: true,
          answered_at: new Date("2026-06-16T16:00:00.000Z").toISOString(),
        }
      ],
      preferences: {
        provider: "offline",
        api_key_status: false
      }
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), "utf-8");
  }
}

function isPlaceholderKey(key: string | undefined, placeholders: string[]): boolean {
  if (!key || !key.trim()) return true;
  return placeholders.includes(key.trim());
}

export function isKeyValid(provider: string): boolean {
  if (provider === "offline") return false;
  if (provider === "qwen") {
    return !isPlaceholderKey(process.env.QWEN_API_KEY, ["YOUR_QWEN_API_KEY"]);
  }
  if (provider === "groq" || provider === "grok") {
    const key = process.env.GROQ_API_KEY || process.env.GROK_API_KEY;
    return !isPlaceholderKey(key, ["YOUR_GROQ_API_KEY", "YOUR_GROK_API_KEY"]);
  }
  if (provider === "gemini") {
    return !isPlaceholderKey(process.env.GEMINI_API_KEY, ["YOUR_GEMINI_API_KEY", "MY_GEMINI_API_KEY"]);
  }
  return false;
}

export function getFullDB(): DBStructure {
  ensureDbExists();
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    const parsed = JSON.parse(raw) as DBStructure;
    const provider = parsed.preferences?.provider || "gemini";
    const words = (parsed.words || []).map((word) => ({
      ...word,
      ease_factor: word.ease_factor ?? 2.5,
      interval_days: word.interval_days ?? (word.review_count > 0 ? Math.max(1, word.proficiency) : 0),
      next_review_at: word.next_review_at ?? word.last_reviewed_at ?? word.created_at,
    }));

    return {
      words,
      review_logs: parsed.review_logs || [],
      workflow_logs: parsed.workflow_logs || [],
      quiz_history: parsed.quiz_history || [],
      preferences: {
        provider,
        api_key_status: isKeyValid(provider)
      }
    };
  } catch (err) {
    console.error("Error reading full database structure", err);
    let provider: "gemini" | "openai" | "deepseek" | "offline" | "qwen" | "groq" | "grok" = "gemini";
    if (!isKeyValid(provider)) {
      if (isKeyValid("groq")) {
        provider = "groq";
      } else if (isKeyValid("qwen")) {
        provider = "qwen";
      }
    }
    return {
      words: DEFAULT_WORDS,
      review_logs: [],
      workflow_logs: [],
      quiz_history: [],
      preferences: { provider, api_key_status: isKeyValid(provider) }
    };
  }
}

export function saveFullDB(db: DBStructure): void {
  ensureDbExists();
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing full database", err);
  }
}

export function getWords(): VocabularyWord[] {
  return getFullDB().words;
}

export function getLogs(): ReviewLog[] {
  return getFullDB().review_logs;
}

export function getWorkflowLogs(): WorkflowLog[] {
  return getFullDB().workflow_logs;
}

export function getQuizHistory(): QuizHistoryItem[] {
  return getFullDB().quiz_history;
}

export function getPreferences(): UserPreferences {
  return getFullDB().preferences;
}

export function saveDB(words: VocabularyWord[], logs: ReviewLog[]): void {
  const db = getFullDB();
  db.words = words;
  db.review_logs = logs;
  saveFullDB(db);
}

export function addWorkflowLog(log: WorkflowLog): void {
  const db = getFullDB();
  db.workflow_logs = db.workflow_logs || [];
  db.workflow_logs.push(log);
  saveFullDB(db);
}

function labelApiFromStep(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("tavily")) return "Tavily Search";
  if (t.includes("dict") || t.includes("wiktionary") || t.includes("dictionary")) return "Free Dictionary API";
  if (t.includes("translat") || t.includes("pinyin") || t.includes("linguistic")) return "Google Translate";
  if (t.includes("qwen")) return "Qwen";
  if (t.includes("groq") || t.includes("grok")) return "Groq / Grok";
  if (t.includes("gemini") || t.includes("grounding") || t.includes("parsing") || t.includes("ai")) return "Gemini";
  return "LexiFlow";
}

export function recordAgentRun(
  word: string,
  logs: { title: string; detail: string; timestamp: string }[],
  success: boolean,
  durationMs: number
): void {
  addWorkflowLog({
    id: "wf-" + Math.random().toString(36).substring(2, 9),
    word: word.trim().toLowerCase(),
    timestamp: new Date().toISOString(),
    totalDurationMs: Math.max(0, Math.round(durationMs)),
    success,
    steps: (logs || []).map((step) => ({
      status: step.title,
      detail: step.detail,
      timestamp: step.timestamp,
      durationMs: 0,
      apiUsed: labelApiFromStep(step.title),
      tokensConsumed: 0,
    })),
  });
}

export function addQuizHistoryItem(item: QuizHistoryItem): void {
  const db = getFullDB();
  db.quiz_history = db.quiz_history || [];
  db.quiz_history.push(item);
  saveFullDB(db);
}

export function savePreferences(prefs: UserPreferences): void {
  const db = getFullDB();
  db.preferences = prefs;
  saveFullDB(db);
}

export function addWord(word: VocabularyWord): void {
  const words = getWords();
  const logs = getLogs();
  const normalized: VocabularyWord = {
    ...word,
    ease_factor: word.ease_factor ?? 2.5,
    interval_days: word.interval_days ?? 0,
    next_review_at: word.next_review_at ?? new Date().toISOString(),
  };
  
  // Check if word already exists (case-insensitive)
  const existingIndex = words.findIndex(w => w.word.toLowerCase() === normalized.word.toLowerCase());
  if (existingIndex !== -1) {
    words[existingIndex] = {
      ...words[existingIndex],
      ...normalized,
      review_count: words[existingIndex].review_count,
      proficiency: words[existingIndex].proficiency,
      last_reviewed_at: words[existingIndex].last_reviewed_at,
      ease_factor: words[existingIndex].ease_factor,
      interval_days: words[existingIndex].interval_days,
      next_review_at: words[existingIndex].next_review_at,
    };
  } else {
    words.push(normalized);
  }
  saveDB(words, logs);
}

export function deleteWord(targetWord: string): boolean {
  const words = getWords();
  const logs = getLogs();
  const initialLength = words.length;
  const filteredWords = words.filter(w => w.word.toLowerCase() !== targetWord.toLowerCase());
  const filteredLogs = logs.filter(l => l.word.toLowerCase() !== targetWord.toLowerCase());
  
  if (filteredWords.length < initialLength) {
    saveDB(filteredWords, filteredLogs);
    return true;
  }
  return false;
}

export function updateWord(targetWord: string, updates: Partial<VocabularyWord>): boolean {
  const words = getWords();
  const logs = getLogs();
  const index = words.findIndex(w => w.word.toLowerCase() === targetWord.toLowerCase());
  if (index !== -1) {
    words[index] = {
      ...words[index],
      ...updates,
    };
    saveDB(words, logs);
    return true;
  }
  return false;
}

export function registerReview(targetWord: string, isCorrect: boolean): VocabularyWord | null {
  const words = getWords();
  const logs = getLogs();
  const index = words.findIndex(w => w.word.toLowerCase() === targetWord.toLowerCase());
  if (index !== -1) {
    const wordObj = words[index];
    Object.assign(wordObj, applySrs(wordObj, isCorrect));
    
    // Add event log
    const newLog: ReviewLog = {
      id: Math.random().toString(36).substring(2, 9),
      word: wordObj.word,
      is_correct: isCorrect,
      reviewed_at: new Date().toISOString(),
    };
    logs.push(newLog);
    
    saveDB(words, logs);
    return wordObj;
  }
  return null;
}
