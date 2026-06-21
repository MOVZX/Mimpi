import { ChevronDown, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

interface CollapseSectionProps {
  title: string;
  emoji: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function CollapseSection({
  title,
  emoji,
  open,
  onToggle,
  children,
}: CollapseSectionProps) {
  return (
    <div className="bg-white dark:bg-surface-900/80 rounded-xl border border-surface-200/80 dark:border-surface-700/80 shadow-sm">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-sm font-semibold text-surface-800 dark:text-surface-100"
      >
        <span className="flex items-center gap-2">
          {emoji} {title}
        </span>
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-surface-200 dark:border-surface-700 pt-3">
          {children}
        </div>
      )}
    </div>
  );
}
