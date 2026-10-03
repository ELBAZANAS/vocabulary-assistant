import { useEffect, useMemo, useState } from "react";
import { Cpu, Database, RefreshCw, CheckCircle2, XCircle, BookOpen, Brain } from "lucide-react";
import { WorkflowLog, ReviewLog, QuizHistoryItem, UserPreferences } from "../../types";

interface MonitorViewProps {
  workflowLogs: WorkflowLog[];
  reviewLogs: ReviewLog[];
  quizHistory: QuizHistoryItem[];
  preferences: UserPreferences;
  averageLatency: number;
  onRefresh: () => Promise<void>;
}

type Filter = "all" | "lookup" | "review" | "quiz";

interface ActivityItem {
  id: string;
  kind: Filter;
  at: string;
  title: string;
  detail: string;
  ok?: boolean;
}

export default function MonitorView({
  workflowLogs,
  reviewLogs,
  quizHistory,
  preferences,
  averageLatency,
  onRefresh,
}: MonitorViewProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [agentStatus, setAgentStatus] = useState<{ provider: string; isOffline: boolean; modelName: string } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetch("/api/agent/status")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setAgentStatus({ provider: data.provider, isOffline: data.isOffline, modelName: data.modelName });
        }
      })
      .catch(() => setAgentStatus(null));
  }, [preferences.provider]);

  const items = useMemo<ActivityItem[]>(() => {
    const lookup: ActivityItem[] = workflowLogs.map((log) => ({
      id: "wf-" + log.id,
      kind: "lookup",
      at: log.timestamp,
      title: `Lookup · ${log.word}`,
      detail: `${log.success ? "Succeeded" : "Failed"} in ${log.totalDurationMs} ms · ${(log.steps || []).length} steps`,
      ok: log.success,
    }));
    const reviews: ActivityItem[] = reviewLogs.map((log) => ({
      id: "rv-" + log.id,
      kind: "review",
      at: log.reviewed_at,
      title: `Flashcard · ${log.word}`,
      detail: log.is_correct ? "Rated easy" : "Rated hard",
      ok: log.is_correct,
    }));
    const quizzes: ActivityItem[] = quizHistory.map((log) => ({
      id: "qz-" + log.id,
      kind: "quiz",
      at: log.answered_at,
      title: `Quiz · ${log.word}`,
      detail: log.is_correct ? `Correct: ${log.selected_option}` : `Chose “${log.selected_option}” (answer: ${log.correct_option})`,
      ok: log.is_correct,
    }));
    return [...lookup, ...reviews, ...quizzes].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  }, [workflowLogs, reviewLogs, quizHistory]);

  const visible = items.filter((i) => filter === "all" || i.kind === filter);
  const selectedRun = [...workflowLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Activity log</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Real lookups, flashcard ratings, and quiz answers from this machine.
          </p>
        </div>
        <button
          type="button"
          disabled={refreshing}
          onClick={async () => {
            setRefreshing(true);
            await onRefresh();
            setRefreshing(false);
          }}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 rounded-3xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Model</span>
          <p className="font-mono text-sm font-bold mt-2 text-neutral-900 dark:text-white">
            {agentStatus?.modelName || preferences.provider}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {agentStatus?.isOffline ? "Using dictionary fallback" : "Live API connected"}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 rounded-3xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Avg lookup time</span>
          <p className="font-mono text-2xl font-black mt-1 text-neutral-900 dark:text-white">{averageLatency} ms</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 rounded-3xl flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Storage</span>
            <p className="font-mono text-sm font-bold mt-2">data/vocabulary.json</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{items.length} events recorded</p>
          </div>
          <Database className="h-6 w-6 text-neutral-400" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {([
          ["all", "All"],
          ["lookup", "Lookups"],
          ["review", "Reviews"],
          ["quiz", "Quizzes"],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
              filter === id
                ? "bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 border-neutral-950 dark:border-white"
                : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 space-y-3">
          {visible.length === 0 && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 py-10 text-center">
              No events yet. Add a word or rate a flashcard.
            </p>
          )}
          {visible.slice(0, 40).map((item) => (
            <div key={item.id} className="flex items-start gap-3 p-3 rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
              {item.kind === "lookup" ? <BookOpen className="h-4 w-4 mt-0.5 text-neutral-500" /> : item.kind === "quiz" ? <Brain className="h-4 w-4 mt-0.5 text-neutral-500" /> : <Cpu className="h-4 w-4 mt-0.5 text-neutral-500" />}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <strong className="text-sm text-neutral-900 dark:text-white truncate">{item.title}</strong>
                  {item.ok === undefined ? null : item.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> : <XCircle className="h-4 w-4 text-rose-500 shrink-0" />}
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">{item.detail}</p>
                <p className="text-[10px] font-mono text-neutral-400 mt-1">{new Date(item.at).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 space-y-3">
          <h3 className="text-sm font-bold">Latest lookup steps</h3>
          {!selectedRun && <p className="text-xs text-neutral-500">Lookups will appear here after you add a word.</p>}
          {selectedRun && (
            <>
              <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                {selectedRun.word} · {selectedRun.totalDurationMs} ms
              </p>
              {(selectedRun.steps || []).map((step, idx) => (
                <div key={idx} className="text-xs border-l-2 border-neutral-200 dark:border-neutral-700 pl-3 py-1">
                  <strong className="block text-neutral-900 dark:text-white">{step.status}</strong>
                  <p className="text-neutral-600 dark:text-neutral-400 mt-0.5">{step.detail}</p>
                  <p className="font-mono text-[10px] text-neutral-400 mt-1">{step.apiUsed}</p>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
