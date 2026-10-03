import React, { useState } from "react";
import { Search, Sparkles, CheckCircle2, AlertTriangle, ExternalLink, Globe, BookOpen, Clock, Bot, RefreshCw, Languages, Star, Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { VocabularyWord, AgentStep } from "../types";

interface SearchAgentTabProps {
  onAddWord: (word: string) => Promise<{ success: boolean; wordData?: VocabularyWord; logs?: AgentStep[]; error?: string }>;
  onRefreshWords: () => Promise<void>;
}

interface GeneralSearchTranslateResult {
  success: boolean;
  query: string;
  explanation: string;
  translation: string;
  translation_pinyin?: string;
  suggested_word?: string;
  suggested_word_pos?: string;
  suggested_word_meaning?: string;
  source_name?: string;
  source_url?: string;
  logs: AgentStep[];
  error?: string;
}

export default function SearchAgentTab({ onAddWord, onRefreshWords }: SearchAgentTabProps) {
  // Modes: "importer" = Single Word Auto-Importer, "playground" = Global Web Search & Translate Playground
  const [activeSubMode, setActiveSubMode] = useState<"importer" | "playground">("playground");
  
  // Importer Mode states
  const [wordInput, setWordInput] = useState("");
  const [importerLoading, setImporterLoading] = useState(false);
  const [importerLogs, setImporterLogs] = useState<AgentStep[]>([]);
  const [importerResult, setImporterResult] = useState<VocabularyWord | null>(null);
  const [importerError, setImporterError] = useState("");

  // Playground Mode states
  const [playgroundInput, setPlaygroundInput] = useState("");
  const [playgroundLoading, setPlaygroundLoading] = useState(false);
  const [playgroundLogs, setPlaygroundLogs] = useState<AgentStep[]>([]);
  const [playgroundResult, setPlaygroundResult] = useState<GeneralSearchTranslateResult | null>(null);
  const [playgroundError, setPlaygroundError] = useState("");
  const [isSavingSuggested, setIsSavingSuggested] = useState<string | null>(null);

  const HOT_SUGGESTIONS = [
    { word: "scrutiny", label: "scrutiny (NYT)" },
    { word: "advocate", label: "advocate (The Guardian)" },
    { word: "mitigate", label: "mitigate (AP News)" },
    { word: "pragmatic", label: "pragmatic (BBC)" },
  ];

  const HOT_PLAYGROUND_SUGGESTIONS = [
    { query: "burn the midnight oil meaning", label: "Idiom: Burn the midnight oil" },
    { query: "climate resilience mitigation", label: "Topic: Climate mitigation" },
    { query: "What does 'break a leg' translate to?", label: "Idiom: Break a leg" },
    { query: "artificial intelligence governance", label: "Concept: AI governance" },
  ];

  // Importer Search Handler
  const handleImporterSearch = async (word: string) => {
    if (!word || word.trim() === "") return;
    setImporterLoading(true);
    setImporterError("");
    setImporterResult(null);
    setImporterLogs([
      { title: "Initializing Search Request", detail: `Contacting backend routers to authorize Example Search Agent on word: "${word}"`, timestamp: new Date().toLocaleTimeString() }
    ]);

    try {
      const response = await onAddWord(word);
      if (response.success && response.wordData) {
        setImporterResult(response.wordData);
        if (response.logs) {
          setImporterLogs(response.logs);
        }
        await onRefreshWords(); // Reload main dashboard list
      } else {
        setImporterError(response.error || "Search Agent execution was interrupted.");
        if (response.logs) {
          setImporterLogs(response.logs);
        }
      }
    } catch (err: any) {
      setImporterError(err.message || "Network transaction halted.");
    } finally {
      setImporterLoading(false);
    }
  };

  // Playground Search Handler
  const handlePlaygroundSearch = async (query: string) => {
    if (!query || query.trim() === "") return;
    setPlaygroundLoading(true);
    setPlaygroundError("");
    setPlaygroundResult(null);
    setPlaygroundLogs([
      { title: "Grounding Standup", detail: `Contacting server translation pipeline on query: "${query}"`, timestamp: new Date().toLocaleTimeString() }
    ]);

    try {
      const response = await fetch("/api/agent/general-search-translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });

      const data = await response.json();
      if (data.success) {
        setPlaygroundResult(data);
        if (data.logs) {
          setPlaygroundLogs(data.logs);
        }
      } else {
        setPlaygroundError(data.error || "Linguistic search playground failed.");
        if (data.logs) {
          setPlaygroundLogs(data.logs);
        }
      }
    } catch (err: any) {
      setPlaygroundError(err.message || "Network transaction interrupted.");
    } finally {
      setPlaygroundLoading(false);
    }
  };

  // Save Suggested Word to Spaced Repetition deck
  const saveSuggestedWord = async (word: string) => {
    if (!word) return;
    setIsSavingSuggested(word);
    try {
      const resp = await onAddWord(word);
      if (resp.success) {
        alert(`Success! "${word}" has been successfully imported and added into your Spaced Repetition deck.`);
        await onRefreshWords();
      } else {
        alert(`Could not import word card: ${resp.error || "Unknown Error"}`);
      }
    } catch (err: any) {
      alert(`Network error saving word: ${err.message}`);
    } finally {
      setIsSavingSuggested(null);
    }
  };

  const isCurrentSearching = activeSubMode === "importer" ? importerLoading : playgroundLoading;
  const currentActiveLogs = activeSubMode === "importer" ? importerLogs : playgroundLogs;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="search-agent-workspace-container">
      {/* Left Column: Switch Mode Tabs, Input Panel & Live Workflow Logs */}
      <div className="lg:col-span-6 flex flex-col space-y-6">
        
        {/* Playground vs Importer Mode selectors */}
        <div className="bg-neutral-100 dark:bg-neutral-900/60 p-1.5 rounded-2xl flex items-center border border-neutral-200/50 dark:border-neutral-800 gap-1.5 shrink-0">
          <button
            onClick={() => setActiveSubMode("playground")}
            className={`flex-1 py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
              activeSubMode === "playground"
                ? "bg-white dark:bg-neutral-850 text-neutral-950 dark:text-white shadow-xs border border-neutral-250/20"
                : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300"
            }`}
          >
            <Languages className="h-3.5 w-3.5" />
            <span>Search & Translate Playground</span>
          </button>
          
          <button
            onClick={() => setActiveSubMode("importer")}
            className={`flex-1 py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
              activeSubMode === "importer"
                ? "bg-white dark:bg-neutral-850 text-neutral-950 dark:text-white shadow-xs border border-neutral-250/20"
                : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300"
            }`}
          >
            <Bot className="h-3.5 w-3.5" />
            <span>Dictionary Auto-Importer</span>
          </button>
        </div>

        {/* Playgound Form Panel */}
        {activeSubMode === "playground" ? (
          <div className="bg-white dark:bg-neutral-900/90 rounded-3xl border border-neutral-100 dark:border-neutral-800/80 p-6 shadow-sm flex flex-col space-y-4 transition-colors">
            <div className="flex items-center space-x-2 text-neutral-800 dark:text-neutral-200">
              <Globe className="h-5 w-5 text-emerald-500" />
              <h2 className="font-bold text-lg tracking-tight">Active Search & Translate</h2>
            </div>
            
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Ask or search for <strong>anything</strong>. Translate entire sentences, define tricky idioms, analyze phrases, or ask specific vocabulary questions. Gemini uses Search Grounding with live web searches to translate and explain real context.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePlaygroundSearch(playgroundInput);
              }}
              className="relative flex items-center gap-2 pt-1"
            >
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 font-mono text-[10px] uppercase">Query</span>
                <input
                  type="text"
                  value={playgroundInput}
                  onChange={(e) => setPlaygroundInput(e.target.value)}
                  placeholder="e.g. burn the midnight oil, translate: to tackle on the issue..."
                  disabled={playgroundLoading}
                  className="w-full pl-16 pr-4 py-3 bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent dark:text-white transition-all"
                />
              </div>
              
              <button
                type="submit"
                disabled={playgroundLoading || !playgroundInput.trim()}
                className="px-5 py-3 bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 font-medium text-sm rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
              >
                {playgroundLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Translate</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Playground suggestions */}
            <div className="pt-1.5">
              <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block mb-2">Popular Expressions & Grounding Queries</span>
              <div className="flex flex-col space-y-1.5">
                {HOT_PLAYGROUND_SUGGESTIONS.map((item) => (
                  <button
                    key={item.query}
                    onClick={() => {
                      setPlaygroundInput(item.query);
                      handlePlaygroundSearch(item.query);
                    }}
                    disabled={playgroundLoading}
                    className="w-full text-left px-3.5 py-2 bg-neutral-50 dark:bg-neutral-850 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-750/70 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-300 transition-colors flex items-center justify-between"
                  >
                    <span>{item.label}</span>
                    <Search className="h-3 w-3 text-neutral-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Importer Mode Form Panel */
          <div className="bg-white dark:bg-neutral-900/90 rounded-3xl border border-neutral-100 dark:border-neutral-800/80 p-6 shadow-sm flex flex-col space-y-4 transition-colors">
            <div className="flex items-center space-x-2 text-neutral-800 dark:text-neutral-200">
              <Bot className="h-5 w-5 text-neutral-600 dark:text-neutral-350" />
              <h2 className="font-bold text-lg tracking-tight">Vocabulary Word Auto-Importer</h2>
            </div>
            
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Input a single vocabulary target. The Gemini Agent connects to news database APIs, translates spelling pronunciation markers, extracts real sentence instances, and <strong>automatically adds</strong> it to your Vocabulary database.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleImporterSearch(wordInput);
              }}
              className="relative flex items-center gap-2 pt-1"
            >
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 font-mono text-[10px] uppercase font-bold">Word</span>
                <input
                  type="text"
                  value={wordInput}
                  onChange={(e) => setWordInput(e.target.value)}
                  placeholder="sanction, scrutiny, resilience..."
                  disabled={importerLoading}
                  className="w-full pl-14 pr-4 py-3 bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent dark:text-white transition-all"
                />
              </div>
              
              <button
                type="submit"
                disabled={importerLoading || !wordInput.trim()}
                className="px-5 py-3 bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 font-medium text-sm rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
              >
                {importerLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Import Card</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Hot Suggestions */}
            <div className="pt-2">
              <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block mb-2">Pre-configured Study Targets</span>
              <div className="flex flex-wrap gap-2">
                {HOT_SUGGESTIONS.map((item) => (
                  <button
                    key={item.word}
                    onClick={() => {
                      setWordInput(item.word);
                      handleImporterSearch(item.word);
                    }}
                    disabled={importerLoading}
                    className="px-3.5 py-1.5 bg-neutral-50 dark:bg-neutral-850 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-750 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Live Running Log Monitor */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800/80 text-neutral-750 dark:text-neutral-300 rounded-3xl p-6 font-mono text-xs shadow-xs flex flex-col h-[320px] relative transition-colors">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3 mb-4 shrink-0">
            <div className="flex items-center space-x-2">
              <span className="h-3 w-3 rounded-full bg-rose-500 inline-block" />
              <span className="h-3 w-3 rounded-full bg-amber-500 inline-block" />
              <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" />
              <span className="text-neutral-450 dark:text-neutral-500 font-bold ml-2">AGENT_WORKFLOW_MON_v1.0</span>
            </div>
            {isCurrentSearching && (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded animate-pulse font-bold border border-emerald-100 dark:border-emerald-900/40">
                RUNNING
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
            {currentActiveLogs.length > 0 ? (
              currentActiveLogs.map((log, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                      ⚙️ {log.title}
                    </span>
                    <span className="text-neutral-500 dark:text-neutral-400 font-semibold">{log.timestamp}</span>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-300 pl-3.5 leading-relaxed text-[11px]">{log.detail}</p>
                </motion.div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-neutral-450 dark:text-neutral-500 py-12 text-center">
                <Clock className="h-8 w-8 mb-2 stroke-[1.2]" />
                <p>Waiting for agent instructions...</p>
                <p className="text-[10px] mt-1 text-neutral-400 dark:text-neutral-500">Enter a query above to launch live workflow</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Search Results Display */}
      <div className="lg:col-span-6 flex flex-col justify-stretch">
        <AnimatePresence mode="wait">
          
          {/* Active Loading Animation */}
          {isCurrentSearching ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm min-h-[450px]"
            >
              <div className="relative">
                <div className="h-14 w-14 border-4 border-neutral-100 border-t-neutral-800 rounded-full animate-spin" />
                <Sparkles className="h-5 w-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-neutral-500 animate-pulse" />
              </div>
              <h3 className="font-bold text-lg text-neutral-800 dark:text-neutral-100">Agent Processing In Progress</h3>
              <p className="text-sm text-neutral-450 dark:text-neutral-450 max-w-sm leading-relaxed">
                Gemini is currently executing Google Search queries, looking up real-time contextual occurrences, translating complex constructs to Simplified Chinese with full phonetic tone markers, and establishing authority checks.
              </p>
              <div className="inline-block bg-neutral-50 dark:bg-neutral-850 border border-neutral-150 dark:border-neutral-750 px-4 py-2 rounded-xl text-xs font-mono text-neutral-500 animate-pulse">
                Current step: {currentActiveLogs[currentActiveLogs.length - 1]?.title || "Working..."}
              </div>
            </motion.div>
          ) : activeSubMode === "playground" ? (
            
            /* Playground Mode Output Results */
            playgroundError ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white dark:bg-neutral-900 rounded-3xl border border-rose-100 dark:border-rose-950 p-8 text-center flex flex-col items-center justify-center space-y-3 shadow-xs h-full min-h-[450px]"
              >
                <AlertTriangle className="h-10 w-10 text-rose-500 stroke-[1.5]" />
                <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-100">Linguistic Agent Encountered Issues</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md leading-relaxed">{playgroundError}</p>
                <div className="bg-rose-50 dark:bg-rose-950/40 p-4 rounded-xl text-[11px] text-rose-700 dark:text-rose-400 max-w-md text-left leading-normal border border-rose-100/50 dark:border-rose-900/45 font-mono">
                  💡 <strong>Suggestion:</strong> Ensure you have your <code>GEMINI_API_KEY</code> saved inside <strong>Settings &gt; Secrets</strong>. The engine will fallback to translation API routing if the key is missing.
                </div>
              </motion.div>
            ) : playgroundResult ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 p-6 flex flex-col justify-between shadow-sm min-h-[450px] space-y-6 transition-colors"
              >
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 self-start px-3 py-1 rounded-full text-xs font-semibold border border-emerald-100 dark:border-emerald-900/50">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Real-time Translation & Grounding Complete</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-bold">Query Text</span>
                    <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-tight mt-1">"{playgroundResult.query}"</h1>
                  </div>

                  {/* Primary Translation Card */}
                  <div className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-150/70 dark:border-neutral-800 p-4 rounded-xl space-y-2.5">
                    <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Simplified Chinese Translation</span>
                    <p className="text-lg font-bold text-neutral-800 dark:text-neutral-200">{playgroundResult.translation}</p>
                    {playgroundResult.translation_pinyin && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-450 font-mono italic">🗣️ Pinyin: {playgroundResult.translation_pinyin}</p>
                    )}
                  </div>

                  {/* Context reasoning explanation */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Contextual Analysis & Usage Guide</span>
                    <p className="text-sm text-neutral-600 dark:text-neutral-350 leading-relaxed font-serif">
                      {playgroundResult.explanation}
                    </p>
                  </div>

                  {/* Suggested Vocabulary saving block */}
                  {playgroundResult.suggested_word && (
                    <div className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/50 dark:border-neutral-800/80 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase text-amber-500 flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> Study Proposal
                        </span>
                        <h4 className="text-sm font-bold text-neutral-950 dark:text-white mt-1">
                          "{playgroundResult.suggested_word}"
                          <span className="text-xs font-mono text-neutral-400 font-medium ml-1.5">({playgroundResult.suggested_word_pos || "vocabulary"})</span>
                        </h4>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{playgroundResult.suggested_word_meaning || "View matching word definition"}</p>
                      </div>

                      <button
                        onClick={() => saveSuggestedWord(playgroundResult.suggested_word!)}
                        disabled={!!isSavingSuggested}
                        className="px-3.5 py-2 bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-neutral-200 border-transparent text-white dark:text-neutral-900 font-bold text-xs rounded-lg transition-transform hover:scale-102 flex items-center justify-center space-x-1 shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        {isSavingSuggested === playgroundResult.suggested_word ? (
                          <>
                            <RefreshCw className="h-3 w-3 animate-spin" />
                            <span>Adding...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="h-3 w-3" />
                            <span>Add to Deck</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Grounded Citation links */}
                  <div className="flex flex-wrap items-center justify-between text-xs gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <div className="text-neutral-400">
                      Grounded Citation: <span className="font-bold text-neutral-700 dark:text-neutral-300">{playgroundResult.source_name || "Wikipedia Learning Core"}</span>
                    </div>
                    {playgroundResult.source_url && (
                      <a
                        href={playgroundResult.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-800 dark:text-neutral-200 hover:text-neutral-600 inline-flex items-center font-bold"
                      >
                        <span>View reference page</span>
                        <ExternalLink className="h-3.5 w-3.5 ml-1" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="bg-neutral-100/50 dark:bg-neutral-900/60 rounded-xl p-3 border border-neutral-200/40 dark:border-neutral-800/80 text-xs text-neutral-500 dark:text-neutral-400 leading-normal">
                  💡 <strong>Tip:</strong> Search translated query outputs are fully dynamic and do not clutter your spaced repetition flashcards unless you tap the <strong>"Add to Deck"</strong> button above.
                </div>
              </motion.div>
            ) : (
              <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 border-dashed p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm min-h-[450px]">
                <Globe className="h-16 w-16 text-neutral-200 dark:text-neutral-750 stroke-[1.2]" />
                <h3 className="font-bold text-lg text-neutral-750 dark:text-neutral-200">Global Search & Translate Output Panel</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-450 max-w-sm leading-relaxed">
                  Type any idiom, concept, news query, or phrase in the Search and Translate panel. The Gemini Agent will run a live grounded search, and output translations, Pinyin annotations, and usage analyses here!
                </p>
              </div>
            )
          ) : (
            
            /* Importer Mode Output Results */
            importerError ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white dark:bg-neutral-900 rounded-3xl border border-rose-100 dark:border-rose-950 p-8 text-center flex flex-col items-center justify-center space-y-3 shadow-xs h-full min-h-[450px]"
              >
                <AlertTriangle className="h-10 w-10 text-rose-500 stroke-[1.5]" />
                <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-100">Dictionary Importer Interrupted</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md leading-relaxed">{importerError}</p>
                <div className="bg-rose-50 dark:bg-rose-950/40 p-3.5 rounded-xl text-[11px] text-rose-700 dark:text-rose-400 max-w-md text-left leading-normal border border-rose-100/50 dark:border-rose-900/40 font-mono">
                  💡 <strong>Helpful suggestion:</strong> Check your <code>GEMINI_API_KEY</code>, or test using one of our default suggested word targets that operate with offline dictionary fallback structures.
                </div>
              </motion.div>
            ) : importerResult ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 p-6 flex flex-col justify-between shadow-sm min-h-[450px] space-y-6 transition-colors"
              >
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 self-start px-3 py-1 rounded-full text-xs font-semibold border border-emerald-100 dark:border-emerald-900/50">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Vocabulary Card Imported & Added Successfully</span>
                  </div>

                  <div>
                    <div className="flex items-baseline space-x-3">
                      <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">{importerResult.word}</h1>
                      <span className="text-xs px-2.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-mono rounded font-semibold uppercase">{importerResult.part_of_speech}</span>
                    </div>
                    <span className="text-sm font-mono text-neutral-400 mt-1 block">{importerResult.phonetic || "/N/A/"}</span>
                  </div>

                  <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3 space-y-0.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block mb-1">Chinese Definition</span>
                    <p className="text-base font-semibold text-neutral-800 dark:text-neutral-200">{importerResult.meaning}</p>
                    {importerResult.meaning_pinyin && (
                      <p className="text-xs text-neutral-400 dark:text-neutral-500 font-mono italic">🗣️ Pinyin: {importerResult.meaning_pinyin}</p>
                    )}
                  </div>

                  {/* Grounding Example Card */}
                  <div className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-150/70 dark:border-neutral-800 p-4 rounded-xl space-y-3 relative overflow-hidden">
                    <div className="absolute top-1 right-2 text-[9px] font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                      <Globe className="h-3 w-3" /> Grounded News Sentence
                    </div>

                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block">Authentic Context</span>
                    <blockquote className="text-neutral-800 dark:text-neutral-300 text-sm leading-relaxed font-serif">
                      "{importerResult.example}"
                    </blockquote>
                    <div className="border-t border-neutral-200 dark:border-neutral-800 border-dashed pt-2 space-y-1">
                      <span className="text-xs text-neutral-450 dark:text-neutral-400 block mb-1">Translation & Pinyin</span>
                      <p className="text-xs text-neutral-750 dark:text-neutral-300 font-medium">{importerResult.translation}</p>
                      {importerResult.translation_pinyin && (
                        <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-mono italic leading-relaxed">🗣️ Pinyin: {importerResult.translation_pinyin}</p>
                      )}
                    </div>
                  </div>

                  {/* Meta details footer links */}
                  <div className="flex flex-wrap items-center justify-between text-xs gap-4 pt-2">
                    <div className="text-neutral-400">
                      Source: <span className="font-bold text-neutral-700 dark:text-neutral-300">{importerResult.source_name}</span>
                    </div>
                    {importerResult.source_url && (
                      <a
                        href={importerResult.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-800 dark:text-neutral-250 hover:text-neutral-600 inline-flex items-center font-bold"
                      >
                        <span>View original report</span>
                        <ExternalLink className="h-3.5 w-3.5 ml-1" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="bg-neutral-100/50 dark:bg-neutral-900/60 rounded-xl p-3 border border-neutral-200/40 dark:border-neutral-800/85 text-xs text-neutral-500 dark:text-neutral-400 leading-normal">
                  ⭐ <strong>Tip:</strong> This word card has been imported and saved in your study deck. You can access it on the <strong>Vocabulary List</strong> tab or review it in Spaced Repetition decks immediately.
                </div>
              </motion.div>
            ) : (
              <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 border-dashed p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm min-h-[450px]">
                <BookOpen className="h-16 w-16 text-neutral-200 dark:text-neutral-750 stroke-[1.2]" />
                <h3 className="font-bold text-lg text-neutral-700 dark:text-neutral-200">Vocabulary Agent Output Panel</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-450 max-w-sm leading-relaxed">
                  Enter a single vocabulary target word to enrich and add to your local database deck. The agent's structured card parsing including translations, collocations, definitions, and news references will output here.
                </p>
              </div>
            )
          )
        }

        </AnimatePresence>
      </div>
    </div>
  );
}
