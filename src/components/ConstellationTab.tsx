import React, { useState } from "react";
import { Share2, Globe, Database, Network, HelpCircle, Star, Sparkles, BookOpen } from "lucide-react";
import { VocabularyWord } from "../types";

interface ConstellationTabProps {
  words: VocabularyWord[];
}

export default function ConstellationTab({ words }: ConstellationTabProps) {
  const [selectedWord, setSelectedWord] = useState<VocabularyWord | null>(() => {
    return words && words.length > 0 ? words[0] : null;
  });

  const selectWordByName = (name: string) => {
    const found = words.find(w => w.word === name);
    if (found) {
      setSelectedWord(found);
    }
  };

  return (
    <div className="space-y-8" id="constellation-pane">
      {/* Intro descriptor banner */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800/85 p-6 sm:p-8 rounded-[2rem] shadow-xs space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold font-mono tracking-wider bg-indigo-50 dark:bg-indigo-950/25 text-indigo-505 dark:text-indigo-400 rounded-full border border-indigo-150/40 uppercase">
          <Network className="h-3.5 w-3.5" /> Lexical Mesh Graph
        </div>

        <h2 className="text-2xl font-black tracking-tight text-neutral-950 dark:text-white leading-none">
          Lexical Constellation Mesh
        </h2>

        <p className="text-xs sm:text-sm text-neutral-550 max-w-xl">
          A visual graph representing semantic relationships, antonym networks, and grammatical collocations connected to your active vocabulary list.
        </p>
      </div>

      {/* Main interactive map container */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-8">
        <div className="space-y-6 min-w-0">
          <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-3xl space-y-4 shadow-3xs">
            <span className="text-[10px] font-mono font-black text-neutral-400 uppercase tracking-widest block">Select Central Core</span>
            
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1 scrollbar-thin">
              {words.map((w) => (
                <button
                  key={w.word}
                  onClick={() => setSelectedWord(w)}
                  className={`w-full text-left p-3 rounded-xl border transition-colors flex items-start justify-between gap-2 cursor-pointer ${
                    selectedWord?.word === w.word
                      ? "bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 border-neutral-950 dark:border-white font-bold"
                      : "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}
                >
                  <div className="min-w-0">
                    <span className="font-extrabold uppercase font-mono tracking-wider text-[11px] block break-words">{w.word}</span>
                    <span className={`text-[11px] break-words block mt-0.5 leading-snug ${
                      selectedWord?.word === w.word
                        ? "text-neutral-200 dark:text-neutral-600"
                        : "text-neutral-600 dark:text-neutral-400"
                    }`}>{w.part_of_speech} • {w.meaning}</span>
                  </div>
                  <Star className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${selectedWord?.word === w.word ? "fill-amber-400 text-amber-400" : "text-neutral-400"}`} />
                </button>
              ))}
              {words.length === 0 && (
                <p className="text-xs italic text-neutral-400 py-4 text-center font-medium">Please add words under Add Word first.</p>
              )}
            </div>
          </div>
        </div>

        {/* Center Constellation visualizer */}
        <div className="min-w-0 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] p-6 sm:p-8 relative min-h-[460px] flex flex-col justify-between overflow-hidden text-neutral-800 dark:text-neutral-200">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#c7d2fe_0%,transparent_60%)] dark:bg-[radial-gradient(circle_at_30%_30%,#1e1b4b_0%,transparent_60%)] opacity-80 dark:opacity-40" />
          
          {selectedWord ? (
            <div className="space-y-8 relative z-10">
              
              {/* Graphic Title */}
              <div className="flex justify-between items-start gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-3">
                <span className="text-[10px] font-mono text-indigo-700 dark:text-indigo-300 font-extrabold tracking-widest uppercase break-words">Word map</span>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono shrink-0">3 orbits</span>
              </div>

              {/* Constellation Diagram core (Responsively stacked, beautifully styled circles) */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-4 relative min-w-0">
                
                {/* 1. Synonyms Orbit */}
                <div className="space-y-3 min-w-0 flex-1 order-2 md:order-1 text-center md:text-right w-full">
                  <span className="text-[10px] tracking-widest font-mono font-black text-indigo-700 dark:text-indigo-300 uppercase">Synonyms</span>
                  <div className="flex flex-col gap-2">
                    {(selectedWord.synonyms || []).slice(0, 3).map((syn, idx) => (
                      <div key={idx} className="p-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-[11px] text-neutral-800 dark:text-neutral-100 font-bold break-words">
                        {syn}
                      </div>
                    ))}
                    {(selectedWord.synonyms || []).length === 0 && (
                      <span className="text-[10px] italic text-neutral-500">None logged</span>
                    )}
                  </div>
                </div>

                {/* Vector connectors representation using stylized middle box */}
                <div className="hidden md:block h-0.5 w-6 bg-neutral-300 dark:bg-neutral-600 shrink-0 order-2" />

                {/* 2. Focused Central Core! Glowing, centered, premium card */}
                <div className="px-4 bg-white dark:bg-neutral-900 border border-indigo-300 dark:border-indigo-500/55 rounded-full flex flex-col items-center justify-center text-center shadow-sm shrink-0 h-44 w-44 overflow-hidden order-1 md:order-3 relative">
                  <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-wider">{selectedWord.part_of_speech}</span>
                  <h4 className="text-lg font-black font-mono tracking-wider text-neutral-950 dark:text-white uppercase mt-1 break-words max-w-full">{selectedWord.word}</h4>
                  <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium leading-snug mt-1 break-words">{selectedWord.meaning}</p>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 italic mt-0.5 font-mono break-words">{selectedWord.phonetic}</p>
                </div>

                {/* Vector connectors representation */}
                <div className="hidden md:block h-0.5 w-6 bg-neutral-300 dark:bg-neutral-600 shrink-0 order-4" />

                {/* 3. Antonyms & Collocations Orbit */}
                <div className="space-y-4 min-w-0 flex-1 order-5 text-center md:text-left w-full">
                  <div className="space-y-2">
                    <span className="text-[10px] tracking-widest font-mono font-black text-rose-700 dark:text-rose-300 uppercase">Antonyms</span>
                    <div className="flex flex-col gap-1.5">
                      {(selectedWord.antonyms || []).slice(0, 2).map((ant, idx) => (
                        <div key={idx} className="p-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-[11px] text-neutral-800 dark:text-neutral-100 font-bold break-words">
                          {ant}
                        </div>
                      ))}
                      {(selectedWord.antonyms || []).length === 0 && (
                        <span className="text-[10px] italic text-neutral-500">None logged</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-neutral-200 dark:border-neutral-800 pt-2">
                    <span className="text-[10px] tracking-widest font-mono font-black text-emerald-700 dark:text-emerald-300 uppercase">Collocations</span>
                    <div className="flex flex-col gap-1.5">
                      {(selectedWord.collocations || []).slice(0, 2).map((coll, idx) => (
                        <div key={idx} className="p-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-[11px] text-neutral-700 dark:text-neutral-200 font-medium break-words">
                          {coll}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Lexical occurrence analysis */}
              <div className="p-4 bg-white/80 dark:bg-neutral-900/60 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400 tracking-wider break-words">Example · {selectedWord.source_name}</span>
                <p className="italic text-[12px] leading-relaxed break-words">"{selectedWord.example}"</p>
                {selectedWord.translation_pinyin && (
                  <p className="text-[11px] font-sans text-neutral-600 dark:text-neutral-400 break-words">Pinyin: <strong className="font-normal font-mono text-indigo-700 dark:text-indigo-300">{selectedWord.translation_pinyin}</strong></p>
                )}
              </div>

            </div>
          ) : (
            <div className="h-full py-16 flex flex-col items-center justify-center text-center space-y-4 max-w-sm mx-auto relative z-10">
              <Share2 className="h-10 w-10 text-neutral-600 animate-spin shrink-0 stroke-[1.2]" />
              <div>
                <h3 className="text-sm font-black font-mono text-neutral-700 dark:text-neutral-300">No word selected</h3>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed mt-1">Add a word to the deck, then pick it to see synonyms, antonyms, and collocations.</p>
              </div>
            </div>
          )}

          <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 text-[11px] text-neutral-500 dark:text-neutral-400 font-mono flex flex-wrap items-center justify-between gap-2 relative z-10">
            <span>Word relationships</span>
            <span>Synonyms, antonyms, collocations</span>
          </div>
        </div>
      </div>
    </div>
  );
}
