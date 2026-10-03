import React, { useEffect, useRef, useState } from "react";
import { Send, Terminal, BookOpen, HelpCircle, Sparkles } from "lucide-react";
import { apiJson } from "../lib/api";

interface CommandConsoleTabProps {
  onRefreshWords: () => Promise<void>;
}

interface Line {
  id: string;
  role: "user" | "system";
  text: string;
  quizOptions?: string[];
}

const PRESETS = [
  { label: "help", command: "help" },
  { label: "deck", command: "deck" },
  { label: "due", command: "due" },
  { label: "quiz", command: "quiz" },
  { label: "add pragmatic", command: "add pragmatic" },
];

export default function CommandConsoleTab({ onRefreshWords }: CommandConsoleTabProps) {
  const [lines, setLines] = useState<Line[]>([
    {
      id: "welcome",
      role: "system",
      text: "Command console is connected to your local deck. Type help, or try add, deck, due, query, delete, quiz.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [lines, loading]);

  const runCommand = async (raw: string) => {
    const command = raw.trim();
    if (!command || loading) return;
    setInput("");
    setLoading(true);
    setLines((prev) => [...prev, { id: "u-" + Date.now(), role: "user", text: command }]);

    try {
      const data = await apiJson<{ success: boolean; reply: string; quiz?: { options: string[] }; mutated?: boolean }>(
        "/api/command",
        { method: "POST", body: JSON.stringify({ command }) }
      );
      setLines((prev) => [
        ...prev,
        {
          id: "s-" + Date.now(),
          role: "system",
          text: data.reply || "No response.",
          quizOptions: data.quiz?.options,
        },
      ]);
      if (data.mutated) {
        await onRefreshWords();
      }
    } catch (err: any) {
      setLines((prev) => [
        ...prev,
        { id: "e-" + Date.now(), role: "system", text: err.message || "Request failed." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
            <h2 className="font-bold text-lg leading-tight">Commands</h2>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            A real interface to the same deck used by Flashcards and Quiz. Commands write to
            <code className="font-mono text-xs mx-1">data/vocabulary.json</code>.
          </p>
          <ul className="text-xs text-neutral-600 dark:text-neutral-400 space-y-2">
            <li className="flex gap-2"><BookOpen className="h-3.5 w-3.5 mt-0.5 shrink-0" /> <span><code className="font-mono">add scrutiny</code> looks up and saves a card.</span></li>
            <li className="flex gap-2"><HelpCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" /> <span><code className="font-mono">quiz</code> then answer with A–D to log a review.</span></li>
            <li className="flex gap-2"><Sparkles className="h-3.5 w-3.5 mt-0.5 shrink-0" /> <span>Other text goes to the tutor, which can still change the deck.</span></li>
          </ul>
        </div>
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Shortcuts</span>
          <div className="flex flex-wrap gap-2 mt-3">
            {PRESETS.map((p) => (
              <button
                key={p.command}
                type="button"
                disabled={loading}
                onClick={() => runCommand(p.command)}
                className="px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden flex flex-col min-h-[520px]">
        <div className="px-5 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2 text-xs font-mono text-neutral-500 dark:text-neutral-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          local · /api/command
        </div>
        <div ref={scrollerRef} className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin bg-neutral-50 dark:bg-neutral-950">
          {lines.map((line) => (
            <div key={line.id} className={`flex ${line.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${
                  line.role === "user"
                    ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-950"
                    : "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200"
                }`}
              >
                {line.text}
                {line.quizOptions && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {line.quizOptions.map((opt, idx) => (
                      <button
                        key={opt}
                        type="button"
                        disabled={loading}
                        onClick={() => runCommand(String.fromCharCode(65 + idx))}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                      >
                        {String.fromCharCode(65 + idx)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400 animate-pulse">Running…</p>
          )}
        </div>
        <form
          className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex gap-2 bg-white dark:bg-neutral-900"
          onSubmit={(e) => {
            e.preventDefault();
            void runCommand(input);
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="add resilient · deck · quiz · A"
            className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-400"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="h-10 w-10 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center disabled:opacity-40"
            aria-label="Send command"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
