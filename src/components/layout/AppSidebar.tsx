import { NAV_SECTIONS, type ActiveTab } from "../../navigation";

interface AppSidebarProps {
  activeTab: ActiveTab;
  onSelect: (tab: ActiveTab) => void;
  studentName?: string;
  studentId?: string;
}

export default function AppSidebar({ activeTab, onSelect, studentName, studentId }: AppSidebarProps) {
  return (
    <nav className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-150/65 dark:border-neutral-800/80 p-3 shadow-xs space-y-1.5" aria-label="Main">
      {studentName && (
        <div className="flex items-center gap-2.5 px-2 py-2 mb-2">
          <div className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-sm">
            {studentName.charAt(0).toUpperCase()}
          </div>
          <div className="truncate text-xs">
            <span className="block font-bold">{studentName}</span>
            {studentId && <span className="font-mono text-neutral-450 text-[10px]">{studentId}</span>}
          </div>
        </div>
      )}

      {NAV_SECTIONS.map((section) => (
        <div key={section.title}>
          <span className="text-[10px] font-extrabold uppercase text-neutral-400 tracking-wider block px-2.5 pt-3 pb-1">
            {section.title}
          </span>
          {section.items.map((tab) => {
            const Icon = tab.icon;
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelect(tab.id)}
                className={`w-full py-2.5 px-3 rounded-2xl text-xs font-bold gap-2.5 inline-flex items-center text-left transition-all ${
                  selected
                    ? "bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-sm"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-850"
                }`}
                aria-current={selected ? "page" : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
