import React, { useState, useEffect, useRef } from "react";
import { Award, Shield, User, Bot, Swords, ArrowRight, Play, RefreshCw, AlertCircle, HelpCircle } from "lucide-react";
import { VocabularyWord } from "../types";

interface WordDuelTabProps {
  words: VocabularyWord[];
}

export default function WordDuelTab({ words }: WordDuelTabProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [botSelection, setBotSelection] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isAnswered, setIsAnswered] = useState(false);
  const answeredRef = useRef(false);

  // Pool for current battle
  const [duelPool, setDuelPool] = useState<{
    word: VocabularyWord;
    options: string[];
    correct: string;
    question: string;
  }[]>([]);

  // Timer loop
  useEffect(() => {
    if (!isPlaying || isAnswered || completed) return;

    if (timeLeft <= 0) {
      handleAnswerSelect("");
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isPlaying, timeLeft, isAnswered, completed, currentRound, duelPool]);

  const initGame = () => {
    if (!words || words.length < 3) {
      alert("You need at least 3 vocabulary words in your deck to stand up the Word Duel Arena!");
      return;
    }

    // Prepare 3-5 rounds using random words
    const shuffledWords = [...words].sort(() => Math.random() - 0.5);
    const selectedRounds = shuffledWords.slice(0, Math.min(5, shuffledWords.length));

    const prepared = selectedRounds.map((targetWord) => {
      // Pick distractors from full dictionary or mock words
      const dist = [...words]
        .filter((w) => w.word !== targetWord.word)
        .map((w) => w.meaning)
        .slice(0, 3);

      while (dist.length < 3) {
        dist.push("A critical/unidentified placeholder action", "System evaluation parameter", "Linguistic parsing parameter");
      }

      const choices = [targetWord.meaning, ...dist].sort(() => Math.random() - 0.5);

      return {
        word: targetWord,
        options: choices,
        correct: targetWord.meaning,
        question: `What is the accurate Chinese translation/meaning of the word "${targetWord.word}"?`
      };
    });

    setDuelPool(prepared);
    setCurrentRound(0);
    setPlayerScore(0);
    setBotScore(0);
    setSelectedOption(null);
    setBotSelection(null);
    setCompleted(false);
    setTimeLeft(15);
    setIsAnswered(false);
    answeredRef.current = false;
    setIsPlaying(true);
  };

  const handleAnswerSelect = (option: string) => {
    if (answeredRef.current || isAnswered) return;
    const activeRound = duelPool[currentRound];
    if (!activeRound) return;
    answeredRef.current = true;
    setIsAnswered(true);
    setSelectedOption(option);

    const botCorrectChance = Math.random() < 0.8;
    let botChoice = activeRound.correct;
    if (!botCorrectChance) {
      const wrongChoices = activeRound.options.filter(o => o !== activeRound.correct);
      botChoice = wrongChoices[Math.floor(Math.random() * wrongChoices.length)] || wrongChoices[0];
    }
    setBotSelection(botChoice);

    if (option === activeRound.correct) {
      const pPoints = 100 + (timeLeft * 8);
      setPlayerScore(prev => prev + pPoints);
    }

    if (botChoice === activeRound.correct) {
      const bPoints = 100 + (Math.floor(Math.random() * 12) * 8);
      setBotScore(prev => prev + bPoints);
    }
  };

  const handleNextRound = () => {
    if (currentRound + 1 >= duelPool.length) {
      setCompleted(true);
    } else {
      setCurrentRound(prev => prev + 1);
      setSelectedOption(null);
      setBotSelection(null);
      setTimeLeft(15);
      setIsAnswered(false);
      answeredRef.current = false;
    }
  };

  return (
    <div className="space-y-8" id="word-duel-pane">
      {/* Game arena header */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800/85 p-6 sm:p-8 rounded-[2rem] shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold font-mono tracking-wider bg-rose-50 dark:bg-rose-950/25 text-rose-505 dark:text-rose-400 rounded-full border border-rose-150/40">
            <Swords className="h-3.5 w-3.5" /> COMPETITIVE ARENA
          </div>

          <h2 className="text-2xl font-black tracking-tight text-neutral-950 dark:text-white leading-none">
            Lexical Duel Arena
          </h2>

          <p className="text-xs sm:text-sm text-neutral-550 max-w-xl">
            Test your vocabulary speed and accuracy against Dr. LexiFlow! Faster answers earn higher retention multipliers.
          </p>
        </div>

        {!isPlaying && (
          <button
            onClick={initGame}
            className="shrink-0 px-6 py-3 bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 transition-all font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Play className="h-4.5 w-4.5 shrink-0" />
            <span>Enter Duel Arena</span>
          </button>
        )}
      </div>

      {/* Duel workspace */}
      {isPlaying && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Active stats column */}
          <div className="md:col-span-1 space-y-6">
            
            {/* Real scoreboard */}
            <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-805 rounded-[1.5rem] space-y-4">
              <span className="text-[10px] font-mono font-black text-neutral-400 uppercase tracking-widest block">Scoreboard</span>
              
              {/* Contenders comparison block */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between font-mono bg-neutral-50 dark:bg-neutral-955 p-3 rounded-xl border border-neutral-150 dark:border-neutral-850">
                  <div className="flex items-center gap-2.5">
                    <User className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-bold dark:text-neutral-200">You (Student)</span>
                  </div>
                  <span className="text-sm font-black text-emerald-500">{playerScore} pts</span>
                </div>

                <div className="flex items-center justify-between font-mono bg-neutral-50 dark:bg-neutral-955 p-3 rounded-xl border border-neutral-150 dark:border-neutral-850">
                  <div className="flex items-center gap-2.5">
                    <Bot className="h-4 w-4 text-rose-500" />
                    <span className="text-xs font-bold dark:text-neutral-200">Dr. LexiFlow</span>
                  </div>
                  <span className="text-sm font-black text-rose-500">{botScore} pts</span>
                </div>
              </div>
            </div>

            {/* Timer visual block */}
            <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-805 rounded-[1.5rem] text-center space-y-3">
              <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase">ROUND TIME REMAINING</span>
              <div className={`text-4xl font-black font-mono leading-none ${timeLeft <= 5 ? "text-rose-500 animate-pulse" : "text-neutral-900 dark:text-white"}`}>
                00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
              </div>
              <div className="h-1.5 bg-neutral-150 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${timeLeft <= 5 ? "bg-rose-500" : "bg-neutral-950 dark:bg-white"}`}
                  style={{ width: `${(timeLeft / 15) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Core quiz workspace */}
          <div className="md:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-155 dark:border-neutral-800 rounded-[2rem] p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            
            {!completed ? (
              <div className="space-y-6">
                
                {/* Round indicator block */}
                <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800/80 pb-3">
                  <span className="text-[10px] font-mono font-bold text-rose-500 uppercase">ROUND {currentRound + 1} OF {duelPool.length}</span>
                  <div className="text-[11px] font-mono text-neutral-450">Target: <strong className="text-neutral-800 dark:text-neutral-200 uppercase">{duelPool[currentRound]?.word.word}</strong></div>
                </div>

                {/* Question */}
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white leading-snug">
                  {duelPool[currentRound]?.question}
                </h3>

                {/* Multiple choice selections */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {duelPool[currentRound]?.options.map((option, idx) => {
                    const isCorrectOption = option === duelPool[currentRound].correct;
                    const isUserChoice = option === selectedOption;
                    const isBotChoice = option === botSelection;

                    let btnStyle = "bg-neutral-50 dark:bg-neutral-955 border-neutral-200 dark:border-neutral-850 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100/60 dark:hover:bg-neutral-800";
                    if (isAnswered) {
                      if (isCorrectOption) {
                        btnStyle = "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-extrabold";
                      } else if (isUserChoice) {
                        btnStyle = "bg-rose-50 dark:bg-rose-950/20 border-rose-500 text-rose-600 dark:text-rose-400 font-extrabold";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswerSelect(option)}
                        disabled={isAnswered}
                        className={`p-4 rounded-2xl border text-left text-xs transition-colors relative flex flex-col justify-between cursor-pointer ${btnStyle}`}
                      >
                        <span className="font-medium leading-snug">{option}</span>

                        {/* Badges indicating choices */}
                        <div className="flex gap-1.5 mt-2">
                          {isAnswered && isUserChoice && (
                            <span className="px-2 py-0.5 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-[9px] font-black uppercase rounded">
                              Your Choice
                            </span>
                          )}
                          {isAnswered && isBotChoice && (
                            <span className="px-2 py-0.5 bg-rose-500 text-white text-[9px] font-black uppercase rounded">
                              AI Bot choice
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Action button feedback */}
                {isAnswered && (
                  <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center bg-neutral-55 dark:bg-neutral-955 p-4 rounded-2xl border border-neutral-150 dark:border-neutral-850">
                    <div className="text-xs space-y-0.5 font-medium leading-relaxed max-w-md">
                      <strong className="text-emerald-500 uppercase text-[10px] tracking-wide block">Explanation</strong>
                      <p className="text-neutral-500 font-sans">{duelPool[currentRound].word.example}</p>
                      <p className="text-[11px] text-neutral-400 font-sans italic">Translation: {duelPool[currentRound].word.translation}</p>
                    </div>

                    <button
                      onClick={handleNextRound}
                      className="px-4 py-2 border border-neutral-950 dark:border-white bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-bold rounded-xl text-xs flex items-center gap-1.5 hover:opacity-90 cursor-pointer"
                    >
                      <span>Continue</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Duels complete / result summary
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto">
                <div className={`p-4 rounded-full border ${playerScore >= botScore ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-505 border-emerald-200" : "bg-rose-50 dark:bg-rose-950/20 text-rose-505 border-rose-200"}`}>
                  <Shield className="h-10 w-10 stroke-[1.2]" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black font-mono">
                    {playerScore >= botScore ? "🏆 YOU WON THE DUEL!" : "💀 YOU LOST THE DUEL!"}
                  </h3>
                  <p className="text-xs text-neutral-500 leading-relaxed font-sans">
                    {playerScore >= botScore 
                      ? "Incredible speed! You outperformed the linguistics solver with your superior recall retention."
                      : "The AI solver was slightly faster this time. Return to the Review Deck and study vocabulary context before engaging again."}
                  </p>
                </div>

                {/* Metric comparisons */}
                <div className="flex gap-6 text-xs font-mono py-1">
                  <div className="text-center">
                    <span className="text-neutral-400 block pb-1 text-[10px] uppercase font-bold">Your Score</span>
                    <strong className="text-emerald-500 text-lg leading-none">{playerScore}</strong>
                  </div>
                  <div className="text-neutral-200 block text-lg self-end pb-1 font-sans">vs</div>
                  <div className="text-center">
                    <span className="text-neutral-400 block pb-1 text-[10px] uppercase font-bold">Bot Score</span>
                    <strong className="text-rose-500 text-lg leading-none">{botScore}</strong>
                  </div>
                </div>

                <button
                  onClick={initGame}
                  className="px-6 py-2.5 border border-neutral-950 dark:border-white bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 transition-all font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Play Again</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Guest/Bypass guide when list empty */}
      {!isPlaying && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-6 rounded-[1.5rem] flex items-start gap-3.5 max-w-xl mx-auto">
          <HelpCircle className="h-5 w-5 text-neutral-400 shrink-0 mt-0.5" />
          <div className="text-xs text-neutral-500 space-y-1">
            <strong className="font-bold text-neutral-800 dark:text-neutral-200">How to play Lexical Duel</strong>
            <p className="leading-relaxed">
              When entering the battle, we load 3 to 5 targeted words from your active database deck. Each round is a race against an absolute linguistic computer opponent. Accuracy and elapsed time are computed dynamically to scale points. Ensure you possess at least 3 vocabulary words in your list first!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
