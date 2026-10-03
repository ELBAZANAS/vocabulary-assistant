import React, { useState } from "react";
import { Sparkles, Wand2, CheckCircle2, BookOpen, AlertCircle, Heart, Share2, HelpCircle } from "lucide-react";
import { VocabularyWord } from "../types";

interface StoryForgeTabProps {
  words: VocabularyWord[];
}

export default function StoryForgeTab({ words }: StoryForgeTabProps) {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [storyResult, setStoryResult] = useState<{
    title: string;
    story: string;
    translation: string;
    glossary: { word: string; meaning: string; pos: string }[];
  } | null>(null);

  const [activeLangMode, setActiveLangMode] = useState<"parallel" | "english" | "chinese">("parallel");

  const toggleWordSelect = (word: string) => {
    setSelectedWords(prev => {
      if (prev.includes(word)) {
        return prev.filter(w => w !== word);
      } else {
        if (prev.length >= 4) {
          alert("To ensure the AI composes a cohesive, focused narrative, you can select a maximum of 4 words.");
          return prev;
        }
        return [...prev, word];
      }
    });
  };

  const generateStory = async () => {
    if (selectedWords.length === 0) {
      alert("Please select at least 1-2 vocabulary words to forge a story.");
      return;
    }

    setLoading(true);
    setError("");
    setStoryResult(null);

    try {
      const response = await fetch("/api/story-forge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ words: selectedWords })
      });

      const data = await response.json();
      if (data.success) {
        setStoryResult({
          title: data.title,
          story: data.story,
          translation: data.translation,
          glossary: data.glossary || []
        });
      } else {
        setError(data.error || "The story compilation process failed.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to establish a story rendering connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-8 font-sans" id="story-forge-pane">
      <div className="space-y-6 min-w-0">
        <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800/80 rounded-3xl space-y-4">
          <div>
            <h3 className="text-xs font-black uppercase text-neutral-400 tracking-wider flex items-center gap-1.5 leading-none">
              <Sparkles className="h-4 w-4 text-rose-500 animate-pulse" /> Material Selection
            </h3>
            <p className="text-[11px] text-neutral-520 mt-1 leading-relaxed">
              Choose 1 to 4 active vocabulary words to weave together.
            </p>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            {words.map((w) => {
              const isChecked = selectedWords.includes(w.word);
              return (
                <button
                  key={w.word}
                  onClick={() => toggleWordSelect(w.word)}
                  className={`w-full py-2.5 px-3 rounded-xl border text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    isChecked
                      ? "bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 border-neutral-950 dark:border-white font-bold"
                      : "bg-neutral-50 dark:bg-neutral-955 border-neutral-200 dark:border-neutral-850 text-neutral-800 dark:text-neutral-300 hover:bg-neutral-100/60 dark:hover:bg-neutral-800"
                  }`}
                >
                  <div className="min-w-0">
                    <span className="font-bold uppercase tracking-wider font-mono break-words">{w.word}</span>
                    <span className={`block text-[11px] leading-snug break-words ${isChecked ? "text-neutral-300 dark:text-neutral-600" : "text-neutral-500 dark:text-neutral-400"} font-medium`}>{w.part_of_speech} • {w.meaning}</span>
                  </div>
                  <div className={`h-4 w-4 rounded border flex items-center justify-center font-bold text-[10px] shrink-0 ml-2 ${
                    isChecked ? "bg-white dark:bg-neutral-950 text-neutral-950 dark:text-white border-white dark:border-neutral-950" : "border-neutral-305"
                  }`}>
                    {isChecked ? "✓" : ""}
                  </div>
                </button>
              );
            })}
            {words.length === 0 && (
              <p className="text-xs italic text-neutral-400 py-4 text-center font-medium">Please add words under Add Word first.</p>
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={generateStory}
              className="w-full py-3 bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 transition-all font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-40"
              disabled={loading || selectedWords.length === 0}
            >
              <Wand2 className="h-4 w-4" />
              <span>Forge Story ({selectedWords.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Narrative viewport */}
      <div className="min-w-0 bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800/80 rounded-[2rem] p-6 sm:p-8 shadow-2xs space-y-6 min-h-[460px] flex flex-col justify-between">
        {!storyResult && !loading && !error && (
          <div className="h-full py-16 flex flex-col items-center justify-center text-center space-y-4 max-w-lg mx-auto">
            <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-full border border-rose-150 dark:border-rose-900">
              <Wand2 className="h-8 w-8 stroke-[1.2]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-neutral-900 dark:text-white font-mono uppercase">Story Forge Terminal Ready</h3>
              <p className="text-xs text-neutral-450 mt-1 leading-relaxed">
                Choose targets to the left. LexiFlow AI will draft a classical reading comprehension exercise context combining them together, complete with translation guides.
              </p>
            </div>
          </div>
        )}

        {loading && (
          <div className="h-[300px] flex flex-col items-center justify-center py-16 space-y-4 text-neutral-405">
            <div className="h-8 w-8 border-4 border-neutral-250 dark:border-neutral-800 border-t-neutral-900 dark:border-t-white rounded-full animate-spin" />
            <p className="text-[11px] font-mono font-bold tracking-wider animate-pulse text-center uppercase">CONSTRUCTING COHESIVE AI LITERATURE PIECE...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/25 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl flex items-start gap-3 mt-4">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <strong className="font-extrabold uppercase">Narrative Generation Interrupted</strong>
              <p className="leading-relaxed font-mono">{error}</p>
            </div>
          </div>
        )}

        {storyResult && (
          <div className="space-y-6 animate-fadeIn">
            {/* Display header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4 gap-4">
              <div>
                <span className="text-[9px] font-mono font-bold bg-neutral-100 dark:bg-neutral-850 px-2 py-0.5 rounded text-neutral-500 uppercase tracking-widest leading-none">ALIGNED LITERATURE WORK</span>
                <h3 className="text-xl sm:text-2xl font-black font-sans tracking-tight text-neutral-900 dark:text-light-100 mt-1 text-light-100">{storyResult.title}</h3>
              </div>

              {/* Languages switch buttons */}
              <div className="flex items-center bg-neutral-50 dark:bg-neutral-950 p-1 rounded-xl border border-neutral-150 dark:border-neutral-850 space-x-1 shrink-0 text-[10px] font-bold">
                {[
                  { id: "parallel", label: "Parallel" },
                  { id: "english", label: "English Only" },
                  { id: "chinese", label: "中文" },
                ].map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setActiveLangMode(l.id as any)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeLangMode === l.id
                        ? "bg-neutral-905 dark:bg-white text-white dark:text-neutral-950 shadow-xs"
                        : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Main story book layout */}
            <div className="space-y-6">
              {activeLangMode === "parallel" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm sm:text-base leading-relaxed">
                  {/* English side */}
                  <div className="text-neutral-805 dark:text-neutral-200 border-r border-neutral-100 dark:border-neutral-850 pr-4 italic font-serif">
                    <p className="whitespace-pre-wrap">{storyResult.story}</p>
                  </div>
                  {/* Chinese side */}
                  <div className="text-neutral-500 dark:text-neutral-400 font-sans tracking-wide leading-loose">
                    <p className="whitespace-pre-wrap">{storyResult.translation}</p>
                  </div>
                </div>
              )}

              {activeLangMode === "english" && (
                <div className="text-neutral-805 dark:text-neutral-200 italic font-serif text-sm sm:text-base leading-relaxed max-w-3xl">
                  <p className="whitespace-pre-wrap">{storyResult.story}</p>
                </div>
              )}

              {activeLangMode === "chinese" && (
                <div className="text-neutral-550 dark:text-neutral-400 text-sm sm:text-base font-sans tracking-wide leading-loose max-w-3xl">
                  <p className="whitespace-pre-wrap">{storyResult.translation}</p>
                </div>
              )}
            </div>

            {/* Word list vocabulary glossary */}
            {storyResult.glossary && storyResult.glossary.length > 0 && (
              <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
                <h4 className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Linguistic Glossary</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  {storyResult.glossary.map((el, idx) => (
                    <div key={idx} className="p-3 bg-neutral-50 dark:bg-neutral-955 rounded-xl border border-neutral-100 dark:border-neutral-850/80 flex items-start gap-2.5">
                      <span className="h-4.5 w-4.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">{idx + 1}</span>
                      <div>
                        <strong className="text-neutral-900 dark:text-neutral-100 font-black uppercase tracking-wider block">{el.word}</strong>
                        <span className="text-[10px] text-neutral-405 italic capitalize block">{el.pos}</span>
                        <p className="text-[11px] text-neutral-500 font-sans mt-0.5">{el.meaning}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="border-t border-neutral-100 dark:border-neutral-855 pt-4 text-center flex justify-between items-center text-[10px] text-neutral-400 font-mono">
          <span>COMPOSITION STATUS: VERIFIED OK</span>
          <span>LEXIFLOW STORY CORE v1.0</span>
        </div>
      </div>
    </div>
  );
}
