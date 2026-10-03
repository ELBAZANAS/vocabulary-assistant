import React, { useState, useEffect } from "react";
import { VocabularyWord, WorkflowLog, ReviewLog } from "../types";
import { Search, Trash2, ExternalLink, Globe, BookOpen, AlertCircle, Sparkles, Check, Edit2, Play, Pause, RotateCcw, Clock, ShieldAlert, Cpu, Layers } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface VocabularyTabProps {
  words: VocabularyWord[];
  onDeleteWord: (word: string) => Promise<void>;
  onUpdateWord: (word: string, updates: Partial<VocabularyWord>) => Promise<void>;
  workflowLogs?: WorkflowLog[];
  reviewLogs?: ReviewLog[];
}

type DetailSubTab = "overview" | "examples" | "workflow" | "history" | "replay";

export default function VocabularyTab({
  words,
  onDeleteWord,
  onUpdateWord,
  workflowLogs = [],
  reviewLogs = []
}: VocabularyTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWord, setSelectedWord] = useState<VocabularyWord | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<DetailSubTab>("overview");
  const [editingField, setEditingField] = useState<{ word: string, field: "meaning" | "phonetic" | "translation" } | null>(null);
  const [editValue, setEditValue] = useState("");

  // Animated Replay state
  const [replayStep, setReplayStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Set the first word as selected by default if nothing is selected
  useEffect(() => {
    if (words.length > 0 && !selectedWord) {
      setSelectedWord(words[0]);
    }
  }, [words, selectedWord]);

  // Reset replay parameters on selecting a new word or moving to Replay tab
  useEffect(() => {
    setReplayStep(0);
    setIsPlaying(false);
  }, [selectedWord, activeSubTab]);

  const filteredWords = words.filter(
    (w) =>
      w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.meaning || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startEdit = (word: VocabularyWord, field: "meaning" | "phonetic" | "translation") => {
    setEditingField({ word: word.word, field });
    setEditValue(word[field] || "");
  };

  const saveEdit = async () => {
    if (!editingField) return;
    const { word, field } = editingField;
    await onUpdateWord(word, { [field]: editValue });
    
    // update current selection state if active
    if (selectedWord && selectedWord.word === word) {
      setSelectedWord({ ...selectedWord, [field]: editValue });
    }
    setEditingField(null);
  };

  const workflowData = selectedWord
    ? workflowLogs.find((log) => log.word.toLowerCase() === selectedWord.word.toLowerCase()) ?? null
    : null;

  // Replay animation effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setReplayStep((prev) => {
          if (!workflowData || prev >= workflowData.steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1600);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, workflowData]);

  const getProficiencyStars = (level: number) => {
    const stars = [];
    const colorClass = 
      level >= 4 ? "bg-emerald-500" :
      level >= 2 ? "bg-amber-500" :
      "bg-rose-500";
      
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          className={`h-2.5 w-2.5 rounded-full inline-block mr-1 transition-all ${i <= level ? colorClass : "bg-neutral-200 dark:bg-neutral-800"}`}
          title={`Proficiency Level ${level}/5`}
        />
      );
    }
    return stars;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="vocabulary-workspace-container">
      {/* Left panel: Search & Listing */}
      <div className="lg:col-span-5 flex flex-col space-y-4">
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800/80 p-4 shadow-xs">
          <label htmlFor="vocab-side-search" className="sr-only">Search vocabulary</label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 h-4 w-4" />
            <input
              id="vocab-side-search"
              type="text"
              placeholder="Search words or expressions..."
              className="w-full pl-10 pr-4 py-3 bg-neutral-55 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800 rounded-2xl text-xs sm:text-sm focus:outline-none dark:text-white transition-all font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Word Cards List */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800/80 p-4 shadow-xs flex-1 min-h-[400px] max-h-[600px] overflow-y-auto space-y-3 scrollbar-thin">
          <div className="flex items-center justify-between px-1 mb-2">
            <h3 className="text-[10px] font-extrabold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              Active Dataset ({filteredWords.length} items)
            </h3>
            <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full text-neutral-500 font-bold">
              In Memory
            </span>
          </div>

          <AnimatePresence>
            {filteredWords.length > 0 ? (
              filteredWords.map((item) => (
                <motion.div
                  key={item.word}
                  id={`vocab-card-${item.word}`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onClick={() => {
                    setSelectedWord(item);
                    setActiveSubTab("overview");
                  }}
                  className={`p-4 rounded-2xl text-left border cursor-pointer transition-all ${
                    selectedWord?.word === item.word
                      ? "border-neutral-900 dark:border-neutral-100 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-md"
                      : "border-neutral-100 dark:border-neutral-800/60 hover:border-neutral-250 dark:hover:border-neutral-700 hover:bg-neutral-50/50 dark:hover:bg-neutral-850 bg-white dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-base tracking-tight">{item.word}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-extrabold uppercase tracking-wide ${
                          selectedWord?.word === item.word 
                            ? "bg-neutral-800 dark:bg-neutral-200 text-neutral-200 dark:text-neutral-800" 
                            : "bg-neutral-100 dark:bg-neutral-900 text-neutral-550 dark:text-neutral-400"
                        }`}>
                          {item.part_of_speech}
                        </span>
                      </div>
                      <p className={`text-xs mt-1.5 font-semibold truncate max-w-[200px] ${
                        selectedWord?.word === item.word ? "text-neutral-300 dark:text-neutral-600" : "text-neutral-500 dark:text-neutral-450"
                      }`}>
                        {item.meaning}
                      </p>
                    </div>
                    <button
                      id={`delete-btn-${item.word}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirmDeleteId !== item.word) {
                          setConfirmDeleteId(item.word);
                          setTimeout(() => {
                            setConfirmDeleteId(curr => curr === item.word ? null : curr);
                          }, 4000);
                        } else {
                          setConfirmDeleteId(null);
                          onDeleteWord(item.word);
                          if (selectedWord?.word === item.word) {
                            setSelectedWord(null);
                          }
                        }
                      }}
                      className={`p-1.5 rounded-xl transition-all border ${
                        confirmDeleteId === item.word
                          ? "bg-rose-600 border-rose-600 text-white hover:bg-rose-700 animate-pulse scale-105"
                          : selectedWord?.word === item.word
                            ? "hover:bg-neutral-850 dark:hover:bg-neutral-100 text-neutral-400 hover:text-rose-400 border-transparent"
                            : "hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-400 hover:text-rose-500 border-transparent"
                      }`}
                      title={confirmDeleteId === item.word ? "Click again to confirm deletion" : "Delete word card"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3.5 flex items-center justify-between border-t border-dashed border-neutral-150/40 dark:border-neutral-800/40 pt-2.5 opacity-90">
                    <span className="text-[11px] font-mono flex items-center">
                      {getProficiencyStars(item.proficiency)}
                    </span>
                    <span className="text-[10px] uppercase tracking-wide font-bold">
                      Reviews: {item.review_count}
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-neutral-400 dark:text-neutral-600">
                <AlertCircle className="h-10 w-10 mb-2 stroke-1 text-neutral-300 dark:text-neutral-700" />
                <p className="text-xs font-semibold">No dictionary entries match search.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right panel: Extensive Details Display */}
      <div className="lg:col-span-7 flex flex-col">
        <AnimatePresence mode="wait">
          {selectedWord ? (
            <motion.div
              key={selectedWord.word}
              id={`vocab-details-${selectedWord.word}`}
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              className="bg-white dark:bg-neutral-900 rounded-[2rem] border border-neutral-100 dark:border-neutral-800/80 shadow-xs p-6 flex flex-col space-y-6"
            >
              {/* Card Meta Header */}
              <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-3 flex-wrap">
                      <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                        {selectedWord.word}
                      </h2>
                      <span className="text-xs px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full font-mono text-neutral-500 dark:text-neutral-450 font-bold uppercase">
                        {selectedWord.part_of_speech}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 mt-2">
                      {editingField?.word === selectedWord.word && editingField.field === "phonetic" ? (
                        <div className="flex items-center space-x-1.5">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="text-xs px-2.5 py-1 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded focus:outline-none focus:ring-1 focus:ring-neutral-400"
                          />
                          <button onClick={saveEdit} className="p-0.5 bg-emerald-100 text-emerald-700 rounded"><Check className="h-4 w-4" /></button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1.5">
                          <span className="text-sm font-mono text-neutral-400 dark:text-neutral-500 font-semibold">{selectedWord.phonetic || "/N/A/"}</span>
                          <button onClick={() => startEdit(selectedWord, "phonetic")} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-300 hover:text-neutral-500 rounded cursor-pointer"><Edit2 className="h-3 w-3" /></button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 bg-neutral-50 dark:bg-neutral-950 rounded-2xl px-4 py-2 border border-neutral-100 dark:border-neutral-800 text-xs text-neutral-500 font-mono">
                    <span className="font-bold text-neutral-800 dark:text-neutral-300">Mastery Level:</span>
                    <span className="flex items-center">{getProficiencyStars(selectedWord.proficiency)}</span>
                  </div>
                </div>

                {/* Sub-Tabs Selector inside Word Detail */}
                <div className="flex items-center space-x-1 border-b border-neutral-100 dark:border-neutral-800 mt-6 pt-1 text-xs shrink-0 select-none overflow-x-auto scrollbar-none">
                  {(["overview", "examples", "workflow", "history", "replay"] as DetailSubTab[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveSubTab(tab)}
                      className={`px-4 py-2.5 font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                        activeSubTab === tab
                          ? "border-neutral-900 dark:border-white text-neutral-900 dark:text-white"
                          : "border-transparent text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Outputs */}
              <div className="flex-1 min-h-[300px]">
                {/* 1. OVERVIEW SUBTAB */}
                {activeSubTab === "overview" && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">English Concept & Meaning</h3>
                        {editingField?.word === selectedWord.word && editingField.field === "meaning" ? (
                          <div className="flex items-center space-x-1.5 animate-fadeIn">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="text-xs px-2.5 py-1 border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 rounded focus:outline-none"
                            />
                            <button onClick={saveEdit} className="p-1 bg-emerald-500 text-white rounded"><Check className="h-3.5 w-3.5" /></button>
                          </div>
                        ) : (
                          <button onClick={() => startEdit(selectedWord, "meaning")} className="text-xs text-neutral-450 hover:text-neutral-700 dark:hover:text-neutral-300 flex items-center gap-1 cursor-pointer"><Edit2 className="h-3 w-3" /> Customize</button>
                        )}
                      </div>
                      
                      <div className="bg-neutral-55 dark:bg-neutral-950 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 space-y-1">
                        <p className="text-lg text-neutral-850 dark:text-neutral-100 font-medium leading-normal">
                          {selectedWord.meaning}
                        </p>
                        {selectedWord.meaning_pinyin && (
                          <p className="text-xs text-neutral-400 dark:text-neutral-500 font-mono italic tracking-wide">
                            🗣️ Pinyin: <span className="font-semibold">{selectedWord.meaning_pinyin}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Taxonomy Subgrids */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                      <div className="space-y-2.5 bg-neutral-50/50 dark:bg-neutral-950/40 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800/80">
                        <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-450 dark:text-neutral-500">Synonyms (同义词)</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedWord.synonyms && selectedWord.synonyms.length > 0 ? (
                            selectedWord.synonyms.map((syn) => (
                              <span key={syn} className="text-xs px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium rounded-lg">
                                {syn}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-neutral-400 italic">None cataloged</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2.5 bg-neutral-50/50 dark:bg-neutral-950/40 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800/80">
                        <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-450 dark:text-neutral-500">Antonyms (反义词)</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedWord.antonyms && selectedWord.antonyms.length > 0 ? (
                            selectedWord.antonyms.map((ant) => (
                              <span key={ant} className="text-xs px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium rounded-lg">
                                {ant}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-neutral-400 italic">None cataloged</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2.5 bg-neutral-50/50 dark:bg-neutral-950/40 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800/80">
                        <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-450 dark:text-neutral-500">Daily Collocations</h4>
                        <div className="flex flex-col space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300 font-mono">
                          {selectedWord.collocations && selectedWord.collocations.length > 0 ? (
                            selectedWord.collocations.map((col) => (
                              <span key={col} className="border-l-2 border-neutral-300 dark:border-neutral-700 pl-2">
                                {col}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-neutral-400 italic">None cataloged</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. EXAMPLES SUBTAB */}
                {activeSubTab === "examples" && (
                  <div className="space-y-6">
                    <div className="space-y-3 bg-neutral-50/50 dark:bg-neutral-950/40 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-800 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-3 bg-neutral-100/40 dark:bg-neutral-800/40 rounded-bl-xl text-[9px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-wide flex items-center gap-1 border-l border-b border-neutral-150/20 dark:border-neutral-800/20">
                        <Globe className="h-3 w-3" /> Grounded Search Engine
                      </div>

                      <div className="space-y-4">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-450 dark:text-neutral-500 flex items-center gap-1.5">
                          <Sparkles className="h-3 w-3 text-neutral-500 animate-pulse" /> Authentic Source Occurrence
                        </span>
                        
                        <blockquote className="text-neutral-800 dark:text-neutral-100 text-base md:text-lg leading-relaxed font-serif pt-1">
                          "{selectedWord.example}"
                        </blockquote>

                        <div className="border-t border-dashed border-neutral-200 dark:border-neutral-800 pt-3 flex flex-col space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-neutral-400">Simplified Chinese Translation</span>
                            {editingField?.word === selectedWord.word && editingField.field === "translation" ? (
                              <div className="flex items-center space-x-1.5">
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="text-xs px-2 py-0.5 border border-neutral-300 bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 rounded focus:outline-none"
                                />
                                <button onClick={saveEdit} className="p-0.5 bg-emerald-100 text-emerald-700 rounded"><Check className="h-4 w-4" /></button>
                              </div>
                            ) : (
                              <button onClick={() => startEdit(selectedWord, "translation")} className="text-xs text-neutral-400 hover:text-neutral-600 flex items-center gap-1 cursor-pointer"><Edit2 className="h-3 w-3" /> Edit</button>
                            )}
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-sm text-neutral-600 dark:text-neutral-300 font-semibold">
                              {selectedWord.translation}
                            </p>
                            {selectedWord.translation_pinyin && (
                              <p className="text-xs text-neutral-400 dark:text-neutral-500 font-mono italic tracking-wide leading-relaxed">
                                🗣️ Pinyin: <span className="font-semibold">{selectedWord.translation_pinyin}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="pt-2 flex flex-wrap items-center justify-between gap-4 text-xs">
                          <div className="flex items-center space-x-2 text-neutral-450 dark:text-neutral-500 font-mono">
                            <span>Source:</span>
                            <strong className="text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-805 px-2 py-0.5 rounded text-[11px]">{selectedWord.source_name || "None"}</strong>
                          </div>

                          {selectedWord.source_url && (
                          <a
                            href={selectedWord.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-neutral-800 dark:text-neutral-200 hover:text-neutral-600 dark:hover:text-neutral-100 inline-flex items-center space-x-1 bg-white dark:bg-neutral-950 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 transition-all shadow-sm font-bold text-xs"
                          >
                            <span>Open source</span>
                            <ExternalLink className="h-3.5 w-3.5 ml-1" />
                          </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. WORKFLOW SUBTAB */}
                {activeSubTab === "workflow" && !workflowData && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    No lookup log for this word yet. A real log is saved the next time you add a word.
                  </p>
                )}
                {activeSubTab === "workflow" && workflowData && (
                  <div className="space-y-5 animate-fadeIn">
                    <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-950 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                      <div className="flex items-center space-x-2.5">
                        <Cpu className="h-5 w-5 text-neutral-500" />
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Agent Run Session ID</span>
                          <span className="font-mono text-xs text-neutral-700 dark:text-neutral-300 font-bold">{workflowData.id}</span>
                        </div>
                      </div>

                      <div className="text-right text-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Total Orchestration Latency</span>
                        <span className="font-bold font-mono text-rose-500">{workflowData.totalDurationMs} ms</span>
                      </div>
                    </div>

                    {/* Step Cards List */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-450 px-1">Explainable AI Exec Step Cards</h4>
                      {workflowData.steps.map((step, idx) => (
                        <div
                          key={idx}
                          className="bg-white dark:bg-neutral-950 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs"
                        >
                          <div className="flex items-start space-x-3">
                            <span className="h-5 w-5 rounded-full bg-neutral-100 dark:bg-neutral-850 text-neutral-600 dark:text-neutral-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 font-mono">{idx + 1}</span>
                            <div>
                              <strong className="text-neutral-850 dark:text-neutral-200 block font-bold text-sm leading-tight mb-1">{step.status}</strong>
                              <p className="text-neutral-500 dark:text-neutral-450 font-medium leading-relaxed max-w-xl">{step.detail}</p>
                            </div>
                          </div>

                          <div className="flex md:flex-col items-end shrink-0 text-right gap-3 md:gap-1.5 font-mono text-[10px] text-neutral-450 border-t md:border-t-0 border-neutral-50 dark:border-neutral-800 pt-2.5 md:pt-0">
                            <div>
                              <span className="text-neutral-400 uppercase tracking-wider text-[9px] mr-1 block md:inline font-sans font-bold">API:</span>
                              <span className="text-neutral-700 dark:text-neutral-300 font-bold">{step.apiUsed}</span>
                            </div>
                            <div>
                              <span className="text-neutral-400 uppercase tracking-wider text-[9px] mr-1 block md:inline font-sans font-bold">Duration:</span>
                              <span className="text-neutral-800 dark:text-neutral-200 font-bold">{step.durationMs} ms</span>
                            </div>
                            {step.tokensConsumed > 0 && (
                              <div>
                                <span className="text-neutral-400 uppercase tracking-wider text-[9px] mr-1 block md:inline font-sans font-bold">Cost:</span>
                                <span className="text-rose-500 font-bold">{step.tokensConsumed} tokens</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. HISTORY SUBTAB */}
                {activeSubTab === "history" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Proficiency Detail Card */}
                      <div className="bg-neutral-50 dark:bg-neutral-950 p-5 rounded-3xl border border-neutral-100 dark:border-neutral-800 space-y-4 text-xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block">Performance Profile</span>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-neutral-550 dark:text-neutral-400 font-bold">Review Cycles Completed:</span>
                            <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200 text-sm">{selectedWord.review_count} runs</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-neutral-555 dark:text-neutral-400 font-bold">Spaced Repetition Proficiency:</span>
                            <span className="font-bold font-mono text-emerald-500 text-sm">{Math.min(100, selectedWord.proficiency * 20)}% Mastery</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-neutral-550 dark:text-neutral-400 font-bold">Last Practiced At:</span>
                            <span className="font-mono text-neutral-800 dark:text-neutral-200 font-semibold">
                              {selectedWord.last_reviewed_at 
                                ? new Date(selectedWord.last_reviewed_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                : "Not Reviewed Yet"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-neutral-550 dark:text-neutral-400 font-bold">Card Initialized:</span>
                            <span className="font-mono text-neutral-800 dark:text-neutral-200 font-semibold">
                              {selectedWord.created_at 
                                ? new Date(selectedWord.created_at).toLocaleDateString()
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Log timeline */}
                      <div className="bg-neutral-50 dark:bg-neutral-950 p-5 rounded-3xl border border-neutral-100 dark:border-neutral-800 flex flex-col space-y-4">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block">Review Event Timelines</span>
                        
                        <div className="flex-1 overflow-y-auto max-h-[160px] space-y-3.5 text-xs scrollbar-none">
                          {reviewLogs.filter(l => l.word.toLowerCase() === selectedWord.word.toLowerCase()).length > 0 ? (
                            reviewLogs.filter(l => l.word.toLowerCase() === selectedWord.word.toLowerCase()).map((log, idx) => (
                              <div key={log.id} className="flex items-center gap-2.5 font-mono text-[11px] text-neutral-500 dark:text-neutral-450">
                                <span className={`h-2 w-2 rounded-full ${log.is_correct ? "bg-emerald-500" : "bg-rose-500 animate-pulse"}`} />
                                <span className="text-neutral-800 dark:text-neutral-300 font-semibold">{log.is_correct ? "Mastered" : "Missed"}</span>
                                <span className="ml-auto text-[10px] text-neutral-400">
                                  {new Date(log.reviewed_at).toLocaleDateString()}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-neutral-400 text-center">
                              <Layers className="h-7 w-7 text-neutral-300 mb-1" />
                              <p className="text-[10px] italic">No practice events on log.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. REPLAY SUBTAB */}
                {activeSubTab === "replay" && (
                  <div className="space-y-6">
                    {/* Animated Stage Display */}
                    <div className="bg-neutral-955 dark:bg-neutral-950 border border-neutral-800 p-6 rounded-3xl text-xs space-y-6 relative overflow-hidden h-60 flex flex-col justify-between">
                      {/* Header bar and play controls */}
                      <div className="flex items-center justify-between text-neutral-400 font-mono text-[10px] uppercase tracking-widest shrink-0 border-b border-neutral-800/80 pb-3">
                        <span>Workflow Stage Playback</span>
                        <span>Step {replayStep + 1} of {workflowData.steps.length}</span>
                      </div>

                      {/* Animated Step Main Display */}
                      <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto text-center space-y-3">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={replayStep}
                            initial={{ opacity: 0, scale: 0.96, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-2"
                          >
                            <span className="inline-flex items-center gap-1.5 text-[10px] bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-full text-emerald-400 font-bold font-mono">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                              ACTIVE EXECUTION
                            </span>
                            <h4 className="text-lg md:text-xl font-bold tracking-tight text-white pt-1">
                              {workflowData.steps[replayStep]?.status}
                            </h4>
                            <p className="text-neutral-400 font-medium leading-relaxed px-4 md:px-0 text-xs text-balance">
                              {workflowData.steps[replayStep]?.detail}
                            </p>
                          </motion.div>
                        </AnimatePresence>
                      </div>

                      {/* Timeline Node Map */}
                      <div className="flex items-center justify-center space-x-1 sm:space-x-1.5 shrink-0 select-none pb-1">
                        {workflowData.steps.map((step, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setReplayStep(idx);
                              setIsPlaying(false);
                            }}
                            className={`h-2 rounded-full transition-all cursor-pointer ${
                              idx === replayStep 
                                ? "w-6 bg-emerald-400" 
                                : idx < replayStep 
                                  ? "w-2 bg-emerald-800" 
                                  : "w-2 bg-neutral-800"
                            }`}
                            title={step.status}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Timeline Controls */}
                    <div className="flex items-center justify-center space-x-3 pt-2">
                      <button
                        onClick={() => {
                          setReplayStep(0);
                          setIsPlaying(false);
                        }}
                        className="p-3.5 bg-neutral-100 dark:bg-neutral-850 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-250/20 rounded-2xl transition-all cursor-pointer text-neutral-700 dark:text-neutral-300 flex items-center justify-center shadow-xs md:text-sm font-bold"
                        title="Rewind to First Step"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="py-3 px-6 bg-neutral-950 dark:bg-neutral-100 text-white dark:text-neutral-950 font-extrabold hover:bg-neutral-850 dark:hover:bg-neutral-200 rounded-2xl flex items-center gap-2.5 transition-all cursor-pointer text-xs md:text-sm shadow-md"
                        title={isPlaying ? "Pause Automated Walkthrough" : "Play Autoplay Walkthrough"}
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="h-4 w-4 fill-current text-white dark:text-neutral-950" />
                            <span>Pause Sequence</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 fill-current text-neutral-100 dark:text-neutral-950" />
                            <span>Play Automated</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 border-dashed text-center text-neutral-400 dark:text-neutral-600 h-full min-h-[450px]">
              <BookOpen className="h-14 w-14 mb-3 stroke-[1.1] text-neutral-300 dark:text-neutral-850" />
              <h3 className="text-neutral-700 dark:text-neutral-300 font-extrabold mb-1.5">No Word Highlighted</h3>
              <p className="text-xs max-w-sm font-semibold text-neutral-500 dark:text-neutral-500 leading-relaxed">
                Select a vocabulary card from the list on the left to inspect its phonetic translations, grounded URLs, synonyms, and collocations.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
