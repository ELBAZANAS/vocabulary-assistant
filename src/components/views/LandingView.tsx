import React from "react";
import { ArrowRight, Cpu, Database, UserCheck } from "lucide-react";

interface LandingViewProps {
  studentName: string;
  studentId: string;
  loginMessage: string;
  wordCount: number;
  onNameChange: (value: string) => void;
  onIdChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onGuest: () => void;
}

export default function LandingView({
  studentName,
  studentId,
  loginMessage,
  wordCount,
  onNameChange,
  onIdChange,
  onSubmit,
  onGuest,
}: LandingViewProps) {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800/80 p-8 rounded-[2rem] space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold font-mono tracking-wider bg-neutral-105 dark:bg-neutral-850 text-neutral-700 dark:text-neutral-300 rounded-full">
          <Cpu className="h-3.5 w-3.5" /> LEARNING WORKSPACE
        </div>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-950 dark:text-white">
          Build a vocabulary deck from real English
        </h2>
        <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 font-medium max-w-3xl leading-relaxed">
          Search a word, save a news-grounded example with Chinese meaning and pinyin, then review it with spaced repetition, quizzes, stories, and an AI tutor.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <div className="text-xs">
            <strong className="block text-neutral-900 dark:text-neutral-200 font-bold mb-1">Grounded examples</strong>
            <span className="text-neutral-500">Look up words with Gemini (or Qwen/Groq) and keep a source sentence you can actually study.</span>
          </div>
          <div className="text-xs">
            <strong className="block text-neutral-900 dark:text-neutral-200 font-bold mb-1">Spaced repetition</strong>
            <span className="text-neutral-500">Hard cards come back sooner. Easy cards wait longer. Keyboard: space to flip, 1 hard, 2 easy.</span>
          </div>
          <div className="text-xs">
            <strong className="block text-neutral-900 dark:text-neutral-200 font-bold mb-1">Practice modes</strong>
            <span className="text-neutral-500">Quiz, tutor chat, story forge, and a local JSON deck that survives a refresh.</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800/80 p-6 sm:p-8 rounded-[2rem] space-y-6">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-neutral-600" />
              Your profile
            </h3>
            <p className="text-xs text-neutral-450 dark:text-neutral-500 mt-1">
              Optional. Saved in this browser so the header can greet you. Not an account system.
            </p>
          </div>

          {loginMessage && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 text-rose-600 text-xs rounded-xl">
              {loginMessage}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="student-name-input" className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-450 block px-1">Name</label>
              <input
                id="student-name-input"
                type="text"
                placeholder="Your name"
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:text-white"
                value={studentName}
                onChange={(e) => onNameChange(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="student-id-input" className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-450 block px-1">ID (optional)</label>
              <input
                id="student-id-input"
                type="text"
                placeholder="Class or student ID"
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:text-white"
                value={studentId}
                onChange={(e) => onIdChange(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-bold rounded-xl hover:bg-neutral-800 flex items-center justify-center gap-2 text-sm"
            >
              <span>Continue to dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <button
            type="button"
            onClick={onGuest}
            className="w-full text-xs text-neutral-450 hover:text-neutral-700 underline font-bold"
          >
            Skip and start learning
          </button>
        </div>

        <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 rounded-[2rem] text-xs space-y-6 text-neutral-600 dark:text-neutral-400 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-[10px] tracking-widest text-neutral-500 dark:text-neutral-400 font-mono uppercase block">Suggested path</span>
            <div className="space-y-3.5 leading-relaxed">
              <p className="text-neutral-900 dark:text-white font-extrabold text-sm border-b border-neutral-200 dark:border-neutral-800 pb-2">How to use LexiFlow</p>
              <p>1. Add a word from <strong className="text-neutral-900 dark:text-white">Add words</strong>.</p>
              <p>2. Study it in <strong className="text-neutral-900 dark:text-white">Flashcards</strong>.</p>
              <p>3. Check recall with <strong className="text-neutral-900 dark:text-white">Quiz</strong>.</p>
              <p>4. Ask the <strong className="text-neutral-900 dark:text-white">AI tutor</strong> for collocations or a sentence.</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-[11px] text-neutral-500 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-800 pt-4 font-mono">
            <Database className="h-4 w-4" />
            <span>{wordCount} words in the local deck</span>
          </div>
        </div>
      </div>
    </div>
  );
}
