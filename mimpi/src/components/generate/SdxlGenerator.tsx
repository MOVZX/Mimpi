import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  SAMPLERS,
  SCHEDULERS,
  UPSCALERS,
  useCollapse,
} from "@/constants/generation";
import { CollapseSection } from "@/components/CollapseSection";
import type { CheckpointCategory, CheckpointModel, PresetsData } from "@/types";
import {
  fetchCheckpoints,
  fetchPresets,
  fetchSdxlPresets,
  createSdxlPreset,
  updateSdxlPreset,
  deleteSdxlPreset,
  type SdxlPreset,
} from "@/services/mimpi";
import { GeneratePromptCard } from "./GeneratePromptCard";
import {
  type GenerationMode,
  type ResolutionSize,
  type SdxlGenerationState,
} from "./utils";

import type { Dispatch, SetStateAction } from "react";

type SetState<T> = Dispatch<SetStateAction<T>>;

interface PresetGroup {
  label: string;
  opts: { value: string; label: string }[];
}

export interface SdxlGeneratorHandle {
  prepareGenerate: () => SdxlGenerationState;
  updateSeed: (seed: string, currentSeedNum: number) => void;
  getInfo: () => {
    prompt: string;
    negative: string;
    model: string;
    sampler: string;
    scheduler: string;
    steps: number;
    cfg: number;
    seed: string;
    mode: GenerationMode;
  };
}

interface SdxlGeneratorProps {
  onCanGenerateChange: (canGenerate: boolean) => void;
  addToast: (message: string, type: "success" | "error") => void;
  selectedGallery: string;
  onSelectedGalleryChange: (name: string) => void;
  galleries: { id: number; name: string; created_at: string }[];
  galleryEditing: boolean;
  editingGalleryId: number | null;
  editGalleryName: string;
  onEditGalleryNameChange: (name: string) => void;
  onAddGallery: () => void;
  onEditGallery: () => void;
  onDeleteGallery: () => void;
  onSaveGallery: () => void;
  onCancelGallery: () => void;
}

export const SdxlGenerator = forwardRef<
  SdxlGeneratorHandle,
  SdxlGeneratorProps
>(function SdxlGenerator(
  {
    onCanGenerateChange,
    addToast,
    selectedGallery,
    onSelectedGalleryChange,
    galleries,
    galleryEditing,
    editGalleryName,
    onEditGalleryNameChange,
    onAddGallery,
    onEditGallery,
    onDeleteGallery,
    onSaveGallery,
    onCancelGallery,
  },
  ref,
) {
  const [prompt, setPrompt] = useState(
    () =>
      localStorage.getItem("mimpi_prompt") ||
      "1girl, solo, 30yo beautiful asian woman, black hair, pale skin, wearing casual t-shirts and blue jeans, bedroom, intricate details, dynamic pose, looking at viewer, portrait, full upper body close view",
  );
  const [negative, setNegative] = useState(
    () =>
      localStorage.getItem("mimpi_negative") ||
      "worst quality, low quality, illustration, 3d, 2d, painting, cartoons, sketch, bad hands, bad fingers, bad anatomy, average quality",
  );
  const [dynamicPrompt, setDynamicPrompt] = useState(
    () => localStorage.getItem("mimpi_dynamicPrompt") === "true",
  );
  const [alwaysRandomisePreset, setAlwaysRandomisePreset] = useState(
    () => localStorage.getItem("mimpi_alwaysRandomisePreset") === "true",
  );
  const [mainPreset, setMainPreset] = useState(
    () => localStorage.getItem("mimpi_mainPreset") || "none",
  );
  const [subcategory, setSubcategory] = useState(
    () => localStorage.getItem("mimpi_subcategory") || "",
  );
  const [imageMode, setImageMode] = useState<ResolutionSize>(
    () =>
      (localStorage.getItem("mimpi_imageMode") as ResolutionSize) || "portrait",
  );

  const [sdxlPresets, setSdxlPresets] = useState<SdxlPreset[]>([]);
  const [selectedSdxlPresetId, setSelectedSdxlPresetId] = useState<
    number | null
  >(() => {
    const v = localStorage.getItem("mimpi_sdxlPresetId");
    return v ? Number(v) || null : null;
  });
  const [sdxlEditing, setSdxlEditing] = useState(false);
  const [sdxlEditingId, setSdxlEditingId] = useState<number | null>(null);
  const [sdxlEditTitle, setSdxlEditTitle] = useState("");
  const [sdxlEditPrompt, setSdxlEditPrompt] = useState("");

  const [checkpoint, setCheckpoint] = useState(
    () => localStorage.getItem("mimpi_checkpoint") || "",
  );
  const [sampler, setSampler] = useState(
    () => localStorage.getItem("mimpi_sampler") || "lcm",
  );
  const [scheduler, setScheduler] = useState(
    () => localStorage.getItem("mimpi_scheduler") || "exponential",
  );
  const [useDMD2, setUseDMD2] = useState(
    () => localStorage.getItem("mimpi_useDMD2") === "true",
  );
  const [useLoRA, setUseLoRA] = useState(
    () => localStorage.getItem("mimpi_useLoRA") === "true",
  );
  const [lora1, setLora1] = useState(
    () => localStorage.getItem("mimpi_lora1") !== "false",
  );
  const [lora2, setLora2] = useState(
    () => localStorage.getItem("mimpi_lora2") !== "false",
  );
  const [lora3, setLora3] = useState(
    () => localStorage.getItem("mimpi_lora3") !== "false",
  );
  const [useCustomClip, setUseCustomClip] = useState(
    () => localStorage.getItem("mimpi_useCustomClip") === "true",
  );
  const [useClipSkip, setUseClipSkip] = useState(
    () => localStorage.getItem("mimpi_useClipSkip") !== "false",
  );
  const [clipSkipVal, setClipSkipVal] = useState(() =>
    parseInt(localStorage.getItem("mimpi_clipSkipVal") || "-2"),
  );
  const [useUpscale, setUseUpscale] = useState(
    () => localStorage.getItem("mimpi_useUpscale") === "true",
  );
  const [upscaler, setUpscaler] = useState(
    () => localStorage.getItem("mimpi_upscaler") || "4x-ClearRealityV1.pth",
  );
  const [useDynamicSeed, setUseDynamicSeed] = useState(
    () => localStorage.getItem("mimpi_useDynamicSeed") !== "false",
  );
  const [useIncSeed, setUseIncSeed] = useState(() => {
    const val = localStorage.getItem("mimpi_useIncSeed");
    return val === null || val === "true";
  });
  const [steps, setSteps] = useState(() =>
    parseInt(localStorage.getItem("mimpi_steps") || "10"),
  );
  const [cfg, setCfg] = useState(() =>
    parseFloat(localStorage.getItem("mimpi_cfg") || "1"),
  );
  const [seed, setSeed] = useState(
    () => localStorage.getItem("mimpi_seed") || "",
  );
  const [currentSeedNum, setCurrentSeedNum] = useState(() =>
    parseInt(localStorage.getItem("mimpi_currentSeedNum") || "0"),
  );

  const [categories, setCategories] = useState<CheckpointCategory[]>([]);
  const [presets, setPresets] = useState<PresetsData>({});

  const [temaOpen, toggleTema] = useCollapse("tema", true);
  const [modelOpen, toggleModel] = useCollapse("model", true);
  const [advancedOpen, toggleAdvanced] = useCollapse("advanced", true);
  const [galleryOpen, toggleGallery] = useCollapse("sdxl-gallery", true);

  useEffect(() => {
    fetchCheckpoints()
      .then((cats) => {
        setCategories(cats);
        if (!checkpoint) {
          for (const cat of cats)
            for (const m of cat.models) {
              if (m.filename.includes("jibMixRealisticXL")) {
                applyMap(m);
                setCheckpoint(m.filename);
                return;
              }
            }
          if (cats[0]?.models[0]) {
            setCheckpoint(cats[0].models[0].filename);
            applyMap(cats[0].models[0]);
          }
        }
      })
      .catch(() => addToast("Gagal memuat checkpoint", "error"));
    fetchPresets()
      .then(setPresets)
      .catch(() => addToast("Gagal memuat presets", "error"));
    fetchSdxlPresets()
      .then((presets) => {
        setSdxlPresets(presets);
        setSelectedSdxlPresetId((prev) => {
          if (prev !== null && !presets.find((p) => p.id === prev)) {
            localStorage.removeItem("mimpi_sdxlPresetId");
            return null;
          }
          return prev;
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => localStorage.setItem("mimpi_prompt", prompt), [prompt]);
  useEffect(
    () =>
      localStorage.setItem(
        "mimpi_sdxlPresetId",
        String(selectedSdxlPresetId ?? ""),
      ),
    [selectedSdxlPresetId],
  );
  useEffect(() => localStorage.setItem("mimpi_negative", negative), [negative]);
  useEffect(
    () => localStorage.setItem("mimpi_dynamicPrompt", String(dynamicPrompt)),
    [dynamicPrompt],
  );
  useEffect(
    () =>
      localStorage.setItem(
        "mimpi_alwaysRandomisePreset",
        String(alwaysRandomisePreset),
      ),
    [alwaysRandomisePreset],
  );
  useEffect(
    () => localStorage.setItem("mimpi_mainPreset", mainPreset),
    [mainPreset],
  );
  useEffect(
    () => localStorage.setItem("mimpi_subcategory", subcategory),
    [subcategory],
  );
  useEffect(
    () => localStorage.setItem("mimpi_imageMode", imageMode),
    [imageMode],
  );
  useEffect(
    () => localStorage.setItem("mimpi_checkpoint", checkpoint),
    [checkpoint],
  );
  useEffect(() => localStorage.setItem("mimpi_sampler", sampler), [sampler]);
  useEffect(
    () => localStorage.setItem("mimpi_scheduler", scheduler),
    [scheduler],
  );
  useEffect(
    () => localStorage.setItem("mimpi_useDMD2", String(useDMD2)),
    [useDMD2],
  );
  useEffect(
    () => localStorage.setItem("mimpi_useLoRA", String(useLoRA)),
    [useLoRA],
  );
  useEffect(() => localStorage.setItem("mimpi_lora1", String(lora1)), [lora1]);
  useEffect(() => localStorage.setItem("mimpi_lora2", String(lora2)), [lora2]);
  useEffect(() => localStorage.setItem("mimpi_lora3", String(lora3)), [lora3]);
  useEffect(
    () => localStorage.setItem("mimpi_useCustomClip", String(useCustomClip)),
    [useCustomClip],
  );
  useEffect(
    () => localStorage.setItem("mimpi_useClipSkip", String(useClipSkip)),
    [useClipSkip],
  );
  useEffect(
    () => localStorage.setItem("mimpi_clipSkipVal", String(clipSkipVal)),
    [clipSkipVal],
  );
  useEffect(
    () => localStorage.setItem("mimpi_useUpscale", String(useUpscale)),
    [useUpscale],
  );
  useEffect(() => localStorage.setItem("mimpi_upscaler", upscaler), [upscaler]);
  useEffect(
    () => localStorage.setItem("mimpi_useDynamicSeed", String(useDynamicSeed)),
    [useDynamicSeed],
  );
  useEffect(
    () => localStorage.setItem("mimpi_useIncSeed", String(useIncSeed)),
    [useIncSeed],
  );
  useEffect(() => localStorage.setItem("mimpi_steps", String(steps)), [steps]);
  useEffect(() => localStorage.setItem("mimpi_cfg", String(cfg)), [cfg]);
  useEffect(() => localStorage.setItem("mimpi_seed", seed), [seed]);
  useEffect(
    () => localStorage.setItem("mimpi_currentSeedNum", String(currentSeedNum)),
    [currentSeedNum],
  );

  useEffect(() => {
    onCanGenerateChange(Boolean(prompt.trim()));
  }, [prompt, onCanGenerateChange]);

  useImperativeHandle(
    ref,
    () => ({
      prepareGenerate: () => {
        let nextPrompt = prompt;
        if (alwaysRandomisePreset) {
          const allEntries: { type: string; key: string }[] = [];
          Object.entries(presets).forEach(([type, data]) => {
            if (data)
              Object.keys(data).forEach((k) =>
                allEntries.push({ type, key: k }),
              );
          });
          if (allEntries.length > 0) {
            const pick =
              allEntries[Math.floor(Math.random() * allEntries.length)];
            const val = `${pick.type}:${pick.key}`;
            const data = presets[pick.type as keyof PresetsData];
            const pkeys = data?.[pick.key]
              ? Object.keys(data[pick.key].prompts)
              : [];
            if (pkeys.length > 0) {
              const sp = pkeys[Math.floor(Math.random() * pkeys.length)];
              nextPrompt = data![pick.key].prompts[sp];
              setMainPreset(val);
              setSubcategory(sp);
              setPrompt(nextPrompt);
            }
          }
        }
        return {
          prompt: nextPrompt,
          negative,
          checkpoint,
          sampler,
          scheduler,
          steps,
          cfg,
          imageMode,
          dynamicPrompt,
          useDMD2,
          useLoRA,
          lora1,
          lora2,
          lora3,
          useClipSkip,
          clipSkipVal,
          useCustomClip,
          useUpscale,
          upscaler,
          useDynamicSeed,
          useIncSeed,
          seed,
          currentSeedNum,
        };
      },
      updateSeed: (seed: string, currentSeedNum: number) => {
        setSeed(seed);
        setCurrentSeedNum(currentSeedNum);
      },
      getInfo: () => ({
        prompt,
        negative,
        model: checkpoint,
        sampler,
        scheduler,
        steps,
        cfg,
        seed: seed || String(currentSeedNum),
        mode: "sdxl" as const,
      }),
    }),
    [
      prompt,
      negative,
      checkpoint,
      sampler,
      scheduler,
      steps,
      cfg,
      imageMode,
      dynamicPrompt,
      useDMD2,
      useLoRA,
      lora1,
      lora2,
      lora3,
      useClipSkip,
      clipSkipVal,
      useCustomClip,
      useUpscale,
      upscaler,
      useDynamicSeed,
      useIncSeed,
      seed,
      currentSeedNum,
      alwaysRandomisePreset,
      presets,
      setMainPreset,
      setSubcategory,
      setPrompt,
    ],
  );

  const applyMap = (model: CheckpointModel) => {
    const m = (model as any).mapping;
    if (!m) return;
    if (m.sampler) setSampler(m.sampler);
    if (m.scheduler) setScheduler(m.scheduler);
    if (m.dmd2 !== undefined) setUseDMD2(m.dmd2);
    if (m.lora !== undefined) setUseLoRA(m.lora);
    if (m.clip !== undefined) setUseClipSkip(m.clip);
    if (m.clipskip !== undefined) setClipSkipVal(m.clipskip);
    if (m.steps !== undefined) setSteps(m.steps);
    if (m.cfg !== undefined) setCfg(m.cfg);
  };

  const handleCheckpointChange = (fname: string) => {
    setCheckpoint(fname);
    for (const cat of categories)
      for (const m of cat.models) {
        if (m.filename === fname) {
          applyMap(m);
          return;
        }
      }
  };

  const handleMainPresetChange = (val: string) => {
    setMainPreset(val);
    setSubcategory("");
    if (val === "none") return;
    const [type, key] = val.split(":");
    const data = presets[type as keyof PresetsData];
    if (!data?.[key]) return;
    const keys = Object.keys(data[key].prompts);
    if (keys.length > 0) {
      setSubcategory(keys[0]);
      setPrompt(data[key].prompts[keys[0]]);
    }
  };

  const handleSubcategoryChange = (val: string) => {
    setSubcategory(val);
    if (mainPreset === "none") return;
    const [type, key] = mainPreset.split(":");
    const data = presets[type as keyof PresetsData];
    if (data?.[key]?.prompts[val]) setPrompt(data[key].prompts[val]);
  };

  const handleSelectSdxlPreset = (id: number | null) => {
    setSelectedSdxlPresetId(id);
    if (id === null) return;
    const preset = sdxlPresets.find((p) => p.id === id);
    if (!preset) return;
    setPrompt(preset.prompt);
    if (preset.negative) setNegative(preset.negative);
    if (preset.model) setCheckpoint(preset.model);
    if (preset.sampler) setSampler(preset.sampler);
    if (preset.scheduler) setScheduler(preset.scheduler);
    if (preset.steps) setSteps(preset.steps);
    if (preset.cfg) setCfg(preset.cfg);
    if (preset.res_mode) setImageMode(preset.res_mode as ResolutionSize);
    setSdxlEditTitle(preset.title);
    setSdxlEditPrompt(preset.prompt);
  };

  const handleAddSdxlPreset = () => {
    setSelectedSdxlPresetId(null);
    setSdxlEditing(true);
    setSdxlEditTitle("");
    setSdxlEditPrompt(prompt);
  };

  const handleEditSdxlPreset = () => {
    if (!selectedSdxlPresetId) return;
    const preset = sdxlPresets.find((p) => p.id === selectedSdxlPresetId);
    if (!preset) return;
    setSdxlEditing(true);
    setSdxlEditingId(selectedSdxlPresetId);
    setSdxlEditTitle(preset.title);
    setSdxlEditPrompt(preset.prompt);
  };

  const handleCancelSdxlEdit = () => setSdxlEditing(false);

  const handleSaveSdxlPreset = async () => {
    if (!sdxlEditTitle.trim()) return;
    const isEditing = sdxlEditingId !== null;
    const ok = isEditing
      ? await updateSdxlPreset(sdxlEditingId, {
          title: sdxlEditTitle.trim(),
          prompt: sdxlEditPrompt || prompt,
          negative,
          model: checkpoint,
          sampler,
          scheduler,
          steps,
          cfg,
          res_mode: imageMode,
        })
      : await createSdxlPreset({
          title: sdxlEditTitle.trim(),
          prompt: sdxlEditPrompt || prompt,
          negative,
          model: checkpoint,
          sampler,
          scheduler,
          steps,
          cfg,
          res_mode: imageMode,
        });
    if (ok)
      addToast(
        isEditing ? "Preset diperbarui!" : "Preset tersimpan!",
        "success",
      );
    else addToast("Gagal simpan preset", "error");
    const fresh = await fetchSdxlPresets();
    setSdxlPresets(fresh);
    setSdxlEditing(false);
  };

  const handleDeleteSdxlPreset = async () => {
    if (!selectedSdxlPresetId) return;
    const ok = await deleteSdxlPreset(selectedSdxlPresetId);
    if (ok) addToast("Preset dihapus", "success");
    setSelectedSdxlPresetId(null);
    setSdxlEditTitle("");
    setSdxlEditPrompt("");
    const fresh = await fetchSdxlPresets();
    setSdxlPresets(fresh);
  };

  const presetGroups: PresetGroup[] = [];
  Object.entries(presets).forEach(([type, data]) => {
    if (!data) return;
    const gLabel =
      type === "general" ? "General" : type === "sfw" ? "SFW" : "NSFW";
    const opts = Object.entries(data).map(([k, v]) => ({
      value: `${type}:${k}`,
      label: (v as { label: string }).label,
    }));
    if (opts.length) presetGroups.push({ label: gLabel, opts });
  });

  return (
    <div className="flex flex-col gap-4">
      <GeneratePromptCard
        mode="sdxl"
        prompt={prompt}
        setPrompt={setPrompt}
        negative={negative}
        setNegative={setNegative}
        dynamicPrompt={dynamicPrompt}
        setDynamicPrompt={setDynamicPrompt}
        alwaysRandomisePreset={alwaysRandomisePreset}
        setAlwaysRandomisePreset={setAlwaysRandomisePreset}
      />

      <CollapseSection
        title="Tema & Mode"
        emoji="🎭"
        open={temaOpen}
        onToggle={toggleTema}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
                Preset
              </label>
              <select
                value={selectedSdxlPresetId ?? ""}
                onChange={(e) =>
                  handleSelectSdxlPreset(
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                className="w-full text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">Tidak Ada</option>
                {sdxlPresets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAddSdxlPreset}
              className="px-2.5 py-1.5 text-xs rounded-lg bg-primary-500 hover:bg-primary-600 text-white transition-colors"
              title="Tambah Preset"
            >
              <Plus size={14} />
            </button>
            <button
              onClick={handleEditSdxlPreset}
              disabled={!selectedSdxlPresetId}
              className="px-2.5 py-1.5 text-xs rounded-lg bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600 text-surface-700 dark:text-surface-300 disabled:opacity-40 transition-colors"
              title="Edit Preset"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={handleDeleteSdxlPreset}
              disabled={!selectedSdxlPresetId}
              className="px-2.5 py-1.5 text-xs rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-400 disabled:opacity-40 transition-colors"
              title="Hapus Preset"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {sdxlEditing && (
            <div className="space-y-2 border border-surface-200 dark:border-surface-700 rounded-lg p-3 bg-surface-50 dark:bg-surface-800/50">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
                  Judul
                </label>
                <input
                  type="text"
                  value={sdxlEditTitle}
                  onChange={(e) => setSdxlEditTitle(e.target.value)}
                  placeholder="Nama preset..."
                  className="w-full text-xs rounded-lg bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
                  Prompt
                </label>
                <textarea
                  value={sdxlEditPrompt}
                  onChange={(e) => setSdxlEditPrompt(e.target.value)}
                  rows={4}
                  placeholder="Isi prompt untuk preset ini..."
                  className="w-full text-xs rounded-lg bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder-surface-400"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={handleCancelSdxlEdit}
                  className="px-3 py-1 text-xs rounded-lg bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600 text-surface-700 dark:text-surface-300 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveSdxlPreset}
                  disabled={!sdxlEditTitle.trim()}
                  className="px-3 py-1 text-xs rounded-lg bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-40 transition-colors"
                >
                  Simpan
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
              Tema
            </label>
            <select
              value={mainPreset}
              onChange={(e) => handleMainPresetChange(e.target.value)}
              className="w-full text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="none">Tidak Ada</option>
              {presetGroups.map((g) => (
                <optgroup key={g.label} label={g.label}>
                  {g.opts.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          {mainPreset !== "none" && (
            <div>
              <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
                Preset
              </label>
              <select
                value={subcategory}
                onChange={(e) => handleSubcategoryChange(e.target.value)}
                className="w-full text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                {(() => {
                  const [t, k] = (mainPreset || "none").split(":");
                  const d = presets[t as keyof PresetsData];
                  if (!d?.[k]) return null;
                  return Object.keys(d[k].prompts).map((pk) => (
                    <option key={pk} value={pk}>
                      {k} {pk}
                    </option>
                  ));
                })()}
              </select>
            </div>
          )}
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
            Mode Gambar
          </label>
          <select
            value={imageMode}
            onChange={(e) => setImageMode(e.target.value as ResolutionSize)}
            className="w-full text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="portrait">Portrait (896×1152)</option>
            <option value="landscape">Landscape (1152×896)</option>
            <option value="square">Square (1024×1024)</option>
          </select>
        </div>
      </CollapseSection>

      {/* 🗂️ Gallery */}
      <CollapseSection
        title="Gallery"
        emoji="🗂️"
        open={galleryOpen}
        onToggle={toggleGallery}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
                Gallery
              </label>
              <select
                value={selectedGallery}
                onChange={(e) => onSelectedGalleryChange(e.target.value)}
                className="w-full text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">Tidak Ada</option>
                {galleries.map((g) => (
                  <option key={g.id} value={g.name}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={onAddGallery}
              className="px-2.5 py-1.5 text-xs rounded-lg bg-primary-500 hover:bg-primary-600 text-white transition-colors"
              title="Tambah Gallery"
            >
              <Plus size={14} />
            </button>
            <button
              onClick={onEditGallery}
              disabled={!selectedGallery}
              className="px-2.5 py-1.5 text-xs rounded-lg bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600 text-surface-700 dark:text-surface-300 disabled:opacity-40 transition-colors"
              title="Edit Gallery"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={onDeleteGallery}
              disabled={!selectedGallery}
              className="px-2.5 py-1.5 text-xs rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-400 disabled:opacity-40 transition-colors"
              title="Hapus Gallery"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {galleryEditing && (
            <div className="space-y-2 border border-surface-200 dark:border-surface-700 rounded-lg p-3 bg-surface-50 dark:bg-surface-800/50">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
                  Nama Gallery
                </label>
                <input
                  type="text"
                  value={editGalleryName}
                  onChange={(e) => onEditGalleryNameChange(e.target.value)}
                  placeholder="Nama gallery..."
                  className="w-full text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={onCancelGallery}
                  className="px-3 py-1 text-xs rounded-lg bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600 text-surface-700 dark:text-surface-300 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={onSaveGallery}
                  disabled={!editGalleryName.trim()}
                  className="px-3 py-1 text-xs rounded-lg bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-40 transition-colors"
                >
                  Simpan
                </button>
              </div>
            </div>
          )}
        </div>
      </CollapseSection>

      <CollapseSection
        title="Model"
        emoji="⚙️"
        open={modelOpen}
        onToggle={toggleModel}
      >
        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
              Checkpoint
            </label>
            <select
              value={checkpoint}
              onChange={(e) => handleCheckpointChange(e.target.value)}
              className="w-full text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              {categories.length === 0 && <option value="">Loading...</option>}
              {categories.map((cat) => (
                <optgroup key={cat.name} label={cat.name}>
                  {cat.models.map((m) => (
                    <option key={m.filename} value={m.filename}>
                      {m.displayName}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
                Sampler
              </label>
              <select
                value={sampler}
                onChange={(e) => setSampler(e.target.value)}
                className="w-full text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                {SAMPLERS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
                Scheduler
              </label>
              <select
                value={scheduler}
                onChange={(e) => setScheduler(e.target.value)}
                className="w-full text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                {SCHEDULERS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </CollapseSection>

      <CollapseSection
        title="Opsi Tingkat Lanjut"
        emoji="🔧"
        open={advancedOpen}
        onToggle={toggleAdvanced}
      >
        <div className="space-y-4">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={useDMD2}
              onChange={(e) => setUseDMD2(e.target.checked)}
              className="w-3.5 h-3.5 accent-primary-500"
            />
            <span className="text-xs text-surface-600 dark:text-surface-300">
              Gunakan DMD2?
            </span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={useLoRA}
              onChange={(e) => setUseLoRA(e.target.checked)}
              className="w-3.5 h-3.5 accent-primary-500"
            />
            <span className="text-xs text-surface-600 dark:text-surface-300">
              Gunakan LoRA?
            </span>
          </label>
          {useLoRA && (
            <div className="ml-5 space-y-1.5">
              {[
                { v: lora1, s: setLora1, l: "Detail Tweaker" },
                { v: lora2, s: setLora2, l: "Breast Slider" },
                { v: lora3, s: setLora3, l: "Beautify Supermodel" },
              ].map((x) => (
                <label
                  key={x.l}
                  className="flex items-center gap-1.5 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={x.v}
                    onChange={(e) => x.s(e.target.checked)}
                    className="w-3 h-3 accent-primary-500"
                  />
                  <span className="text-xs text-surface-500 dark:text-surface-400">
                    {x.l}
                  </span>
                </label>
              ))}
            </div>
          )}
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={useCustomClip}
              onChange={(e) => setUseCustomClip(e.target.checked)}
              className="w-3.5 h-3.5 accent-primary-500"
            />
            <span className="text-xs text-surface-600 dark:text-surface-300">
              Gunakan Custom CLIP?
            </span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={useClipSkip}
              onChange={(e) => setUseClipSkip(e.target.checked)}
              className="w-3.5 h-3.5 accent-primary-500"
            />
            <span className="text-xs text-surface-600 dark:text-surface-300">
              Gunakan CLIP Skip?
            </span>
          </label>
          {useClipSkip && (
            <div className="ml-5">
              <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
                CLIP Skip (-10 to -1)
              </label>
              <input
                type="number"
                min={-10}
                max={-1}
                value={clipSkipVal}
                onChange={(e) => setClipSkipVal(parseInt(e.target.value) || -2)}
                className="w-20 text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          )}
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={useUpscale}
              onChange={(e) => setUseUpscale(e.target.checked)}
              className="w-3.5 h-3.5 accent-primary-500"
            />
            <span className="text-xs text-surface-600 dark:text-surface-300">
              Gunakan Upscale?
            </span>
          </label>
          {useUpscale && (
            <div className="ml-5">
              <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
                Upscaler
              </label>
              <select
                value={upscaler}
                onChange={(e) => setUpscaler(e.target.value)}
                className="w-full max-w-xs text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                {UPSCALERS.map((u) => (
                  <option key={u} value={u}>
                    {u.replace(/\.pth$/, "").replace(/\.pt$/, "")}
                  </option>
                ))}
              </select>
            </div>
          )}
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={useDynamicSeed}
              onChange={(e) => {
                setUseDynamicSeed(e.target.checked);
                if (e.target.checked) {
                  setUseIncSeed(false);
                  setSeed("-1");
                }
              }}
              className="w-3.5 h-3.5 accent-primary-500"
            />
            <span className="text-xs text-surface-600 dark:text-surface-300">
              Acak Nomor Seed?
            </span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={useIncSeed}
              onChange={(e) => {
                setUseIncSeed(e.target.checked);
                if (e.target.checked) setUseDynamicSeed(false);
              }}
              disabled={useDynamicSeed}
              className="w-3.5 h-3.5 accent-primary-500"
            />
            <span className="text-xs text-surface-600 dark:text-surface-300">
              Gunakan Incremental Seed?
            </span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
                Steps
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={steps}
                onChange={(e) => setSteps(parseInt(e.target.value) || 8)}
                className="w-full text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
                CFG
              </label>
              <input
                type="number"
                min={1}
                max={30}
                step={0.1}
                value={cfg}
                onChange={(e) => setCfg(parseFloat(e.target.value) || 1)}
                className="w-full text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
                Seed
              </label>
              <input
                type="number"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="-1"
                className="w-full text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      </CollapseSection>
    </div>
  );
});
