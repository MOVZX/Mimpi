import { Sparkles } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { GenerationMode } from "./utils";

type SetState<T> = Dispatch<SetStateAction<T>>;

interface GeneratePromptCardProps {
  mode: GenerationMode;
  prompt: string;
  setPrompt: SetState<string>;
  negative?: string;
  setNegative?: SetState<string>;
  dynamicPrompt?: boolean;
  setDynamicPrompt?: SetState<boolean>;
  alwaysRandomisePreset?: boolean;
  setAlwaysRandomisePreset?: SetState<boolean>;
}

export function GeneratePromptCard({
  mode,
  prompt,
  setPrompt,
  negative = "",
  setNegative,
  dynamicPrompt = false,
  setDynamicPrompt,
  alwaysRandomisePreset = false,
  setAlwaysRandomisePreset,
}: GeneratePromptCardProps) {
  return (
    <div className="bg-white dark:bg-surface-900/80 rounded-xl border border-surface-200/80 dark:border-surface-700/80 p-4 space-y-3 shadow-sm">
      <h2 className="text-sm font-semibold text-surface-800 dark:text-surface-100 flex items-center gap-2">
        <Sparkles size={16} className="text-primary-500" /> Generate Image
      </h2>
      <div>
        <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
          Deskripsi Gambar (Positif)
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          className="w-full text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder-surface-400"
          placeholder="Masukkan deskripsi gambar..."
        />
      </div>
      {mode !== "zimage" && (
        <div>
          <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
            Hindari (Negatif)
          </label>
          <textarea
            value={negative}
            onChange={(e) => setNegative?.(e.target.value)}
            rows={2}
            className="w-full text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder-surface-400"
            placeholder="Hal-hal yang ingin dihindari..."
          />
        </div>
      )}
      {mode === "sdxl" && (
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={dynamicPrompt}
              onChange={(e) => setDynamicPrompt?.(e.target.checked)}
              className="w-3.5 h-3.5 accent-primary-500"
            />
            <span className="text-xs text-surface-600 dark:text-surface-300">
              Acak tema, gaya, dan lokasi?
            </span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={alwaysRandomisePreset}
              onChange={(e) => setAlwaysRandomisePreset?.(e.target.checked)}
              className="w-3.5 h-3.5 accent-primary-500"
            />
            <span className="text-xs text-surface-600 dark:text-surface-300">
              Acak Preset?
            </span>
          </label>
        </div>
      )}
    </div>
  );
}
