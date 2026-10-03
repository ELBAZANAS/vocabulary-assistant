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
  proficiency: number; // 1-5 mastery indicator
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

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

export interface AgentStep {
  title: string;
  detail: string;
  timestamp: string;
}
