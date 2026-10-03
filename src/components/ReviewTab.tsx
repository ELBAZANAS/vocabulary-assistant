import React, { useEffect, useMemo, useRef, useState } from "react";
import { VocabularyWord } from "../types";
import { CheckCircle, XCircle, RefreshCw, Award, Layers, Flame } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { isDueForReview, sortReviewQueue } from "../lib/srs";

interface ReviewTabProps {
  words: VocabularyWord[];
  onReviewSubmit: (word: string, isCorrect: boolean) => Promise<void>;
}

export default function ReviewTab({ words, onReviewSubmit }: ReviewTabProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [includeLater, setIncludeLater] = useState(false);
  const [sessionReviewed, setSessionReviewed] = useState<{ word: string; isCorrect: boolean }[]>([]);
  const [queueWords, setQueueWords] = useState<VocabularyWord[]>([]);
  const reviewingRef = useRef(false);

  const dueWords = useMemo(() => words.filter((w) => isDueForReview(w)), [words]);

  useEffect(() => {
    if (sessionReviewed.length === 0 && currentIdx === 0) {
      setQueueWords(sortReviewQueue(includeLater ? words : dueWords));
    }
  }, [words, dueWords, includeLater, sessionReviewed.length, currentIdx]);

  const reviewQueue = queueWords;
  const activeCard = reviewQueue[currentIdx];

  const handleReview = async (isCorrect: boolean) => {
    if (!activeCard || reviewingRef.current) return;
    reviewingRef.current = true;
    setIsFlipped(false);
    try {
      await onReviewSubmit(activeCard.word, isCorrect);
      setSessionReviewed((prev) => [...prev, { word: activeCard.word, isCorrect }]);
      setCurrentIdx((prev) => prev + 1);
    } finally {
      reviewingRef.current = false;
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        setIsFlipped((v) => !v);
        return;
      }
      if (!isFlipped) return;
      if (e.key === "1") void handleReview(false);
      if (e.key === "2") void handleReview(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFlipped, activeCard]);

  const resetSession = () => {
    setCurrentIdx(0);
    setIsFlipped(false);
    setSessionReviewed([]);
    setQueueWords(sortReviewQueue(includeLater ? words : dueWords));
  };

  // Helper stats
  const totalReviewedWordsCount = words.filter((w) => w.review_count > 0).length;
  const averageProficiency = words.length > 0 ? (words.reduce((acc, w) => acc + w.proficiency, 0) / words.length).toFixed(1) : "0.0";
  const streakCount = Math.max(0, sessionReviewed.filter(s => s.isCorrect).length);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="review-workspace-container">
      {/* Left panel: Stats & Progress overview */}
      <div className="lg:col-span-4 flex flex-col space-y-6 min-w-0">
        <div className="min-w-0 overflow-hidden bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 p-6 shadow-sm space-y-5 transition-colors">
          <div className="flex items-start gap-2 text-neutral-800 dark:text-neutral-200 min-w-0">
            <Layers className="h-5 w-5 shrink-0 mt-0.5 text-neutral-600 dark:text-neutral-400" />
            <h2 className="min-w-0 font-bold text-lg tracking-tight leading-snug break-words">Review Spaced Repetition</h2>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="min-w-[8.5rem] flex-1 bg-neutral-50 dark:bg-neutral-950 p-3 rounded-2xl border border-neutral-105 dark:border-neutral-800 text-center">
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block font-medium uppercase tracking-wide mb-1 break-words">Studied cards</span>
              <span className="text-xl font-bold text-neutral-800 dark:text-white break-words">{totalReviewedWordsCount}/{words.length}</span>
            </div>

            <div className="min-w-[8.5rem] flex-1 bg-neutral-50 dark:bg-neutral-950 p-3 rounded-2xl border border-neutral-105 dark:border-neutral-800 text-center">
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block font-medium uppercase tracking-wide mb-1 break-words">Avg mastery</span>
              <span className="text-xl font-bold text-neutral-800 dark:text-white break-words">{averageProficiency}/5.0</span>
            </div>
          </div>

          <label className="flex items-start gap-2 text-xs text-neutral-600 dark:text-neutral-400 min-w-0">
            <input
              type="checkbox"
              className="mt-0.5 shrink-0"
              checked={includeLater}
              onChange={(e) => {
                setIncludeLater(e.target.checked);
                setCurrentIdx(0);
                setIsFlipped(false);
                setSessionReviewed([]);
              }}
            />
            <span className="min-w-0 break-words">Include cards not due yet ({words.length - dueWords.length} scheduled later)</span>
          </label>

          <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 flex flex-wrap items-center justify-between gap-3 min-w-0">
            <span className="text-sm text-neutral-600 dark:text-neutral-300 font-medium min-w-0 break-words">Session streak</span>
            <div className="inline-flex max-w-full items-center gap-1.5 text-amber-700 dark:text-amber-300 font-bold bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3 py-1 rounded-full text-sm">
              <Flame className="h-4 w-4 shrink-0 fill-amber-500" />
              <span>{streakCount} correct</span>
            </div>
          </div>
        </div>

        {/* Learning History Logs */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 p-6 shadow-sm flex-1 min-h-[250px] max-h-[350px] overflow-y-auto transition-colors">
          <h3 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-4">
            Session History ({sessionReviewed.length} logged)
          </h3>
          <div className="space-y-3">
            {sessionReviewed.length > 0 ? (
              sessionReviewed.map((log, index) => (
                <div key={index} className="flex items-center justify-between p-2.5 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-100 dark:border-neutral-850">
                  <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{log.word}</span>
                  <div className="flex items-center space-x-1.5">
                    {log.isCorrect ? (
                      <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 font-semibold text-[11px] px-2.5 py-0.5 rounded-full inline-flex items-center border border-emerald-200/50 dark:border-emerald-900/40">
                        Correct
                      </span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400 bg-rose-105 dark:bg-rose-955/60 font-semibold text-[11px] px-2.5 py-0.5 rounded-full inline-flex items-center border border-rose-200/50 dark:border-rose-900/40">
                        Needs Practice
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-neutral-405 dark:text-neutral-500 text-sm italic">
                Logs will render as you complete and rate flashcards.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right panel: Main Flashcard Deck */}
      <div className="lg:col-span-8 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {activeCard && currentIdx < reviewQueue.length ? (
            <motion.div
              key={activeCard.word}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              className="w-full flex flex-col items-center space-y-6"
            >
              {/* Card stage */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                id="review-flashcard"
                className={`w-full max-w-lg min-h-[350px] rounded-3xl p-8 border cursor-pointer select-none shadow-sm transition-all duration-350 flex flex-col justify-between relative hover:border-neutral-300 dark:hover:border-neutral-700 ${
                  isFlipped
                    ? "border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 shadow-md"
                    : "border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                }`}
              >
                {/* Progress Indicators */}
                <div className="flex items-center justify-between border-b border-dashed pb-4 shrink-0 border-neutral-200 dark:border-neutral-800">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 dark:text-neutral-500">
                    Card {currentIdx + 1} of {reviewQueue.length}
                  </span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${isFlipped ? "bg-neutral-200 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"}`}>
                    Tap Card to Flip
                  </span>
                </div>

                {/* Card Center Content */}
                <div className="flex-1 flex flex-col items-center justify-center py-6 text-center text-ellipsis">
                  {!isFlipped ? (
                    <div className="space-y-3">
                      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                        {activeCard.word}
                      </h1>
                      <div className="text-sm px-2.5 py-0.5 inline-block bg-neutral-100 dark:bg-neutral-800 rounded text-neutral-500 dark:text-neutral-450 font-mono">
                        {activeCard.part_of_speech}
                      </div>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4 text-left w-full"
                    >
                      <div>
                        <div className="flex items-baseline space-x-2">
                          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">{activeCard.word}</h2>
                          <span className="text-xs text-neutral-400 dark:text-neutral-500 font-mono">{activeCard.phonetic}</span>
                        </div>
                        <p className="text-base text-neutral-700 dark:text-neutral-350 font-semibold mt-1">{activeCard.meaning}</p>
                        {activeCard.meaning_pinyin && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-450 font-mono mt-0.5">🗣️ {activeCard.meaning_pinyin}</p>
                        )}
                      </div>

                      <div className="border-t border-neutral-200 dark:border-neutral-800 pt-3 space-y-2">
                        <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">Authentic News Example</span>
                        <p className="text-sm font-serif italic leading-relaxed text-neutral-800 dark:text-neutral-250">
                          "{activeCard.example}"
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-405 font-medium leading-relaxed pb-0.5">
                          🇨🇳 {activeCard.translation}
                        </p>
                        {activeCard.translation_pinyin && (
                          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-mono leading-relaxed italic">
                            🗣️ {activeCard.translation_pinyin}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 border-t border-neutral-200 dark:border-neutral-800 pt-3 text-xs text-neutral-450 dark:text-neutral-550">
                        <span>Source: <strong className="text-neutral-600 dark:text-neutral-350">{activeCard.source_name}</strong></span>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Card Footer Status */}
                <div className="text-center font-semibold text-xs py-2 border-t border-neutral-100 dark:border-neutral-800/80 shrink-0 border-neutral-200 dark:border-neutral-800">
                  {!isFlipped ? (
                    <span className="text-neutral-400 dark:text-neutral-500">Remember what this means? Tap to flip.</span>
                  ) : (
                    <span className="text-neutral-500 dark:text-neutral-400">Rate your recollection below.</span>
                  )}
                </div>
              </div>

              {/* Assessment Buttons */}
              <div className="flex items-center justify-center space-x-4 w-full max-w-sm">
                <button
                  id="review-incorrect-btn"
                  onClick={() => handleReview(false)}
                  className="flex-1 py-3 bg-white dark:bg-neutral-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-neutral-200 dark:border-neutral-800 hover:border-rose-100 dark:hover:border-rose-900/40 rounded-xl font-bold text-sm transition-all shadow-2xs hover:shadow flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Hard (1)</span>
                </button>

                <button
                  id="review-correct-btn"
                  onClick={() => handleReview(true)}
                  className="flex-1 py-3 bg-neutral-900 dark:bg-neutral-100 border border-transparent text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <CheckCircle className="h-4 w-4 text-emerald-400 dark:text-emerald-600" />
                  <span>Easy (2)</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm w-full max-w-lg min-h-[350px]">
              <Award className="h-14 w-14 text-emerald-500 stroke-[1.5]" />
              <h3 className="font-extrabold text-xl text-neutral-900 dark:text-white">Deck Cleared Successfully!</h3>
              <p className="text-sm text-neutral-550 dark:text-neutral-400 leading-relaxed max-w-sm">
                You've completed all Spaced Repetition review tasks in your queue for this study session. All stats have been registered safely in the DB.
              </p>
              
              <button
                id="reset-session-btn"
                onClick={resetSession}
                className="px-5 py-2.5 bg-neutral-950 dark:bg-neutral-100 hover:bg-neutral-850 dark:hover:bg-neutral-200 text-white dark:text-neutral-950 rounded-xl font-semibold text-xs tracking-wider transition-all shadow-sm cursor-pointer inline-flex items-center space-x-2"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Repeat Session Deck</span>
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
