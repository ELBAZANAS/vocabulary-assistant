import { VocabularyWord, ReviewLog, QuizHistoryItem, WorkflowLog } from "../../types";
import { isDueForReview } from "../../lib/srs";

interface DashboardViewProps {
  words: VocabularyWord[];
  reviewLogs: ReviewLog[];
  quizHistory: QuizHistoryItem[];
  workflowLogs: WorkflowLog[];
}

export default function DashboardView({ words, reviewLogs, quizHistory, workflowLogs }: DashboardViewProps) {
  const dueCount = words.filter((w) => isDueForReview(w)).length;
  const totalQuizAnswers = quizHistory.length;
  const correctQuizAnswers = quizHistory.filter((q) => q.is_correct).length;
  const quizAccuracy = totalQuizAnswers > 0 ? Math.round((correctQuizAnswers / totalQuizAnswers) * 100) : 0;
  const totalTokensUsed = workflowLogs.reduce((total, log) => {
    const stepTokens = log.steps?.reduce((sum, s) => sum + (s.tokensConsumed || 0), 0) || 0;
    return total + stepTokens;
  }, 0);

  const countPOS = (pos: string) => words.filter((w) => (w.part_of_speech || "").toLowerCase() === pos.toLowerCase()).length;
  const nouns = countPOS("noun");
  const verbs = countPOS("verb");
  const adjectives = countPOS("adjective");
  const others = Math.max(0, words.length - (nouns + verbs + adjectives));
  const mastered = words.filter((w) => w.proficiency >= 3).length;

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: "Words", value: words.length, hint: `${dueCount} due for review` },
          { label: "Reviews", value: reviewLogs.length, hint: "Lifetime flashcard ratings" },
          { label: "Quiz accuracy", value: `${quizAccuracy}%`, hint: `${correctQuizAnswers}/${totalQuizAnswers} correct` },
          { label: "Tokens logged", value: totalTokensUsed, hint: "Approximate agent usage" },
        ].map((card) => (
          <div key={card.label} className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-100 dark:border-neutral-800/80 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider block">{card.label}</span>
              <span className="text-2xl sm:text-3xl font-black font-mono">{card.value}</span>
            </div>
            <span className="text-[10px] text-neutral-450 mt-2 font-mono">{card.hint}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-6 rounded-[2rem] space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-400">Parts of speech</h3>
          <div className="space-y-4 pt-2">
            {[
              { key: "Nouns", count: nouns, color: "bg-neutral-900 dark:bg-white" },
              { key: "Verbs", count: verbs, color: "bg-neutral-400" },
              { key: "Adjectives", count: adjectives, color: "bg-emerald-500" },
              { key: "Other", count: others, color: "bg-rose-500" },
            ].map((pos) => {
              const percentage = words.length > 0 ? Math.round((pos.count / words.length) * 100) : 0;
              return (
                <div key={pos.key} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between font-medium">
                    <span className="font-bold">{pos.key}</span>
                    <span className="font-mono text-neutral-450">{pos.count} ({percentage}%)</span>
                  </div>
                  <div className="h-3 bg-neutral-100 dark:bg-neutral-950 rounded-full overflow-hidden">
                    <div className={`h-full ${pos.color} rounded-full`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-6 rounded-[2rem] space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-400">Mastery</h3>
          <div className="flex items-center justify-around py-4">
            <svg className="w-24 h-24 transform -rotate-90 shrink-0" viewBox="0 0 36 36" aria-hidden="true">
              <path className="text-neutral-100 dark:text-neutral-850" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-emerald-500" strokeDasharray={`${words.length > 0 ? Math.round((mastered / words.length) * 100) : 0}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Mastered ({mastered})
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-neutral-500">
                <span className="h-2.5 w-2.5 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                Still learning ({words.length - mastered})
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-6 rounded-[2rem] space-y-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-450">Recent reviews</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
          {reviewLogs.slice(-5).reverse().map((log) => (
            <div key={log.id} className="flex items-center justify-between p-3.5 bg-neutral-50 dark:bg-neutral-950/40 rounded-xl border border-neutral-100 dark:border-neutral-800 text-xs">
              <div className="flex items-center space-x-3">
                <span className={`h-2.5 w-2.5 rounded-full ${log.is_correct ? "bg-emerald-500" : "bg-rose-500"}`} />
                <strong className="font-mono uppercase">{log.word}</strong>
              </div>
              <div className="flex items-center space-x-3.5 font-mono text-neutral-450">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.is_correct ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"}`}>
                  {log.is_correct ? "EASY" : "HARD"}
                </span>
                <span>{new Date(log.reviewed_at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>
          ))}
          {reviewLogs.length === 0 && (
            <p className="text-xs text-neutral-400 text-center py-6">No reviews yet. Open Flashcards to start.</p>
          )}
        </div>
      </div>
    </div>
  );
}
