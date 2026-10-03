import React, { useState, useEffect } from "react";
import { Sparkles, CheckCircle2, XCircle, Brain, RefreshCw, AlertCircle, ChevronRight, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

interface QuizTabProps {
  onRefreshWords: () => Promise<void>;
}

function optionMatchesAnswer(option: string, answer: string): boolean {
  const o = option.trim().toLowerCase();
  const a = (answer || "").trim().toLowerCase();
  if (!o || !a) return false;
  return o === a || a.includes(o) || o.includes(a);
}

export default function QuizTab({ onRefreshWords }: QuizTabProps) {
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<QuizQuestion | null>(null);
  const [targetWord, setTargetWord] = useState("");
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [errorText, setErrorText] = useState("");

  const fetchQuizQuestion = async () => {
    setLoading(true);
    setErrorText("");
    setSelectedOpt(null);
    setHasAnswered(false);
    setQuiz(null);

    try {
      const res = await fetch("/api/vocabulary/quiz");
      const data = await res.json();
      if (data.success && data.quiz && Array.isArray(data.quiz.options)) {
        setQuiz(data.quiz);
        setTargetWord(data.target_word);
      } else {
        setErrorText(data.error || "Could not fetch quiz questions.");
      }
    } catch (err: any) {
      setErrorText("Failed to retrieve quiz question. Ensure there are words in your database!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizQuestion();
  }, []);

  const handleSelectOption = (option: string) => {
    if (hasAnswered) return;
    setSelectedOpt(option);
    setHasAnswered(true);

    const isCorrect = optionMatchesAnswer(option, quiz?.answer || "");
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    // Optionally register quiz progress as a review transaction
    if (targetWord && quiz) {
      // 1. Submit review progress
      fetch("/api/vocabulary/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: targetWord, isCorrect })
      }).then(() => onRefreshWords());

      // 2. Submit quiz result logs
      fetch("/api/vocabulary/quiz/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: targetWord,
          question: quiz.question,
          selectedOption: option,
          correctOption: quiz.answer,
          isCorrect
        })
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col space-y-6" id="quiz-workspace-container">
      {/* Session stats board */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 p-5 shadow-sm flex items-center justify-between transition-colors">
        <div className="flex items-center space-x-2.5">
          <Brain className="h-5 w-5 text-neutral-600 dark:text-neutral-400 animate-pulse" />
          <h2 className="font-bold text-base text-neutral-800 dark:text-neutral-250">Dynamic AI Tutor Quiz</h2>
        </div>

        <div className="flex items-center space-x-3 text-sm">
          <span className="text-neutral-400 dark:text-neutral-500 font-medium font-mono">Accuracy: {score.total > 0 ? `${Math.round((score.correct / score.total) * 100)}%` : "0%"}</span>
          <div className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs px-3 py-1.5 rounded-full font-mono shadow-inner transition-colors">
            Score: {score.correct} / {score.total}
          </div>
        </div>
      </div>

      {/* Main interactive stage */}
      <div className="bg-white dark:bg-neutral-900 rounded-3.5xl border border-neutral-100 dark:border-neutral-800 p-6 md:p-8 shadow-sm relative overflow-hidden min-h-[350px] flex flex-col justify-between transition-colors">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading-stage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center py-12 space-y-4"
            >
              <div className="h-10 w-10 border-4 border-neutral-100 dark:border-neutral-800 border-t-neutral-800 dark:border-t-white rounded-full animate-spin" />
              <p className="text-sm text-neutral-455 dark:text-neutral-400 font-medium">Assembling Tutor Question...</p>
            </motion.div>
          ) : errorText ? (
            <motion.div
              key="error-stage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center py-12 text-center space-y-3"
            >
              <AlertCircle className="h-10 w-10 text-rose-500 stroke-[1.5]" />
              <h3 className="font-bold text-neutral-800 dark:text-white text-base">Tutor Engine Suspended</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm leading-relaxed">
                {errorText}
              </p>
              <button
                id="quiz-error-retry-btn"
                onClick={fetchQuizQuestion}
                className="mt-2 px-4 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950 rounded-xl text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-255 transition-colors shadow flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" /> Retry Generation
              </button>
            </motion.div>
          ) : quiz ? (
            <motion.div
              key="quiz-stage"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6 flex-1 flex flex-col justify-between"
            >
              {/* Question card prompt */}
              <div className="space-y-4">
                <div className="flex items-center space-x-1.5 text-neutral-400 dark:text-neutral-500">
                  <HelpCircle className="h-4 w-4" />
                  <span className="text-xs uppercase font-bold tracking-wider font-mono">Multiple Choice Challenge</span>
                </div>
                
                <h3 className="text-lg md:text-xl font-bold font-serif leading-relaxed text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-4">
                  {quiz.question}
                </h3>
              </div>

              {/* Options selectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {quiz.options.map((opt, idx) => {
                  const isSelected = selectedOpt === opt;
                  const isCorrectAnswer = optionMatchesAnswer(opt, quiz.answer);
                  
                  let optStyle = "border-neutral-200/80 dark:border-white/20 hover:border-neutral-350 dark:hover:border-white/40 hover:bg-neutral-50 dark:hover:bg-neutral-850/40 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200";
                  let badge = null;

                  if (hasAnswered) {
                    if (isCorrectAnswer) {
                      optStyle = "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-100/50 dark:ring-emerald-900/40";
                      badge = <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 ml-auto" />;
                    } else if (isSelected) {
                      optStyle = "border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-955/40 text-rose-800 dark:text-rose-300 ring-2 ring-rose-100/50 dark:ring-rose-900/40";
                      badge = <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 ml-auto" />;
                    } else {
                      optStyle = "border-neutral-200/40 dark:border-white/10 opacity-45 bg-white dark:bg-neutral-900 text-neutral-400 dark:text-neutral-550";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      id={`quiz-option-${idx}`}
                      onClick={() => handleSelectOption(opt)}
                      disabled={hasAnswered}
                      className={`p-4 rounded-2xl border text-left font-semibold text-sm transition-all shadow-2xs hover:shadow-xs flex items-center space-x-3 select-none disabled:cursor-default ${optStyle}`}
                    >
                      <span className="h-5 w-5 rounded-full bg-neutral-105 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 inline-flex items-center justify-center font-mono text-[11px] font-bold text-neutral-405 dark:text-neutral-400 shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1 min-w-0 break-words">{opt}</span>
                      {badge}
                    </button>
                  );
                })}
              </div>

              {/* Advanced Explanation by Tutor Agent */}
              <AnimatePresence>
                {hasAnswered && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-6 bg-neutral-55 dark:bg-neutral-955 rounded-2xl p-4 border border-neutral-100 dark:border-neutral-850 space-y-2 overflow-hidden"
                  >
                    <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-450 uppercase tracking-widest flex items-center gap-1 font-mono">
                      <Sparkles className="h-3 w-3 animate-pulse text-amber-500" /> AI Tutor Explanation / 语法解析
                    </span>
                    <p className="text-xs text-neutral-600 dark:text-neutral-350 leading-relaxed font-medium">
                      {quiz.explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Progress Navigation Button */}
              {hasAnswered && (
                <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 mt-4 flex justify-end">
                  <button
                    id="quiz-next-btn"
                    onClick={fetchQuizQuestion}
                    className="px-5 py-3 bg-neutral-900 dark:bg-neutral-100 border border-transparent text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-xl font-bold text-sm transition-all shadow shadow-neutral-200 dark:shadow-none flex items-center space-x-2 cursor-pointer"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-neutral-450 dark:text-neutral-400">
              <Brain className="h-10 w-10 text-neutral-300 dark:text-neutral-700 stroke-[1.2] mb-2" />
              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Tutor Deck Completed</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
