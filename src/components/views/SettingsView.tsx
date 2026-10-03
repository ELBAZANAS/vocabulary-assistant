import { Cpu, Database } from "lucide-react";
import { UserPreferences } from "../../types";

interface SettingsViewProps {
  preferences: UserPreferences;
  diagnosticsLoading: boolean;
  diagnosticsResult: any;
  onProviderChange: (provider: string) => void;
  onRunDiagnostics: () => void;
}

export default function SettingsView({
  preferences,
  diagnosticsLoading,
  diagnosticsResult,
  onProviderChange,
  onRunDiagnostics,
}: SettingsViewProps) {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-[2rem] space-y-6">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              <Cpu className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
              Language model
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
              Keys stay in <code className="font-mono">.env</code> on this computer. Copy <code className="font-mono">.env.example</code>, paste your key, then restart the app.
            </p>
          </div>

          <ol className="text-[11px] leading-relaxed text-neutral-700 dark:text-neutral-300 space-y-1.5 list-decimal pl-4">
            <li><span className="font-mono">GEMINI_API_KEY</span> from Google AI Studio</li>
            <li><span className="font-mono">QWEN_API_KEY</span> from DashScope</li>
            <li><span className="font-mono">GROQ_API_KEY</span> from the Groq console</li>
            <li><span className="font-mono">TAVILY_API_KEY</span> is optional, for web example sentences</li>
          </ol>

          <select
            id="llm-provider-select"
            className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm font-semibold text-neutral-900 dark:text-white"
            value={preferences.provider}
            onChange={(e) => onProviderChange(e.target.value)}
          >
            <option value="gemini">Google Gemini</option>
            <option value="qwen">Alibaba Qwen-Plus</option>
            <option value="groq">Groq Llama 3.3</option>
            <option value="offline">Offline dictionary fallback</option>
          </select>

          <div className="p-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-[11px] leading-relaxed font-medium text-neutral-700 dark:text-neutral-300">
            <p>
              <strong>Key status:</strong>{" "}
              {preferences.provider === "offline"
                ? "Offline mode is on. Lookups use the public dictionary and Google Translate, not a paid LLM."
                : preferences.api_key_status
                  ? "A key is present for this provider."
                  : "No usable key — lookups will use the free dictionary fallback."}
            </p>
          </div>

          <div className="pt-4 border-t border-dashed border-neutral-200 dark:border-neutral-800 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold">Connection check</span>
              <button
                type="button"
                onClick={onRunDiagnostics}
                disabled={diagnosticsLoading}
                className="px-3 py-1.5 text-xs font-bold rounded-xl text-white dark:text-neutral-900 bg-neutral-900 dark:bg-neutral-100 disabled:opacity-60"
              >
                {diagnosticsLoading ? "Checking…" : "Test API keys"}
              </button>
            </div>
            {diagnosticsResult && (
              <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-xs font-mono space-y-2 text-neutral-800 dark:text-neutral-200">
                {diagnosticsResult.error ? (
                  <p className="text-rose-600 dark:text-rose-400 font-bold">{diagnosticsResult.error}</p>
                ) : (
                  ["gemini", "qwen", "groq"].map((key) => diagnosticsResult[key] && (
                    <p key={key}>
                      <span className="uppercase text-[10px] text-neutral-500">{key}: </span>
                      {diagnosticsResult[key].message}
                    </p>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-[2rem] space-y-6">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              <Database className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
              Data & privacy
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
              Your deck lives in a JSON file on this computer. Nothing is uploaded except the requests you send to the LLM you configure.
            </p>
          </div>
          <div className="p-3.5 bg-neutral-50 dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-xs space-y-2 text-neutral-700 dark:text-neutral-300">
            <p><span className="font-bold block">Deck file</span><span className="font-mono text-[10px] text-neutral-500">data/vocabulary.json</span></p>
            <p><span className="font-bold block">Command console</span>Use <code className="font-mono">add</code>, <code className="font-mono">deck</code>, <code className="font-mono">due</code>, and <code className="font-mono">quiz</code> from the Commands page — they call the same APIs as the rest of the app.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
