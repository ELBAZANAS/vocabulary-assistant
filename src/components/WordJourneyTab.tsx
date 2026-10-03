import React, { useState } from "react";
import { 
  Compass, Gift, Milestone, Star, Award, Sparkles, BookOpen, 
  Layers, CheckCircle2, Trophy, Flame, Zap, Brain, Globe, 
  Target, GraduationCap, X, Calendar, User, ShieldCheck, HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { VocabularyWord, ReviewLog, QuizHistoryItem } from "../types";

interface WordJourneyTabProps {
  words: VocabularyWord[];
  reviewLogs: ReviewLog[];
  quizHistory?: QuizHistoryItem[];
}

export default function WordJourneyTab({ words, reviewLogs, quizHistory = [] }: WordJourneyTabProps) {
  const [selectedBadge, setSelectedBadge] = useState<any | null>(null);

  const wordCount = words.length;
  const reviewCount = reviewLogs.length;
  const quizCount = quizHistory.length;
  const quizCorrect = quizHistory.filter(q => q.is_correct).length;
  const quizAccuracy = quizCount > 0 ? (quizCorrect / quizCount) : 0;

  // Track part of speech counts for polymath check
  const hasNoun = words.some(w => w.part_of_speech.toLowerCase() === "noun");
  const hasVerb = words.some(w => w.part_of_speech.toLowerCase() === "verb");
  const hasAdjective = words.some(w => w.part_of_speech.toLowerCase() === "adjective");

  // Determine current highest proficiency
  const maxProficencyNum = words.length > 0 ? Math.max(...words.map(w => w.proficiency)) : 0;

  const milestones = [
    {
      id: 1,
      title: "Lexical Spark",
      requirementId: "added_first",
      requirement: "Add at least 1 vocabulary word to your deck",
      progressText: `Words Added: ${wordCount} / 1`,
      progressPercent: Math.min(100, (wordCount / 1) * 100),
      description: "You took the very first step in cataloging real literature or articles from international news.",
      unlocked: wordCount >= 1,
      icon: Sparkles,
      color: "bg-indigo-500",
      accent: "text-indigo-500 dark:text-indigo-400",
      category: "Cataloging",
    },
    {
      id: 2,
      title: "Explorer Recruit",
      requirementId: "added_5",
      requirement: "Add 5 vocabulary words",
      progressText: `Words Added: ${wordCount} / 5`,
      progressPercent: Math.min(100, (wordCount / 5) * 100),
      description: "Your personalized dynamic deck is growing with grounded literature citations.",
      unlocked: wordCount >= 5,
      icon: BookOpen,
      color: "bg-emerald-500",
      accent: "text-emerald-500 dark:text-emerald-400",
      category: "Cataloging",
    },
    {
      id: 3,
      title: "Grounded Scholar",
      requirementId: "added_15",
      requirement: "Add 15 vocabulary words",
      progressText: `Words Added: ${wordCount} / 15`,
      progressPercent: Math.min(100, (wordCount / 15) * 100),
      description: "You now possess a rich reference library tracking global news feeds and columns.",
      unlocked: wordCount >= 15,
      icon: Milestone,
      color: "bg-cyan-500",
      accent: "text-cyan-500 dark:text-cyan-400",
      category: "Cataloging",
    },
    {
      id: 4,
      title: "Vocabulary Titan",
      requirementId: "added_30",
      requirement: "Add 30 vocabulary words",
      progressText: `Words Added: ${wordCount} / 30`,
      progressPercent: Math.min(100, (wordCount / 30) * 100),
      description: "You have built a vast repository of high-level academic words for complete literacy.",
      unlocked: wordCount >= 30,
      icon: Trophy,
      color: "bg-amber-500",
      accent: "text-amber-500 dark:text-amber-400",
      category: "Cataloging",
    },
    {
      id: 5,
      title: "Retention Initiated",
      requirementId: "review_5",
      requirement: "Submit 5 spaced repetition reviews",
      progressText: `Reviews Submitted: ${reviewCount} / 5`,
      progressPercent: Math.min(100, (reviewCount / 5) * 100),
      description: "You began testing yourself in memory logs and mapping recall pathways.",
      unlocked: reviewCount >= 5,
      icon: Layers,
      color: "bg-violet-500",
      accent: "text-violet-500 dark:text-violet-400",
      category: "Retention",
    },
    {
      id: 6,
      title: "Memory Architect",
      requirementId: "review_15",
      requirement: "Submit 15 memory reviews",
      progressText: `Reviews Submitted: ${reviewCount} / 15`,
      progressPercent: Math.min(100, (reviewCount / 15) * 100),
      description: "Developed a solid habit of reviewing and reinforcing your memory pathways.",
      unlocked: reviewCount >= 15,
      icon: Flame,
      color: "bg-orange-500",
      accent: "text-orange-500 dark:text-orange-400",
      category: "Retention",
    },
    {
      id: 7,
      title: "Retention Virtuoso",
      requirementId: "review_35",
      requirement: "Submit 35 memory reviews",
      progressText: `Reviews Submitted: ${reviewCount} / 35`,
      progressPercent: Math.min(100, (reviewCount / 35) * 100),
      description: "Exceptional spaced repetition dedication demonstrating high cognitive retention.",
      unlocked: reviewCount >= 35,
      icon: Zap,
      color: "bg-rose-500",
      accent: "text-rose-500 dark:text-rose-400",
      category: "Retention",
    },
    {
      id: 8,
      title: "Cognitive Explorer",
      requirementId: "proficiency_3",
      requirement: "Reach Level 3+ proficiency on 3 cards",
      progressText: `Level 3+ Cards: ${words.filter(w => w.proficiency >= 3).length} / 3`,
      progressPercent: Math.min(100, (words.filter(w => w.proficiency >= 3).length / 3) * 100),
      description: "Strengthened core vocabulary terms into stable medium-term memory banks.",
      unlocked: words.filter(w => w.proficiency >= 3).length >= 3,
      icon: Brain,
      color: "bg-fuchsia-500",
      accent: "text-fuchsia-500 dark:text-fuchsia-400",
      category: "Cognition",
    },
    {
      id: 9,
      title: "Linguistic Paragon",
      requirementId: "proficiency_5",
      requirement: "Reach Level 5 (Absolute Mastery) on any card",
      progressText: `Highest Proficiency: Level ${maxProficencyNum} / 5`,
      progressPercent: Math.min(100, (maxProficencyNum / 5) * 100),
      description: "Unlocked flawless academic recall and verified retrieval rate on a word.",
      unlocked: words.some(w => w.proficiency >= 5),
      icon: Award,
      color: "bg-yellow-500",
      accent: "text-yellow-500 dark:text-yellow-400",
      category: "Cognition",
    },
    {
      id: 10,
      title: "Lexical Polymath",
      requirementId: "parts_of_speech",
      requirement: "Add at least 1 noun, 1 verb, and 1 adjective",
      progressText: `Collected elements: ${[hasNoun, hasVerb, hasAdjective].filter(Boolean).length} / 3`,
      progressPercent: Math.min(100, (([hasNoun, hasVerb, hasAdjective].filter(Boolean).length) / 3) * 100),
      description: "Demonstrated structural comprehension of balanced sentence elements in English.",
      unlocked: hasNoun && hasVerb && hasAdjective,
      icon: Globe,
      color: "bg-teal-500",
      accent: "text-teal-500 dark:text-teal-400",
      category: "Grammar",
    },
    {
      id: 11,
      title: "Tutor Challenger",
      requirementId: "quiz_5",
      requirement: "Answer at least 5 AI Tutor Quiz questions",
      progressText: `Quiz Items: ${quizCount} / 5`,
      progressPercent: Math.min(100, (quizCount / 5) * 100),
      description: "Put your lexical recognition to the test in randomized teacher evaluations.",
      unlocked: quizCount >= 5,
      icon: Target,
      color: "bg-sky-505",
      accent: "text-sky-500 dark:text-sky-400",
      category: "Assessment",
    },
    {
      id: 12,
      title: "Perfect Grounding",
      requirementId: "quiz_perfect",
      requirement: "Complete 5 quiz questions with 80%+ accuracy",
      progressText: `Quiz count: ${quizCount}/5, Accuracy: ${Math.round(quizAccuracy * 100)}%`,
      progressPercent: quizCount < 5 ? (quizCount / 5) * 60 : Math.min(100, quizAccuracy * 100),
      description: "Perfect vocabulary recall. Demonstrated flawless academic classroom correctness!",
      unlocked: quizCount >= 5 && quizAccuracy >= 0.8,
      icon: GraduationCap,
      color: "bg-purple-500",
      accent: "text-purple-500 dark:text-purple-400",
      category: "Assessment",
    }
  ];

  const unlockedCount = milestones.filter(m => m.unlocked).length;
  const progressPercent = Math.round((unlockedCount / milestones.length) * 100);

  // Compute ranks based on milestones unlocked count
  const getRank = () => {
    if (unlockedCount === 12) return "Linguistic Overlord";
    if (unlockedCount >= 9) return "Academic Mentor";
    if (unlockedCount >= 6) return "Advanced Scholar";
    if (unlockedCount >= 3) return "Linguistic Apprentice";
    return "Curious Initiate";
  };

  return (
    <div className="space-y-8" id="word-journey-pane">
      {/* Journey Hero banner */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800/80 p-6 md:p-8 rounded-[2rem] shadow-2xs space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold font-mono tracking-wider bg-neutral-100 dark:bg-neutral-805 text-neutral-700 dark:text-neutral-300 rounded-full border border-neutral-200/30 dark:border-neutral-800/20 uppercase">
          <Compass className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" /> RETENTION & ACCOMPLISHMENTS CORE
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-tight text-neutral-950 dark:text-white leading-none">
              Academic Milestone Journey & Achievements
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-medium max-w-2xl leading-relaxed">
              Achieve lexical mastery, verify real-time knowledge on spaced repetition cards, and unlock academic certificates representing your commitment to English vocabulary excellence.
            </p>
          </div>
          <div className="bg-neutral-50 dark:bg-neutral-950 px-5 py-3 rounded-2xl border border-neutral-200/50 dark:border-neutral-850 flex items-center gap-3 shrink-0">
            <Trophy className="h-8 w-8 text-amber-500 shrink-0" />
            <div>
              <span className="text-[10px] block uppercase font-mono text-neutral-400 tracking-wider">Unlocks</span>
              <span className="text-xl font-extrabold text-neutral-900 dark:text-white font-mono">{unlockedCount} <span className="text-xs text-neutral-450">/ {milestones.length} Badges</span></span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-2 pt-4 border-t border-neutral-150/60 dark:border-neutral-800/80">
          <div className="flex justify-between items-center text-xs">
            <span className="text-neutral-500 dark:text-neutral-400 font-bold block">
              ACADEMIC STANDING RANK: <strong className="text-neutral-900 dark:text-white uppercase tracking-wider font-mono bg-neutral-105 dark:bg-neutral-805 px-2.5 py-1 rounded-md ml-1">{getRank()}</strong>
            </span>
            <span className="font-mono text-neutral-500 font-bold">{progressPercent}% Completed</span>
          </div>
          <div className="h-4 bg-neutral-100 dark:bg-neutral-950 rounded-full overflow-hidden border border-neutral-200/50 dark:border-neutral-850 relative">
            <div 
              className="h-full bg-gradient-to-r from-neutral-950 via-neutral-700 to-neutral-500 dark:from-white dark:via-neutral-300 dark:to-neutral-500 rounded-full transition-all duration-750 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid Categories of Badges */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase text-neutral-400 tracking-wider flex items-center gap-1.5 px-1">
          <Star className="h-4 w-4 text-amber-500 fill-amber-500/10" /> Click on any badge to inspect and claim accomplishment certificates
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {milestones.map((milestone) => {
            const Icon = milestone.icon;
            return (
              <motion.div 
                whileHover={{ y: milestone.unlocked ? -4 : 0 }}
                onClick={() => setSelectedBadge(milestone)}
                key={milestone.id} 
                className={`p-5 rounded-3xl border cursor-pointer select-none text-center flex flex-col justify-between transition-all relative ${
                  milestone.unlocked 
                    ? "bg-white dark:bg-neutral-900 border-neutral-250 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 shadow-sm" 
                    : "bg-neutral-50/50 dark:bg-neutral-955 border-neutral-200/60 dark:border-neutral-855 hover:border-neutral-300 dark:hover:border-neutral-800 opacity-65"
                }`}
              >
                <div className="space-y-4 flex flex-col items-center">
                  <div className="w-full flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2.5 shrink-0">
                    <span className="text-[9px] uppercase font-mono font-bold text-neutral-450 tracking-wider">
                      {milestone.category}
                    </span>
                    <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-md ${milestone.unlocked ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800"}`}>
                      {milestone.unlocked ? "UNLOCKED" : "LOCKED"}
                    </span>
                  </div>

                  {/* Glowing Icon */}
                  <div className={`p-4 rounded-2.5xl text-white ${milestone.unlocked ? milestone.color : "bg-neutral-200 dark:bg-neutral-850 text-neutral-400"} shadow-sm relative transition-all`}>
                    <Icon className="h-6 w-6" />
                    {milestone.unlocked && (
                      <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-neutral-950 flex items-center justify-center" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-neutral-900 dark:text-white leading-tight uppercase font-mono">
                      {milestone.title}
                    </h4>
                    <p className="text-[11px] text-neutral-450 dark:text-neutral-500 leading-snug line-clamp-2">
                      {milestone.description}
                    </p>
                  </div>
                </div>

                <div className="w-full mt-5 pt-3.5 border-t border-neutral-100 dark:border-neutral-800/60 text-left">
                  <span className="text-[9px] font-mono font-bold tracking-wider text-neutral-400 uppercase block mb-1">Target</span>
                  <p className={`text-[10px] font-bold leading-tight truncate ${milestone.unlocked ? "text-emerald-600 dark:text-emerald-400" : "text-neutral-500 dark:text-neutral-450"}`}>
                    {milestone.requirement}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Details visual Inspector Modal / Card */}
      <AnimatePresence>
        {selectedBadge && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-955/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-[2.5rem] max-w-lg w-full p-6 sm:p-8 relative shadow-2xl space-y-6 text-neutral-900 dark:text-neutral-100"
            >
              <button 
                onClick={() => setSelectedBadge(null)}
                className="absolute top-5 right-5 p-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-full transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Certificate header */}
              <div className="text-center space-y-4 pt-4">
                <div className="mx-auto inline-flex p-4 rounded-3xl text-white bg-neutral-950 dark:bg-white dark:text-neutral-950 font-bold shadow-md">
                  {React.createElement(selectedBadge.icon, { className: "h-8 w-8" })}
                </div>
                
                <div className="space-y-1">
                  <span className="text-[10px] font-bold font-mono tracking-widest text-neutral-400 uppercase block">LEXIFLOW ACCOMPLISHMENT DECREE</span>
                  <h3 className="text-2xl font-black tracking-tight text-neutral-950 dark:text-white uppercase font-mono">
                    {selectedBadge.title}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/50 dark:border-neutral-850 rounded-full text-xs text-neutral-600 dark:text-neutral-400">
                    <span className={`h-2 w-2 rounded-full ${selectedBadge.unlocked ? "bg-emerald-500 animate-pulse" : "bg-neutral-300 dark:bg-neutral-700"}`} />
                    <strong>Category:</strong> {selectedBadge.category}
                  </div>
                </div>
              </div>

              {/* Document Certificate body */}
              <div className="border-t border-b border-dashed border-neutral-200 dark:border-neutral-800 py-6 text-center space-y-4">
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 italic leading-relaxed font-serif">
                  "This academic certificate hereby confirms that the candidate has systematically applied computational linguistic and memory strategies to unlock the landmark achievement criteria: {selectedBadge.requirement}."
                </p>

                {selectedBadge.unlocked ? (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 rounded-2xl flex items-center justify-center gap-2.5 max-w-sm mx-auto text-emerald-800 dark:text-emerald-305">
                    <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div className="text-left text-xs">
                      <span className="font-extrabold block">Credential Fully Unlocked!</span>
                      <span className="text-[10px] font-mono leading-none">Registered safely in Local JSON Database.</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 max-w-sm mx-auto">
                    <div className="text-neutral-450 dark:text-neutral-550 text-xs font-mono font-bold flex justify-between">
                      <span>Requirement progress:</span>
                      <span>{selectedBadge.progressText}</span>
                    </div>
                    <div className="h-3 bg-neutral-150 dark:bg-neutral-950 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-800 relative">
                      <div 
                        className={`h-full ${selectedBadge.color} rounded-full transition-all duration-500`}
                        style={{ width: `${selectedBadge.progressPercent}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-neutral-450 bg-neutral-50 dark:bg-neutral-950/45 p-2 rounded-lg border border-neutral-105 dark:border-neutral-855 text-center leading-normal">
                      🔒 Add matching items to your deck, answer quizzes, or run cards under the Review tab to unlock this rank milestone.
                    </p>
                  </div>
                )}
              </div>

              {/* Verified signatories simulated footer strictly styled with humbleness */}
              <div className="flex justify-between items-center text-[10px] font-mono text-neutral-450 dark:text-neutral-500">
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-neutral-400" />
                  <span>Authenticated Candidate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                  <span>Status: Verified online</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Metrics breakdown */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800/80 p-6 rounded-[2rem] shadow-xs space-y-4">
        <h3 className="text-xs font-black uppercase text-neutral-400 tracking-wider">Linguistic metrics & achievement values</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-neutral-500 font-mono">
          <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-2xl border border-neutral-100 dark:border-neutral-850 space-y-1">
            <span className="text-neutral-400 font-bold block text-[10px] uppercase">Grounded Coverage</span>
            <p className="text-neutral-850 dark:text-neutral-300 leading-snug">Added {wordCount} vocabulary items from trusted global newspapers (BBC, Reuters, NYT, Guardian).</p>
          </div>
          <div className="p-4 bg-neutral-50 dark:bg-neutral-955 rounded-2xl border border-neutral-100 dark:border-neutral-850 space-y-1">
            <span className="text-neutral-400 font-bold block text-[10px] uppercase">Spaced Retention Runs</span>
            <p className="text-neutral-850 dark:text-neutral-350 leading-snug">Executed {reviewCount} recall sessions verifying dynamic card alignments.</p>
          </div>
          <div className="p-4 bg-neutral-50 dark:bg-neutral-955 rounded-2xl border border-neutral-100 dark:border-neutral-850 space-y-1">
            <span className="text-neutral-400 font-bold block text-[10px] uppercase">Tutor evaluations</span>
            <p className="text-neutral-850 dark:text-neutral-350 leading-snug">Practiced {quizCount} multiple choice challenges with {Math.round(quizAccuracy * 100)}% accuracy rate.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
