import React, { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import { VocabularyWord, WorkflowLog, ReviewLog, QuizHistoryItem, UserPreferences, AgentStep } from "./types";
import { apiJson } from "./lib/api";
import { type ActiveTab } from "./navigation";
import AppHeader from "./components/layout/AppHeader";
import AppSidebar from "./components/layout/AppSidebar";
import LandingView from "./components/views/LandingView";
import DashboardView from "./components/views/DashboardView";
import MonitorView from "./components/views/MonitorView";
import SettingsView from "./components/views/SettingsView";
import VocabularyTab from "./components/VocabularyTab";
import SearchAgentTab from "./components/SearchAgentTab";
import ReviewTab from "./components/ReviewTab";
import QuizTab from "./components/QuizTab";
import CommandConsoleTab from "./components/CommandConsoleTab";
import WordJourneyTab from "./components/WordJourneyTab";
import AITutorTab from "./components/AITutorTab";
import StoryForgeTab from "./components/StoryForgeTab";
import WordDuelTab from "./components/WordDuelTab";
import ConstellationTab from "./components/ConstellationTab";

const PROFILE_KEY = "lexiflow-profile";

export default function App() {
  const storedProfile = (() => {
    try {
      return JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
    } catch {
      return null;
    }
  })();

  const [activeTab, setActiveTab] = useState<ActiveTab>(storedProfile?.registered ? "dashboard" : "landing");
  const [navOpen, setNavOpen] = useState(false);
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [reviewLogs, setReviewLogs] = useState<ReviewLog[]>([]);
  const [workflowLogs, setWorkflowLogs] = useState<WorkflowLog[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizHistoryItem[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>({ provider: "gemini", api_key_status: true });
  const [diagnosticsLoading, setDiagnosticsLoading] = useState(false);
  const [diagnosticsResult, setDiagnosticsResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => localStorage.getItem("theme") === "dark");
  const [studentName, setStudentName] = useState(storedProfile?.name || "");
  const [studentId, setStudentId] = useState(storedProfile?.id || "");
  const [isRegistered, setIsRegistered] = useState(Boolean(storedProfile?.registered));
  const [loginMessage, setLoginMessage] = useState("");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    document.documentElement.style.colorScheme = isDarkMode ? "dark" : "light";
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const fetchVocabulary = async () => {
    try {
      const data = await apiJson<{
        success: boolean;
        words: VocabularyWord[];
        logs: ReviewLog[];
        workflowLogs: WorkflowLog[];
        quizHistory: QuizHistoryItem[];
        preferences: UserPreferences;
      }>("/api/vocabulary");
      setWords(data.words || []);
      setReviewLogs(data.logs || []);
      setWorkflowLogs(data.workflowLogs || []);
      setQuizHistory(data.quizHistory || []);
      if (data.preferences) setPreferences(data.preferences);
      setLoadError("");
    } catch (err: any) {
      setLoadError(err.message || "Could not load the vocabulary deck.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVocabulary();
  }, []);

  const persistProfile = (name: string, id: string) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ name, id, registered: true }));
    setIsRegistered(true);
    setActiveTab("dashboard");
    setNavOpen(false);
  };

  const handleAddWord = async (word: string) => {
    try {
      const data = await apiJson<{ success: boolean; wordData?: VocabularyWord; logs?: AgentStep[]; error?: string }>(
        "/api/vocabulary/add",
        { method: "POST", body: JSON.stringify({ word }) }
      );
      await fetchVocabulary();
      return data;
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const handleDeleteWord = async (word: string) => {
    try {
      await apiJson("/api/vocabulary/delete", { method: "DELETE", body: JSON.stringify({ word }) });
      await fetchVocabulary();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateWord = async (word: string, updates: Partial<VocabularyWord>) => {
    try {
      await apiJson("/api/vocabulary/update", { method: "POST", body: JSON.stringify({ word, updates }) });
      await fetchVocabulary();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewSubmit = async (word: string, isCorrect: boolean) => {
    try {
      await apiJson("/api/vocabulary/review", { method: "POST", body: JSON.stringify({ word, isCorrect }) });
      await fetchVocabulary();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePreferencesSubmit = async (provider: string) => {
    try {
      await apiJson("/api/preferences/update", { method: "POST", body: JSON.stringify({ provider }) });
      await fetchVocabulary();
    } catch (err) {
      console.error(err);
    }
  };

  const runDiagnostics = async () => {
    setDiagnosticsLoading(true);
    setDiagnosticsResult(null);
    try {
      const data = await apiJson<any>("/api/diagnostics/keys");
      setDiagnosticsResult({ gemini: data.gemini, qwen: data.qwen, groq: data.groq });
    } catch (err: any) {
      setDiagnosticsResult({ error: err.message || "Network error." });
    } finally {
      setDiagnosticsLoading(false);
    }
  };

  const handleStudentRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      setLoginMessage("Enter a name, or skip to start as a guest.");
      return;
    }
    persistProfile(studentName.trim(), studentId.trim());
    setLoginMessage("");
  };

  const averageLatency = workflowLogs.length > 0
    ? Math.round(workflowLogs.reduce((acc, curr) => acc + curr.totalDurationMs, 0) / workflowLogs.length)
    : 0;

  const selectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans flex flex-col antialiased">
      <a href="#main-workspace" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-white px-3 py-2 rounded-lg z-[60]">
        Skip to content
      </a>
      <AppHeader
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        onOpenNav={() => setNavOpen(true)}
        profileLabel={isRegistered ? studentName || "Signed in" : "Guest"}
      />

      {navOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          aria-label="Close navigation"
          onClick={() => setNavOpen(false)}
        />
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        <div className={`lg:w-64 shrink-0 ${navOpen ? "fixed inset-y-16 left-4 right-16 z-50 lg:static lg:inset-auto" : "hidden lg:block"}`}>
          <AppSidebar
            activeTab={activeTab}
            onSelect={selectTab}
            studentName={isRegistered ? studentName : undefined}
            studentId={isRegistered ? studentId : undefined}
          />
        </div>

        <div id="main-workspace" className="flex-1 min-w-0">
          {loading ? (
            <div className="h-[450px] flex flex-col items-center justify-center space-y-4 text-neutral-450">
              <div className="h-10 w-10 border-4 border-neutral-200 dark:border-neutral-800 border-t-neutral-950 dark:border-t-white rounded-full animate-spin" />
              <p className="text-xs font-mono font-bold tracking-wider">Loading your deck…</p>
            </div>
          ) : loadError ? (
            <div className="p-6 rounded-3xl border border-rose-200 bg-rose-50 text-rose-700 text-sm">
              {loadError}
              <button type="button" className="block mt-3 underline" onClick={() => { setLoading(true); fetchVocabulary(); }}>
                Retry
              </button>
            </div>
          ) : (
            <>
              {activeTab === "landing" && (
                <LandingView
                  studentName={studentName}
                  studentId={studentId}
                  loginMessage={loginMessage}
                  wordCount={words.length}
                  onNameChange={setStudentName}
                  onIdChange={setStudentId}
                  onSubmit={handleStudentRegister}
                  onGuest={() => persistProfile("Guest", "")}
                />
              )}
              {activeTab === "dashboard" && (
                <DashboardView words={words} reviewLogs={reviewLogs} quizHistory={quizHistory} workflowLogs={workflowLogs} />
              )}
              {activeTab === "vocabulary" && (
                <VocabularyTab words={words} onDeleteWord={handleDeleteWord} onUpdateWord={handleUpdateWord} workflowLogs={workflowLogs} reviewLogs={reviewLogs} />
              )}
              {activeTab === "search_agent" && (
                <SearchAgentTab onAddWord={handleAddWord} onRefreshWords={fetchVocabulary} />
              )}
              {activeTab === "review" && (
                <ReviewTab words={words} onReviewSubmit={handleReviewSubmit} />
              )}
              {activeTab === "quiz" && <QuizTab onRefreshWords={fetchVocabulary} />}
              {activeTab === "commands" && <CommandConsoleTab onRefreshWords={fetchVocabulary} />}
              {activeTab === "word_journey" && (
                <WordJourneyTab words={words} reviewLogs={reviewLogs} quizHistory={quizHistory} />
              )}
              {activeTab === "ai_tutor" && (
                <AITutorTab words={words} onRefreshVocabulary={fetchVocabulary} />
              )}
              {activeTab === "story_forge" && <StoryForgeTab words={words} />}
              {activeTab === "word_duel" && <WordDuelTab words={words} />}
              {activeTab === "constellation" && <ConstellationTab words={words} />}
              {activeTab === "monitor" && (
                <MonitorView
                  workflowLogs={workflowLogs}
                  reviewLogs={reviewLogs}
                  quizHistory={quizHistory}
                  preferences={preferences}
                  averageLatency={averageLatency}
                  onRefresh={fetchVocabulary}
                />
              )}
              {activeTab === "settings" && (
                <SettingsView
                  preferences={preferences}
                  diagnosticsLoading={diagnosticsLoading}
                  diagnosticsResult={diagnosticsResult}
                  onProviderChange={handlePreferencesSubmit}
                  onRunDiagnostics={runDiagnostics}
                />
              )}
            </>
          )}
        </div>
      </main>

      <footer className="border-t border-neutral-150/60 dark:border-neutral-800/80 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-mono">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            <span>LexiFlow</span>
          </div>
          <span className="text-neutral-500 dark:text-neutral-400">Local JSON deck · optional Gemini / Qwen / Groq keys</span>
        </div>
      </footer>
    </div>
  );
}
