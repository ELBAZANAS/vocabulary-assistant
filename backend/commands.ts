import {
  getWords,
  deleteWord,
  addWord,
  registerReview,
  addQuizHistoryItem,
  recordAgentRun,
} from "./db";
import { searchAndEnrichWord, generateQuizForWord, getAITutorReply } from "./agent";
import { isDueForReview } from "../src/lib/srs.ts";

export interface CommandQuiz {
  word: string;
  question: string;
  options: string[];
  answer: string;
}

export interface CommandResult {
  reply: string;
  quiz?: CommandQuiz;
  mutated: boolean;
}

let pendingQuiz: CommandQuiz | null = null;
const sessionHistory: { sender: "user" | "bot"; text: string }[] = [];

function optionMatchesAnswer(option: string, answer: string): boolean {
  const o = option.trim().toLowerCase();
  const a = (answer || "").trim().toLowerCase();
  if (!o || !a) return false;
  return o === a || a.includes(o) || o.includes(a);
}

function helpText(): string {
  return [
    "LexiFlow command console — these commands change your real deck.",
    "",
    "help                 Show this list",
    "deck                 List saved words",
    "due                  Cards due for review",
    "add <word>           Look up and save a word",
    "delete <word>        Remove a word",
    "query <word>         Show a saved card",
    "quiz                 One multiple-choice question (reply A–D)",
    "",
    "Anything else is sent to the AI tutor, which can also add or delete words.",
  ].join("\n");
}

function gradePendingQuiz(input: string): CommandResult | null {
  if (!pendingQuiz) return null;

  const letters = ["a", "b", "c", "d"];
  const cleaned = input.trim().toLowerCase().replace(/[.)]/g, "");
  const letterIndex = letters.indexOf(cleaned);
  let chosen = input.trim();
  if (letterIndex >= 0 && pendingQuiz.options[letterIndex]) {
    chosen = pendingQuiz.options[letterIndex];
  } else {
    const byText = pendingQuiz.options.find((o) => o.toLowerCase() === cleaned);
    if (byText) chosen = byText;
    else return null;
  }

  const isCorrect = optionMatchesAnswer(chosen, pendingQuiz.answer);
  registerReview(pendingQuiz.word, isCorrect);
  addQuizHistoryItem({
    id: "quiz-" + Math.random().toString(36).substring(2, 9),
    word: pendingQuiz.word,
    question: pendingQuiz.question,
    selected_option: chosen,
    correct_option: pendingQuiz.answer,
    is_correct: isCorrect,
    answered_at: new Date().toISOString(),
  });

  const word = pendingQuiz.word;
  const answer = pendingQuiz.answer;
  pendingQuiz = null;

  return {
    mutated: true,
    reply: isCorrect
      ? `Correct. “${word}” is logged as an easy review.`
      : `Not quite. The answer was “${answer}”. “${word}” is logged as hard so it comes back sooner.`,
  };
}

export async function processCommand(raw: string): Promise<CommandResult> {
  const input = (raw || "").trim();
  if (!input) {
    return { reply: "Type a command, or help.", mutated: false };
  }

  const graded = gradePendingQuiz(input);
  if (graded) return graded;

  const lower = input.toLowerCase();

  if (lower === "help" || lower === "/help" || lower === "start" || lower === "/start") {
    return { reply: helpText(), mutated: false };
  }

  if (lower === "deck" || lower === "/deck" || lower === "list" || lower === "/list") {
    const words = getWords();
    if (words.length === 0) {
      return { reply: "Your deck is empty. Try: add resilient", mutated: false };
    }
    const list = words
      .map((w) => `• ${w.word} (${w.part_of_speech || "—"}) — ${w.meaning}  [${w.proficiency}/5]`)
      .join("\n");
    return { reply: `Deck (${words.length})\n\n${list}`, mutated: false };
  }

  if (lower === "due" || lower === "review" || lower === "/review") {
    const words = getWords();
    const due = words.filter((w) => isDueForReview(w));
    if (due.length === 0) {
      return {
        reply: words.length === 0
          ? "No words yet. Add one with: add scrutiny"
          : "Nothing is due right now. Open Flashcards and enable “include cards not due yet” if you still want to practice.",
        mutated: false,
      };
    }
    const list = due
      .slice(0, 8)
      .map((w) => `• ${w.word} — ${w.meaning} (proficiency ${w.proficiency}/5)`)
      .join("\n");
    return { reply: `${due.length} card(s) due\n\n${list}`, mutated: false };
  }

  if (lower.startsWith("delete ") || lower.startsWith("/delete ") || lower.startsWith("remove ")) {
    const wordToDelete = input.replace(/^\/?(delete|remove)\s+/i, "").trim().toLowerCase();
    if (!wordToDelete) return { reply: "Usage: delete <word>", mutated: false };
    const success = deleteWord(wordToDelete);
    return {
      mutated: success,
      reply: success ? `Deleted “${wordToDelete}”.` : `“${wordToDelete}” is not in your deck.`,
    };
  }

  if (lower.startsWith("query ") || lower.startsWith("/query ") || lower.startsWith("show ")) {
    const wordQuery = input.replace(/^\/?(query|show)\s+/i, "").trim().toLowerCase();
    const found = getWords().find((w) => w.word.toLowerCase() === wordQuery);
    if (!found) {
      return { reply: `“${wordQuery}” is not saved. Add it with: add ${wordQuery}`, mutated: false };
    }
    return {
      mutated: false,
      reply: [
        `${found.word} ${found.phonetic || ""}`,
        `${found.part_of_speech} — ${found.meaning}`,
        found.meaning_pinyin ? `Pinyin: ${found.meaning_pinyin}` : "",
        `Example: ${found.example}`,
        `Translation: ${found.translation}`,
        found.synonyms?.length ? `Synonyms: ${found.synonyms.join(", ")}` : "",
        found.collocations?.length ? `Collocations: ${found.collocations.join(", ")}` : "",
      ].filter(Boolean).join("\n"),
    };
  }

  if (lower === "quiz" || lower === "/quiz") {
    const words = getWords();
    if (words.length === 0) {
      return { reply: "Add some words first, then try quiz.", mutated: false };
    }
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const quiz = await generateQuizForWord(randomWord);
    pendingQuiz = {
      word: randomWord.word,
      question: quiz.question,
      options: quiz.options,
      answer: quiz.answer,
    };
    const optionsText = quiz.options
      .map((opt, idx) => `${String.fromCharCode(65 + idx)}) ${opt}`)
      .join("\n");
    return {
      mutated: false,
      quiz: pendingQuiz,
      reply: `Quiz — ${randomWord.word}\n\n${quiz.question}\n\n${optionsText}\n\nReply with A, B, C, or D.`,
    };
  }

  if (lower.startsWith("add ") || lower.startsWith("/add ")) {
    const wordToSearch = input.replace(/^\/?add\s+/i, "").trim();
    if (!wordToSearch) return { reply: "Usage: add <word>", mutated: false };
    const started = Date.now();
    const agentResult = await searchAndEnrichWord(wordToSearch);
    recordAgentRun(wordToSearch, agentResult.logs || [], !!agentResult.success, Date.now() - started);
    if (agentResult.success && agentResult.wordData) {
      addWord(agentResult.wordData);
      const w = agentResult.wordData;
      return {
        mutated: true,
        reply: [
          `Saved “${w.word}” ${w.phonetic || ""}`,
          `${w.part_of_speech} — ${w.meaning}`,
          `Example: ${w.example}`,
          `Translation: ${w.translation}`,
          w.source_name ? `Source: ${w.source_name}` : "",
        ].filter(Boolean).join("\n"),
      };
    }
    return { reply: `Could not look up “${wordToSearch}”.`, mutated: false };
  }

  try {
    const tutor = await getAITutorReply(sessionHistory.slice(-8), input, undefined, "general");
    sessionHistory.push({ sender: "user", text: input });
    sessionHistory.push({ sender: "bot", text: tutor.reply });
    if (sessionHistory.length > 20) sessionHistory.splice(0, sessionHistory.length - 20);
    const extra = tutor.actionsExecuted?.length
      ? "\n\n" + tutor.actionsExecuted.map((a) => `• ${a.details}`).join("\n")
      : "";
    return { reply: tutor.reply + extra, mutated: (tutor.actionsExecuted?.length || 0) > 0 };
  } catch (err: any) {
    return {
      mutated: false,
      reply: `Could not run that command. Try help. ${err.message || ""}`.trim(),
    };
  }
}
