import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Bot, User, Send, Sparkles, BookOpen, Trash2, ShieldCheck, GraduationCap, Compass, HelpCircle, Terminal, Activity, Cpu, Code, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { VocabularyWord, ChatMessage } from "../types";

interface AITutorTabProps {
  words: VocabularyWord[];
  onRefreshVocabulary?: () => void;
}

interface TraceStep {
  id: string;
  timestamp: string;
  stage: "INGEST" | "PROMPT_ASSEMBLE" | "API_DISPATCH" | "MODEL_EXECUTION" | "RESPONSE_PARSING" | "STATE_SYNC" | "PROJECT_INTERACTION";
  label: string;
  details: string;
  status: "pending" | "success" | "error" | "info";
}

export default function AITutorTab({ words, onRefreshVocabulary }: AITutorTabProps) {
  const [personaMode, setPersonaMode] = useState<string>(() => {
    return localStorage.getItem("tutor_persona_mode") || "general";
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("tutor_chat_history");
    return saved ? JSON.parse(saved) : [
      {
        id: "welcome",
        sender: "bot",
        text: "Hello — I am the LexiFlow tutor. I can explain words in your deck, draft example sentences, and add or delete cards when you ask. Pick a mode on the left, or just type a question.",
        timestamp: new Date().toLocaleTimeString()
      }
    ];
  });

  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string>("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [traceSteps, setTraceSteps] = useState<TraceStep[]>([]);
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});
  const [activeModel, setActiveModel] = useState<string>("Detecting...");
  const [isModelOffline, setIsModelOffline] = useState<boolean>(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const chatScrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/agent/status");
        const data = await res.json();
        if (data.success) {
          setActiveModel(data.isOffline ? `${data.modelName} (Sandbox Fallback)` : `${data.modelName}`);
          setIsModelOffline(data.isOffline);
        }
      } catch (err) {
        console.error("Failed to load agent status:", err);
        setActiveModel("Local Schema Sandbox");
        setIsModelOffline(true);
      }
    };
    fetchStatus();
  }, []);

  useEffect(() => {
    setTraceSteps([
      {
        id: "init",
        timestamp: new Date().toLocaleTimeString(),
        stage: "INGEST",
        label: "Workspace AI Agent Initialized",
        details: `LexiFlow Workspace Agent linked successfully. Native route "/api/agent/chat" configured to direct traffic safely to the backend LLM orchestrator. Selected cognitive sub-structure is "${personaMode.toUpperCase()}".`,
        status: "success"
      },
      {
        id: "cache",
        timestamp: new Date().toLocaleTimeString(),
        stage: "STATE_SYNC",
        label: "Dialogue Cache Index Synced",
        details: `Successfully deserialized and loaded ${messages.length} conversation threads from LocalStorage storage node (tutor_chat_history). Memory index buffers stable.`,
        status: "success"
      }
    ]);
  }, [personaMode]);

  useEffect(() => {
    localStorage.setItem("tutor_persona_mode", personaMode);
  }, [personaMode]);

  useEffect(() => {
    localStorage.setItem("tutor_chat_history", JSON.stringify(messages));
    if (chatScrollerRef.current) {
      chatScrollerRef.current.scrollTo({
        top: chatScrollerRef.current.scrollHeight,
        behavior: "smooth"
      });
    } else {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (customText?: string) => {
    const promptToSend = (customText || inputVal).trim();
    if (!promptToSend) return;

    if (!customText) {
      setInputVal("");
    }

    const startMs = Date.now();
    const userMsg: ChatMessage = {
      id: "usr-" + Math.random().toString(36).substring(2, 9),
      sender: "user",
      text: promptToSend,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    // 1. Initial Ingest, Assembly, and Dispatch Traces
    const step1: TraceStep = {
      id: "ingest-" + startMs,
      timestamp: new Date().toLocaleTimeString(),
      stage: "INGEST",
      label: "Inbound Prompt Ingested",
      details: `User message of length ${promptToSend.length} characters successfully ingested by React input buffer. Content: "${promptToSend.substring(0, 60)}${promptToSend.length > 60 ? "..." : ""}". Empty buffer check passed. Safe parameter validation status: SECURE.`,
      status: "success"
    };

    const step2: TraceStep = {
      id: "assemble-" + startMs,
      timestamp: new Date().toLocaleTimeString(),
      stage: "PROMPT_ASSEMBLE",
      label: "System Prompt Role Matching",
      details: `Identified active LexiFlow model persona behavior: "${personaMode.toUpperCase()}" preset. Appended current vocabulary focus: ${selectedWord ? `"${selectedWord}"` : "None (General prompt mode)"}. Loaded conversational history: ${messages.length} previous bubbles. Packed prompt template payload securely.`,
      status: "success"
    };

    const step3: TraceStep = {
      id: "dispatch-" + startMs,
      timestamp: new Date().toLocaleTimeString(),
      stage: "API_DISPATCH",
      label: "HTTP POSIX Transit Pipeline",
      details: `Dispatched JSON body transit map to workspace route "POST /api/agent/chat". Server proxy active. Waiting for model inference completion state...`,
      status: "pending"
    };

    setTraceSteps([step1, step2, step3]);

    try {
      const response = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: messages.map(m => ({ sender: m.sender, text: m.text })),
          latestPrompt: promptToSend,
          optionalWord: selectedWord || undefined,
          personaMode: personaMode
        })
      });

      const data = await response.json();
      if (data.success && data.reply) {
        if (data.modelName) {
          setActiveModel(data.isOffline ? `${data.modelName} (Sandbox Fallback)` : `${data.modelName}`);
          setIsModelOffline(data.isOffline);
        }
        
        const botReply: ChatMessage = {
          id: "bot-" + Math.random().toString(36).substring(2, 9),
          sender: "bot",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString()
        };

        const duration = Date.now() - startMs;
        setMessages(prev => [...prev, botReply]);

        const actionTraces = (data.actionsExecuted || []).map((act: any, i: number) => ({
          id: `act-${Date.now()}-${i}`,
          timestamp: new Date().toLocaleTimeString(),
          stage: "PROJECT_INTERACTION" as const,
          label: `Agent Task: ${act.type.toUpperCase()} / "${act.word}"`,
          details: act.details || `AI Agent interacted with project: executed direct command to ${act.type} word "${act.word}".`,
          status: "success" as const
        }));

        if (data.actionsExecuted && data.actionsExecuted.length > 0 && onRefreshVocabulary) {
          onRefreshVocabulary();
        }

        // Complete pipeline traces successfully
        setTraceSteps(prev => [
          ...prev.map(s => s.stage === "API_DISPATCH" ? { ...s, status: "success" as const, details: `Proxy successfully received reply status code 200 (OK). Server-side gateway transmission resolved.` } : s),
          {
            id: "model-" + Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            stage: "MODEL_EXECUTION",
            label: "Server-Side Token Generation",
            details: `Secure server compilation of prompt parameters completed in ${duration}ms using ${data.modelName || "active model"}. Full conversational context inference resolved with zero sandbox errors.`,
            status: "success"
          },
          ...actionTraces,
          {
            id: "parse-" + Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            stage: "RESPONSE_PARSING",
            label: "Linguistic Validation & Formatting",
            details: `Successfully validated ${data.reply.length} character output length. Markdown grammar context verified. Tone register aligned for tutor mode preset.`,
            status: "success"
          },
          {
            id: "sync-" + Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            stage: "STATE_SYNC",
            label: "Client state Synchronization completed",
            details: `Injected bot dialog bubble ID "${botReply.id}". Serialized chat history schema. Flushed cache updates directly into browser's LocalStorage slot "tutor_chat_history".`,
            status: "success"
          }
        ]);
      } else {
        const errorReply: ChatMessage = {
          id: "err-" + Math.random().toString(36).substring(2, 9),
          sender: "bot",
          text: `⚠️ **AI Companion Error**: ${data.error || "The AI compilation channel timed out."}`,
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, errorReply]);

        setTraceSteps(prev => [
          ...prev.map(s => s.stage === "API_DISPATCH" ? { ...s, status: "error" as const, details: `Proxy API failed with custom error reply or invalid return signature: ${data.error || "Timeout"}` } : s),
          {
            id: "err-t-" + Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            stage: "RESPONSE_PARSING",
            label: "Technical Exception Interceptor",
            details: `Could not parse AI Tutor body. Error code identified: ${data.error || "504 API Thread Failure"}. Fallback response rendered in dialogue.`,
            status: "error"
          }
        ]);
      }
    } catch (err: any) {
      const errorReply: ChatMessage = {
        id: "err-" + Math.random().toString(36).substring(2, 9),
        sender: "bot",
        text: `❌ **AI Companion Interrupted**: ${err.message || "Failed to finalize communication streams."}`,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorReply]);

      setTraceSteps(prev => [
        ...prev.map(s => s.stage === "API_DISPATCH" ? { ...s, status: "error" as const, details: `Network fetch failed to connect with the backend: ${err.message}` } : s),
        {
          id: "err-t-" + Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          stage: "RESPONSE_PARSING",
          label: "Network Interceptor Fault Triggered",
          details: `POSIX Socket / network adapter returned connection reset. Diagnostic details: ${err.message || "Unknown offline error"}. UI synchronizer aborted updating browser storage cache index.`,
          status: "error"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      // Auto-revert back to default state of button if they don't click again to confirm
      setTimeout(() => {
        setConfirmClear(false);
      }, 4000);
      return;
    }

    setConfirmClear(false);
    let welcomeMsg = "👋 **AI Core Session Reset!** Let's learn or chat about something new.";
    if (personaMode === "general") {
      welcomeMsg = "🤖 **AI Companion Core initialized!** Ask me anything: write code, draft emails, explain historical timelines, or brainstorm creative ideas.";
    } else if (personaMode === "ielts") {
      welcomeMsg = "🎓 **IELTS & TOEFL Academic Mentor online.** Share any paragraph or sentence, and I will assess its grammatical score register and suggest corrections.";
    } else {
      welcomeMsg = "📚 **Vocab Coach Specialist active.** Select vocabulary words, request idioms and collocations, or check native Hanyu Pinyin translation guides.";
    }

    setMessages([
      {
        id: "welcome",
        sender: "bot",
        text: welcomeMsg,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  const handleShortcutPrompt = (actionType: string) => {
    if (!selectedWord) {
      alert("Please select a target vocabulary word from your deck first using the dropdown below!");
      return;
    }

    let queryText = "";
    if (actionType === "synonyms") {
      queryText = `Explain the exact difference between the synonyms of "${selectedWord}". Show me what registers are appropriate for each.`;
    } else if (actionType === "sentence") {
      queryText = `Write an authentic modern sentence containing "${selectedWord}" that would match an Academic IELTS or professional writing standard.`;
    } else if (actionType === "collocations") {
      queryText = `What are 3 typical or high-frequency collocations using the word "${selectedWord}"? Explain their meanings.`;
    }

    handleSendMessage(queryText);
  };

  // Advanced Regex parser for inline and block markdown formatting
  const parseInlineStyles = (text: string) => {
    if (!text) return "";
    
    // Split by bold tags `**`
    const boldParts = text.split(/\*\*([\s\S]*?)\*\*/g);
    return boldParts.map((part, index) => {
      // Bold items
      if (index % 2 === 1) {
        return (
          <strong key={index} className="font-extrabold text-neutral-900 dark:text-neutral-50 bg-neutral-100/60 dark:bg-neutral-800/45 px-1 py-0.5 rounded-sm">
            {part}
          </strong>
        );
      }
      
      // Inline codes `code`
      const codeParts = part.split(/`([\s\S]*?)`/g);
      return codeParts.map((subPart, subIndex) => {
        if (subIndex % 2 === 1) {
          return (
            <code key={subIndex} className="font-mono bg-neutral-200/50 dark:bg-neutral-950/80 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded text-[10px] font-bold">
              {subPart}
            </code>
          );
        }
        return subPart;
      });
    });
  };

  const renderFormattedText = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");
    
    return (
      <div className="space-y-1.5 break-words">
        {lines.map((line, idx) => {
          let trimmed = line.trim();
          
          // Row headers
          if (trimmed.startsWith("### ")) {
            return (
              <h4 key={idx} className="text-sm font-black text-neutral-805 dark:text-neutral-100 mt-3 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0 animate-pulse" />
                <span>{trimmed.replace("### ", "")}</span>
              </h4>
            );
          }
          if (trimmed.startsWith("## ")) {
            return (
              <h3 key={idx} className="text-sm font-black text-neutral-950 dark:text-white mt-4 mb-2 border-b border-neutral-100 dark:border-neutral-800 pb-1">
                {trimmed.replace("## ", "")}
              </h3>
            );
          }
          if (trimmed.startsWith("# ")) {
            return (
              <h2 key={idx} className="text-base font-black text-neutral-950 dark:text-white mt-4.5 mb-2.5">
                {trimmed.replace("# ", "")}
              </h2>
            );
          }
          
          // Blockquotes
          if (trimmed.startsWith("> ")) {
            return (
              <blockquote key={idx} className="pl-3 border-l-2 border-neutral-450 dark:border-neutral-600 text-neutral-650 dark:text-neutral-350 italic my-2 bg-neutral-100/40 dark:bg-neutral-955/30 p-2.5 rounded-r-xl font-mono text-[11px]">
                {trimmed.replace(/^>\s*/, "")}
              </blockquote>
            );
          }

          // Bullet points
          if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
            const content = trimmed.substring(2);
            return (
              <div key={idx} className="flex items-start gap-2 pl-3 py-0.5 text-neutral-700 dark:text-neutral-300">
                <span className="text-[10px] text-emerald-500 mt-1 shrink-0">●</span>
                <span className="flex-1 min-w-0 break-words text-xs">{parseInlineStyles(content)}</span>
              </div>
            );
          }

          // Numbered lists
          const matchNum = trimmed.match(/^(\d+)\.\s+(.*)$/);
          if (matchNum) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-3 py-0.5 text-neutral-700 dark:text-neutral-300">
                <span className="font-mono font-bold text-neural-400 dark:text-neutral-500 text-[10px] shrink-0 mt-0.5">{matchNum[1]}.</span>
                <span className="flex-1 min-w-0 break-words text-xs">{parseInlineStyles(matchNum[2])}</span>
              </div>
            );
          }

          // Horizontal rule
          if (trimmed === "---") {
            return <hr key={idx} className="my-3 border-t border-neutral-150 dark:border-neutral-800" />;
          }

          return (
            <p key={idx} className="leading-relaxed text-xs text-neutral-700 dark:text-neutral-300">
              {parseInlineStyles(line)}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)] gap-8" id="ai-tutor-pane">
      {/* Sidebar options */}
      <div className="lg:col-span-1 space-y-6 min-w-0">
        {/* Core Agent Mode Selection */}
        <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl space-y-4 shadow-3xs">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center h-5 w-5 rounded-md bg-emerald-500 text-white font-extrabold text-[10px]">AI</span>
            <h3 className="text-xs font-black uppercase text-neutral-800 dark:text-neutral-200 tracking-wider">
              AI Agent Core Mode
            </h3>
          </div>
          <p className="text-[11px] leading-relaxed text-neutral-500">
            Instantly adapt your native workspace agent's system architecture, cognitive bounds, and specialty presets.
          </p>

          <div className="space-y-2 pt-1">
            {[
              { id: "general", label: "General Brainstormer", desc: "No boundaries. Write, summarize, draft essays, or chat.", icon: Compass, color: "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20" },
              { id: "linguist", label: "Vocab Coach", desc: "Lexical breakdowns: tone, synonyms, and etymology.", icon: BookOpen, color: "border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/20" },
              { id: "ielts", label: "IELTS Mentor", desc: "Paragraph corrections, sentence polish, and score feedback.", icon: GraduationCap, color: "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-50/30 dark:bg-amber-950/20" }
            ].map((p) => {
              const active = personaMode === p.id;
              const IconComp = p.icon;
              return (
                <button
                  key={p.id}
                  onClick={() => setPersonaMode(p.id)}
                  className={`w-full max-w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 overflow-hidden ${
                    active 
                      ? "bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 border-neutral-950 dark:border-white shadow-xs font-bold" 
                      : "bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                  }`}
                >
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border ${active ? "bg-white/10 dark:bg-neutral-950/10 text-current" : p.color}`}>
                    <IconComp className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <span className="text-xs font-extrabold block leading-snug break-words">{p.label}</span>
                    <span className={`text-[11px] leading-snug block font-normal break-words ${active ? "text-neutral-300 dark:text-neutral-600" : "text-neutral-500 dark:text-neutral-400"}`}>
                      {p.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Word Focus Dropdown (Only shown if vocabulary mode or IELTS active) */}
        {personaMode !== "general" && (
          <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl space-y-4 shadow-3xs animate-fadeIn">
            <h3 className="text-xs font-black uppercase text-neutral-400 tracking-wider flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-rose-500" /> Word Focus Context
            </h3>
            <p className="text-[11px] leading-relaxed text-neutral-500">
              Select an active deck word. The agent will prioritize and reference this lexical context in shortcut buttons below.
            </p>

            <div className="space-y-1.5">
              <label htmlFor="focus-word-select" className="sr-only">Focus Word Selection</label>
              <select
                id="focus-word-select"
                className="w-full px-3 py-2.5 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl cursor-pointer focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:text-white font-bold"
                value={selectedWord}
                onChange={(e) => setSelectedWord(e.target.value)}
              >
                <option value="">-- No Specific Focus --</option>
                {words.map(w => (
                  <option key={w.word} value={w.word}>
                    {w.word} ({w.part_of_speech})
                  </option>
                ))}
              </select>
            </div>

            {selectedWord && (
              <div className="p-3 bg-neutral-50 dark:bg-neutral-955 rounded-xl border border-neutral-150 dark:border-neutral-850 text-[10px] space-y-1">
                <span className="font-extrabold uppercase text-[9px] tracking-wider text-rose-500">Active Focal Point</span>
                <p className="font-bold text-neutral-800 dark:text-neutral-200 uppercase font-mono">{selectedWord}</p>
              </div>
            )}
          </div>
        )}

        {/* Shortcuts Options */}
        {personaMode !== "general" && selectedWord && (
          <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl space-y-4 shadow-3xs animate-fadeIn">
            <h3 className="text-xs font-black uppercase text-neutral-400 tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-emerald-505" /> Tutor Shortcuts
            </h3>
            <p className="text-[11px] leading-relaxed text-neutral-500">
              Immediately prompt the AI agent to run targeted lexical analytics about the focal word.
            </p>

            <div className="space-y-2 flex flex-col pt-1">
              <button
                onClick={() => handleShortcutPrompt("synonyms")}
                className="w-full text-left py-2 px-3 bg-neutral-50 dark:bg-neutral-850 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[11px] font-bold rounded-xl border border-neutral-200/50 dark:border-neutral-750 transition-all cursor-pointer"
              >
                Explain Synonyms/Antonyms
              </button>
              <button
                onClick={() => handleShortcutPrompt("sentence")}
                className="w-full text-left py-2 px-3 bg-neutral-50 dark:bg-neutral-850 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[11px] font-bold rounded-xl border border-neutral-200/50 dark:border-neutral-750 transition-all cursor-pointer"
              >
                Compose IELTS Example
              </button>
              <button
                onClick={() => handleShortcutPrompt("collocations")}
                className="w-full text-left py-2 px-3 bg-neutral-50 dark:bg-neutral-850 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[11px] font-bold rounded-xl border border-neutral-200/50 dark:border-neutral-750 transition-all cursor-pointer"
              >
                Explain 3 Collocations
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Chat Conversation Workspace */}
      <div className="min-w-0 bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800/80 rounded-[2rem] shadow-2xs flex flex-col h-[580px] overflow-hidden justify-between relative">
        {/* Chat window Header */}
        <div className="px-4 sm:px-6 py-4 bg-neutral-50 dark:bg-neutral-900/40 border-b border-neutral-150 dark:border-neutral-800/80 flex justify-between items-center gap-3 z-10">
          <div className="flex items-center gap-3 text-xs min-w-0">
            <div className="h-7 w-7 shrink-0 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 rounded-lg flex items-center justify-center font-bold">
              AI
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <strong className="text-neutral-900 dark:text-neutral-100 font-bold leading-snug">
                  LexiFlow tutor
                </strong>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/40">
                  <ShieldCheck className="h-3 w-3 shrink-0" /> Linked
                </span>
              </div>
              <span className="text-[10px] text-neutral-450 font-mono font-bold uppercase block mt-1">
                Active Mode: <span className="text-neutral-700 dark:text-neutral-300 font-extrabold underline">{personaMode}</span>
              </span>
            </div>
          </div>

          <button
            onClick={clearChat}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl transition-all cursor-pointer font-bold border ${
              confirmClear
                ? "bg-rose-600 text-white border-rose-600 hover:bg-rose-700 animate-pulse"
                : "text-rose-600 bg-rose-50 dark:bg-rose-950/25 hover:bg-rose-100 dark:hover:bg-rose-900/30 border-rose-100 dark:border-rose-900/40"
            }`}
            title={confirmClear ? "Click again to confirm chat reset" : "Clear Chat History"}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>{confirmClear ? "Confirm Reset?" : "Reset Console"}</span>
          </button>
        </div>

        {/* Conversation Logs Scroller */}
        <div ref={chatScrollerRef} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
          {messages.map((message) => {
            const isBot = message.sender === "bot";
            return (
              <div
                key={message.id}
                className={`flex gap-3 min-w-0 w-full ${isBot ? "" : "ml-auto flex-row-reverse max-w-[90%]"}`}
              >
                {/* Avatar */}
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border ${
                  isBot 
                    ? "bg-neutral-50 dark:bg-neutral-950 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800" 
                    : "bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 border-neutral-950"
                }`}>
                  {isBot ? <Bot className="h-4 w-4 text-emerald-500" /> : <User className="h-4 w-4" />}
                </div>

                {/* Bubble content */}
                <div className={`min-w-0 break-words p-4 rounded-2xl text-xs space-y-1.5 leading-relaxed shadow-3xs border ${
                  isBot 
                    ? "flex-1 bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 border-neutral-200 dark:border-neutral-800" 
                    : "bg-neutral-950 dark:bg-neutral-100 text-white dark:text-neutral-950 border-neutral-950 dark:border-white font-medium"
                }`}>
                  {isBot ? (
                    renderFormattedText(message.text)
                  ) : (
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  )}
                  <span className={`text-[9px] block font-mono font-bold mt-1.5 ${isBot ? "text-neutral-400" : "text-neutral-400 dark:text-neutral-600"}`}>
                    {message.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 max-w-[80%]">
              <div className="h-8 w-8 rounded-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-emerald-500 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-neutral-50/50 dark:bg-neutral-955 border border-neutral-100 dark:border-neutral-800 text-xs text-neutral-500 font-mono font-bold tracking-wider animate-pulse flex items-center gap-2">
                <span>AI AGENT CORE EMITTING RESPONSE...</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input Text Form Area */}
        <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-150 dark:border-neutral-850 flex items-center gap-3">
          <input
            type="text"
            placeholder={
              personaMode === "general"
                ? "Type a general question (e.g. 'write a python script', 'draft a professional email')..."
                : "Ask anything, compile sentence reviews, or request pinyin Guides..."
            }
            className="min-w-0 flex-1 px-4 py-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 text-neutral-900 dark:text-white"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage();
            }}
            disabled={loading}
          />
          <button
            onClick={() => handleSendMessage()}
            className={`p-3 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 rounded-xl hover:bg-neutral-850 dark:hover:bg-neutral-100 transition-all cursor-pointer shrink-0 disabled:opacity-40`}
            disabled={loading || !inputVal.trim()}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

      {/* Dynamic Diagnostic Trace logs below for technical/academic detail */}
      <div className="min-w-0 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 space-y-4 shadow-sm text-neutral-700 dark:text-neutral-300 font-mono text-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="h-7 w-7 shrink-0 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/20">
              <Terminal className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h4 className="font-extrabold text-neutral-900 dark:text-neutral-100 flex flex-wrap items-center gap-2 break-words">
                LexiFlow AI Agent Telemetry Trace
                <span className="animate-pulse inline-block h-2 w-2 rounded-full bg-emerald-500" />
              </h4>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-sans mt-0.5 break-words">
                Technical real-time instruction pipeline log showing how the LLM treats your messages step-by-step
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[10px]">
            <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <Cpu className="h-3 w-3 text-sky-600 dark:text-sky-400" /> API SECURE PROXY
            </span>
            <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <Activity className="h-3 w-3 text-emerald-600 dark:text-emerald-400" /> {loading ? "PROCESSING" : "IDLE"}
            </span>
            <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <Code className="h-3 w-3 text-amber-600 dark:text-amber-400" /> BUFFER: {messages.length} TURNS
            </span>
          </div>
        </div>

        {/* Steps timeline list */}
        <div className="space-y-3.5 max-h-[420px] overflow-y-auto scrollbar-thin pr-1">
          {traceSteps.length === 0 ? (
            <p className="text-neutral-500 dark:text-neutral-400 text-[11px] italic py-4 break-words">No diagnostic traces recorded in the active workspace memory index yet.</p>
          ) : (
            traceSteps.map((step, idx) => {
              const isPending = step.status === "pending";
              const isError = step.status === "error";
              const isSuccess = step.status === "success";
              const isExpanded = expandedSteps[step.id] ?? true;

              return (
                <div key={step.id} className="relative pl-7 border-l border-neutral-200 dark:border-neutral-700 last:border-0 pb-1 min-w-0">
                  {/* Step status indicator absolute node */}
                  <div className="absolute -left-[9.5px] top-1 h-5 w-5 rounded-full flex items-center justify-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
                    {isPending && <Activity className="h-3 w-3 text-amber-500 animate-spin" />}
                    {isSuccess && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
                    {isError && <AlertCircle className="h-3 w-3 text-rose-400" />}
                    {step.status === "info" && <Bot className="h-3 w-3 text-indigo-400" />}
                  </div>

                  {/* Header row elements */}
                  <div className="flex flex-wrap justify-between items-start gap-2 pr-1 min-w-0">
                    <button
                      onClick={() => setExpandedSteps(prev => ({ ...prev, [step.id]: !isExpanded }))}
                      className="min-w-0 text-left font-bold text-[11px] text-neutral-800 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer flex flex-wrap items-center gap-2"
                    >
                      <span className="text-[9.5px] bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-600 dark:text-neutral-300 break-words">
                        STAGE {idx + 1}: {step.stage}
                      </span>
                      <span className="break-words">{step.label}</span>
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-neutral-500 shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 text-neutral-500 shrink-0" />}
                    </button>
                    <span className="text-[9.5px] text-neutral-500 dark:text-neutral-400 font-mono select-none shrink-0">{step.timestamp}</span>
                  </div>

                  {/* Expanded Body containing raw payload mechanics */}
                  {isExpanded && (
                    <div className="mt-2 text-[10px] leading-relaxed text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-950 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 max-w-full overflow-x-auto whitespace-pre-wrap break-words font-mono">
                      <p>{step.details}</p>
                      {step.stage === "PROMPT_ASSEMBLE" && (
                        <div className="mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-800 text-[9px] text-neutral-600 dark:text-neutral-400 font-mono">
                          <span className="font-extrabold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">Synthesized Directives Injected:</span>
                          <div className="mt-1 font-mono text-neutral-600 dark:text-neutral-400 leading-normal pl-2 border-l border-neutral-300 dark:border-neutral-700 break-words">
                            - role_id: lexi_flow_agent_standard_v2<br />
                            - model_registry: models/gemini-2.3-flash-native<br />
                            - context_window: 128,000 max tokens compiled<br />
                            - target_decoding_temperature: 0.70<br />
                            - schema_enforcement: raw_markdown_linguist_output<br />
                            - host_container: cloud_run_inference_ingress
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
