import type { GenerationMode } from "./generate/utils";

interface GenerateModeSwitcherProps {
  mode: GenerationMode;
  onModeChange: (mode: GenerationMode) => void;
}

export function GenerateModeSwitcher({
  mode,
  onModeChange,
}: GenerateModeSwitcherProps) {
  return (
    <div className="bg-white dark:bg-surface-900/80 rounded-xl border border-surface-200/80 dark:border-surface-700/80 p-4 shadow-sm">
      <div className="flex bg-surface-100 dark:bg-surface-800 rounded-lg p-0.5">
        <button
          type="button"
          onClick={() => onModeChange("zimage")}
          className={`flex-1 px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
            mode === "zimage"
              ? "bg-primary-500 text-white shadow-sm"
              : "text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200"
          }`}
        >
          Z-Image
        </button>
        <button
          type="button"
          onClick={() => onModeChange("sdxl")}
          className={`flex-1 px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
            mode === "sdxl"
              ? "bg-primary-500 text-white shadow-sm"
              : "text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200"
          }`}
        >
          SDXL
        </button>
      </div>
    </div>
  );
}
