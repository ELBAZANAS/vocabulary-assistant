import { Moon, Sun, Menu } from "lucide-react";

interface AppHeaderProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenNav: () => void;
  profileLabel: string;
}

export default function AppHeader({
  isDarkMode,
  onToggleTheme,
  onOpenNav,
  profileLabel,
}: AppHeaderProps) {
  return (
    <header className="bg-white/90 dark:bg-neutral-900/90 border-b border-neutral-150/60 dark:border-neutral-800/80 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenNav}
            className="lg:hidden p-2 rounded-xl border border-neutral-200 dark:border-neutral-800"
            aria-label="Open navigation"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="h-10 w-10 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 rounded-xl flex items-center justify-center font-black shrink-0">
            LF
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-extrabold tracking-tight text-neutral-950 dark:text-white leading-tight">
              LexiFlow
            </h1>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium truncate">
              English vocabulary, grounded examples, and review
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 text-[11px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 rounded-xl font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-bold">{profileLabel}</span>
          </div>
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2.5 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl border border-neutral-200/50 dark:border-neutral-750"
            title={isDarkMode ? "Switch to light theme" : "Switch to dark theme"}
            aria-label="Toggle color theme"
          >
            {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
