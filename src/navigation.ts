import type { LucideIcon } from "lucide-react";
import {
  BookOpen, Sparkles, Layers, Brain, Terminal,
  GraduationCap, Cpu, LayoutDashboard, Settings,
  Compass, Swords, Bot, Wand2, Globe
} from "lucide-react";

export type ActiveTab =
  | "landing"
  | "dashboard"
  | "vocabulary"
  | "search_agent"
  | "review"
  | "quiz"
  | "commands"
  | "monitor"
  | "settings"
  | "word_journey"
  | "ai_tutor"
  | "story_forge"
  | "word_duel"
  | "constellation";

export interface NavItem {
  id: ActiveTab;
  label: string;
  icon: LucideIcon;
}

export const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Start",
    items: [
      { id: "landing", label: "Welcome", icon: GraduationCap },
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "vocabulary", label: "Word deck", icon: BookOpen },
      { id: "search_agent", label: "Add words", icon: Sparkles },
    ],
  },
  {
    title: "Practice",
    items: [
      { id: "review", label: "Flashcards", icon: Layers },
      { id: "quiz", label: "Quiz", icon: Brain },
      { id: "word_duel", label: "Word duel", icon: Swords },
    ],
  },
  {
    title: "Create",
    items: [
      { id: "ai_tutor", label: "AI tutor", icon: Bot },
      { id: "story_forge", label: "Story forge", icon: Wand2 },
      { id: "word_journey", label: "Journey", icon: Compass },
      { id: "constellation", label: "Constellation", icon: Globe },
    ],
  },
  {
    title: "System",
    items: [
      { id: "commands", label: "Commands", icon: Terminal },
      { id: "monitor", label: "Activity log", icon: Cpu },
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
];
