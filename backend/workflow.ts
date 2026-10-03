import { addWorkflowLog } from "./db";
import type { AgentStep } from "./agent";

function describeService(title: string): string {
  if (/tavily|web|grounding|source/i.test(title)) return "Web search";
  if (/dict|wiktionary|dictionary/i.test(title)) return "Dictionary API";
  if (/qwen/i.test(title)) return "Qwen";
  if (/groq|grok/i.test(title)) return "Groq";
  if (/gemini|parsing|synthesis|interpreter/i.test(title)) return "Gemini";
  if (/translat/i.test(title)) return "Translation";
  return "LexiFlow";
}

export function recordLookupWorkflow(
  word: string,
  logs: AgentStep[],
  startedAt: number,
  success: boolean
): void {
  const elapsed = Math.max(1, Date.now() - startedAt);
  const count = Math.max(logs.length, 1);
  const steps = (logs || []).map((step) => ({
    status: step.title,
    detail: step.detail,
    timestamp: step.timestamp,
    durationMs: Math.round(elapsed / count),
    apiUsed: describeService(step.title),
    tokensConsumed: 0,
  }));

  addWorkflowLog({
    id: "wf-" + Math.random().toString(36).substring(2, 9),
    word: word.trim().toLowerCase(),
    timestamp: new Date().toISOString(),
    totalDurationMs: elapsed,
    success,
    steps,
  });
}
