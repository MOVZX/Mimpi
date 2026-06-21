import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { SAMPLERS, SCHEDULERS, useCollapse } from "@/constants/generation";
import { CollapseSection } from "@/components/CollapseSection";
import type { ZimagePreset } from "@/services/mimpi";
import {
  fetchZimageModels,
  fetchZimagePresets,
  createZimagePreset,
  updateZimagePreset,
  deleteZimagePreset,
} from "@/services/mimpi";
import { GeneratePromptCard } from "./GeneratePromptCard";
import {
  ZIMAGE_RESOLUTIONS,
  DEFAULT_ZIMAGE_LORAS,
  addZImageLora,
  moveZImageLora,
  normalizeLoraName,
  removeZImageLora,
  toggleZImageLora,
  updateZImageLoraStrength,
  type GenerationMode,
  type ZimageGenerationState,
  type ZimageLoraItem,
} from "./utils";

import type { Dispatch, SetStateAction } from "react";

type SetState<T> = Dispatch<SetStateAction<T>>;

export interface ZImageGeneratorHandle {
  prepareGenerate: () => ZimageGenerationState;
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

interface ZImageGeneratorProps {
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

export const ZImageGenerator = forwardRef<
  ZImageGeneratorHandle,
  ZImageGeneratorProps
>(function ZImageGenerator(
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
  const [zimagePrompt, setZimagePrompt] = useState(
    () =>
      localStorage.getItem("mimpi_zimagePrompt") ||
      "Gorgeous 36yo East Asian mature female QA Engineer & Tester, exuding a deeply alluring, sophisticated, and playfully seductive \"Chinese drama\" aura, sharp and captivating. Close-Up, camera close to her face, filling the frame with her features. Alluring MILF aura. Luxuriously thick and deeply sensual lips with red lipstick, slightly parted in a teasing, inviting manner. Fair, flawless porcelain skin with visible texture and pores, sharp Chinese-Korean mixed features (light-green eyes looking up at the camera, defined jawline, high cheekbones). She is leaning forward, looking up at the camera with an intense, alluring, and challenging gaze. Long, loose wavy jet black-blue hair cascading over one shoulder, partially framing her face. Wearing stylish thin gold-rimmed glasses, wearing the collar of a red-black button-up tight blouse widely open at the neck, revealing a thin gold chain necklace and a plump breasts. Office atmosphere: slight blurred background of a modern data center office with bokeh lights, creating a shallow depth of field. Balanced lighting: soft, warm light highlighting her facial features and the gloss of her lips, with subtle shadows adding dimension. Dark grey accent wall background with a dimly lit orange neon sign 'DarkNESS' visible as a soft blur in the background. White 'DarkNESS' logo slightly visible on her blouse collar — the logo and her face are perfectly centered. Hyper-realistic portrait, 8k, high detail.",
  );
  const [zimageNegative, setZimageNegative] = useState(
    () => localStorage.getItem("mimpi_zimageNegative") || "",
  );
  const [zimageModel, setZimageModel] = useState(
    () =>
      localStorage.getItem("mimpi_zimageModel") ||
      "Z-Image/beyondREALITY_V30.safetensors",
  );
  const [zimageSampler, setZimageSampler] = useState(
    () => localStorage.getItem("mimpi_zimageSampler") || "euler",
  );
  const [zimageScheduler, setZimageScheduler] = useState(
    () => localStorage.getItem("mimpi_zimageScheduler") || "simple",
  );
  const [zimageSteps, setZimageSteps] = useState(() =>
    parseInt(localStorage.getItem("mimpi_zimageSteps") || "10"),
  );
  const [zimageCfg, setZimageCfg] = useState(() =>
    parseFloat(localStorage.getItem("mimpi_zimageCfg") || "1"),
  );
  const [zimageSeed, setZimageSeed] = useState(
    () => localStorage.getItem("mimpi_zimageSeed") || "",
  );
  const [zimageCurrentSeedNum, setZimageCurrentSeedNum] = useState(() =>
    parseInt(localStorage.getItem("mimpi_zimageCurrentSeedNum") || "0"),
  );
  const [zimageUseDynamicSeed, setZimageUseDynamicSeed] = useState(
    () => localStorage.getItem("mimpi_zimageUseDynamicSeed") !== "false",
  );
  const [zimageUseIncSeed, setZimageUseIncSeed] = useState(
    () => localStorage.getItem("mimpi_zimageUseIncSeed") === "true",
  );
  const [zimageWidth, setZimageWidth] = useState(
    () => Number(localStorage.getItem("mimpi_zimageWidth")) || 896,
  );
  const [zimageHeight, setZimageHeight] = useState(
    () => Number(localStorage.getItem("mimpi_zimageHeight")) || 1152,
  );
  const [zimageResMode, setZimageResMode] = useState(
    () => localStorage.getItem("mimpi_zimageResMode") || "896×1152",
  );
  const [zimageLoras, setZimageLoras] = useState<ZimageLoraItem[]>(() => {
    try {
      const saved = localStorage.getItem("mimpi_zimageLoras");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to parse zimageLoras from localStorage:", e);
    }
    return DEFAULT_ZIMAGE_LORAS;
  });
  const [availableLoras, setAvailableLoras] = useState<string[]>([]);
  const [selectedLora, setSelectedLora] = useState<string>("");

  const [zimagePresets, setZimagePresets] = useState<ZimagePreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<number | null>(
    () => {
      const saved = localStorage.getItem("mimpi_selectedZimagePresetId");
      return saved ? Number(saved) : null;
    },
  );
  const [zimageEditing, setZimageEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrompt, setEditPrompt] = useState("");

  const [temaOpen, toggleTema] = useCollapse("tema", true);
  const [advancedOpen, toggleAdvanced] = useCollapse("advanced", true);
  const [zimageOpen, toggleZimage] = useCollapse("zimage", true);
  const [loraOpen, toggleLora] = useCollapse("lora", true);
  const [galleryOpen, toggleGallery] = useCollapse("zimage-gallery", true);

  useEffect(() => {
    fetchZimageModels().then((data) => setAvailableLoras(data.loras));
    fetchZimagePresets()
      .then((presets) => {
        setZimagePresets(presets);
        // Validate saved preset ID still exists
        setSelectedPresetId((prev) => {
          if (prev !== null && !presets.find((p) => p.id === prev)) {
            localStorage.removeItem("mimpi_selectedZimagePresetId");
            return null;
          }
          return prev;
        });
      })
      .catch((e) => console.warn("Failed to fetch zimage presets:", e));
  }, []);

  useEffect(
    () => localStorage.setItem("mimpi_zimagePrompt", zimagePrompt),
    [zimagePrompt],
  );
  useEffect(
    () => localStorage.setItem("mimpi_zimageNegative", zimageNegative),
    [zimageNegative],
  );
  useEffect(
    () => localStorage.setItem("mimpi_zimageModel", zimageModel),
    [zimageModel],
  );
  useEffect(
    () => localStorage.setItem("mimpi_zimageSampler", zimageSampler),
    [zimageSampler],
  );
  useEffect(
    () => localStorage.setItem("mimpi_zimageScheduler", zimageScheduler),
    [zimageScheduler],
  );
  useEffect(
    () => localStorage.setItem("mimpi_zimageSteps", String(zimageSteps)),
    [zimageSteps],
  );
  useEffect(
    () => localStorage.setItem("mimpi_zimageCfg", String(zimageCfg)),
    [zimageCfg],
  );
  useEffect(
    () => localStorage.setItem("mimpi_zimageSeed", zimageSeed),
    [zimageSeed],
  );
  useEffect(
    () =>
      localStorage.setItem(
        "mimpi_zimageCurrentSeedNum",
        String(zimageCurrentSeedNum),
      ),
    [zimageCurrentSeedNum],
  );
  useEffect(
    () =>
      localStorage.setItem(
        "mimpi_zimageUseDynamicSeed",
        String(zimageUseDynamicSeed),
      ),
    [zimageUseDynamicSeed],
  );
  useEffect(
    () =>
      localStorage.setItem("mimpi_zimageUseIncSeed", String(zimageUseIncSeed)),
    [zimageUseIncSeed],
  );
  useEffect(
    () => localStorage.setItem("mimpi_zimageWidth", String(zimageWidth)),
    [zimageWidth],
  );
  useEffect(
    () => localStorage.setItem("mimpi_zimageHeight", String(zimageHeight)),
    [zimageHeight],
  );
  useEffect(
    () => localStorage.setItem("mimpi_zimageResMode", zimageResMode),
    [zimageResMode],
  );
  useEffect(
    () =>
      localStorage.setItem("mimpi_zimageLoras", JSON.stringify(zimageLoras)),
    [zimageLoras],
  );
  useEffect(() => {
    if (selectedPresetId !== null) {
      localStorage.setItem(
        "mimpi_selectedZimagePresetId",
        String(selectedPresetId),
      );
    } else {
      localStorage.removeItem("mimpi_selectedZimagePresetId");
    }
  }, [selectedPresetId]);

  useEffect(() => {
    onCanGenerateChange(Boolean(zimagePrompt.trim()));
  }, [zimagePrompt, onCanGenerateChange]);

  useImperativeHandle(
    ref,
    () => ({
      prepareGenerate: () => ({
        prompt: zimagePrompt,
        negative: zimageNegative,
        model: zimageModel,
        sampler: zimageSampler,
        scheduler: zimageScheduler,
        steps: zimageSteps,
        cfg: zimageCfg,
        width: zimageWidth,
        height: zimageHeight,
        seed: zimageSeed,
        currentSeedNum: zimageCurrentSeedNum,
        useDynamicSeed: zimageUseDynamicSeed,
        useIncSeed: zimageUseIncSeed,
        loras: zimageLoras,
        imageMode: "zimage" as const,
      }),
      updateSeed: (seed: string, currentSeedNum: number) => {
        setZimageSeed(seed);
        setZimageCurrentSeedNum(currentSeedNum);
      },
      getInfo: () => ({
        prompt: zimagePrompt,
        negative: zimageNegative,
        model: zimageModel,
        sampler: zimageSampler,
        scheduler: zimageScheduler,
        steps: zimageSteps,
        cfg: zimageCfg,
        seed: zimageSeed || String(zimageCurrentSeedNum),
        mode: "zimage" as const,
      }),
    }),
    [
      zimagePrompt,
      zimageNegative,
      zimageModel,
      zimageSampler,
      zimageScheduler,
      zimageSteps,
      zimageCfg,
      zimageWidth,
      zimageHeight,
      zimageSeed,
      zimageCurrentSeedNum,
      zimageUseDynamicSeed,
      zimageUseIncSeed,
      zimageLoras,
    ],
  );

  const handleSelectPreset = (id: number | null) => {
    setSelectedPresetId(id);
    if (id === null) return;
    const preset = zimagePresets.find((p) => p.id === id);
    if (!preset) return;
    setZimagePrompt(preset.prompt);
    if (preset.negative) setZimageNegative(preset.negative);
    if (preset.model) setZimageModel(preset.model);
    if (preset.sampler) setZimageSampler(preset.sampler);
    if (preset.scheduler) setZimageScheduler(preset.scheduler);
    if (preset.steps) setZimageSteps(preset.steps);
    if (preset.cfg) setZimageCfg(preset.cfg);
    if (preset.width) setZimageWidth(preset.width);
    if (preset.height) setZimageHeight(preset.height);
    setEditTitle(preset.title);
    setEditPrompt(preset.prompt);
  };

  const handleAddPreset = () => {
    setSelectedPresetId(null);
    setZimageEditing(true);
    setEditTitle("");
    setEditPrompt(zimagePrompt);
  };

  const handleEditPreset = () => {
    if (!selectedPresetId) return;
    const preset = zimagePresets.find((p) => p.id === selectedPresetId);
    if (!preset) return;
    setZimageEditing(true);
    setEditingId(selectedPresetId);
    setEditTitle(preset.title);
    setEditPrompt(preset.prompt);
  };

  const handleCancelEdit = () => setZimageEditing(false);

  const handleSavePreset = async () => {
    if (!editTitle.trim()) return;
    const isEditing = editingId !== null;
    const ok = isEditing
      ? await updateZimagePreset(editingId, {
          title: editTitle.trim(),
          prompt: editPrompt || zimagePrompt,
          negative: zimageNegative,
          model: zimageModel,
          sampler: zimageSampler,
          scheduler: zimageScheduler,
          steps: zimageSteps,
          cfg: zimageCfg,
          width: zimageWidth,
          height: zimageHeight,
        })
      : await createZimagePreset({
          title: editTitle.trim(),
          prompt: editPrompt || zimagePrompt,
          negative: zimageNegative,
          model: zimageModel,
          sampler: zimageSampler,
          scheduler: zimageScheduler,
          steps: zimageSteps,
          cfg: zimageCfg,
          width: zimageWidth,
          height: zimageHeight,
        });
    if (ok)
      addToast(
        isEditing ? "Preset diperbarui!" : "Preset tersimpan!",
        "success",
      );
    else addToast("Gagal simpan preset", "error");
    const fresh = await fetchZimagePresets();
    setZimagePresets(fresh);
    setZimageEditing(false);
  };

  const handleDeletePreset = async () => {
    if (!selectedPresetId) return;
    const ok = await deleteZimagePreset(selectedPresetId);
    if (ok) addToast("Preset dihapus", "success");
    setSelectedPresetId(null);
    setEditTitle("");
    setEditPrompt("");
    const fresh = await fetchZimagePresets();
    setZimagePresets(fresh);
  };

  const handleZimageResChange = (val: string) => {
    setZimageResMode(val);
    if (!val) return;
    const res = ZIMAGE_RESOLUTIONS.find((r) => r.label === val);
    if (res) {
      setZimageWidth(res.width);
      setZimageHeight(res.height);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <GeneratePromptCard
        mode="zimage"
        prompt={zimagePrompt}
        setPrompt={setZimagePrompt}
        negative={zimageNegative}
        setNegative={setZimageNegative}
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
                value={selectedPresetId ?? ""}
                onChange={(e) =>
                  handleSelectPreset(
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                className="w-full text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">Tidak Ada</option>
                {zimagePresets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAddPreset}
              className="px-2.5 py-1.5 text-xs rounded-lg bg-primary-500 hover:bg-primary-600 text-white transition-colors"
              title="Tambah Preset"
            >
              <Plus size={14} />
            </button>
            <button
              onClick={handleEditPreset}
              disabled={!selectedPresetId}
              className="px-2.5 py-1.5 text-xs rounded-lg bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600 text-surface-700 dark:text-surface-300 disabled:opacity-40 transition-colors"
              title="Edit Preset"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={handleDeletePreset}
              disabled={!selectedPresetId}
              className="px-2.5 py-1.5 text-xs rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-400 disabled:opacity-40 transition-colors"
              title="Hapus Preset"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {zimageEditing && (
            <div className="space-y-2 border border-surface-200 dark:border-surface-700 rounded-lg p-3 bg-surface-50 dark:bg-surface-800/50">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
                  Judul
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Nama preset..."
                  className="w-full text-xs rounded-lg bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
                  Prompt
                </label>
                <textarea
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  rows={4}
                  placeholder="Isi prompt untuk preset ini..."
                  className="w-full text-xs rounded-lg bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder-surface-400"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 text-xs rounded-lg bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600 text-surface-700 dark:text-surface-300 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSavePreset}
                  disabled={!editTitle.trim()}
                  className="px-3 py-1 text-xs rounded-lg bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-40 transition-colors"
                >
                  Simpan
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
              Mode Gambar
            </label>
            <select
              value={zimageResMode}
              onChange={(e) => handleZimageResChange(e.target.value)}
              className="w-full text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">Kustom</option>
              <optgroup label="Portrait">
                <option value="896×1152">896×1152</option>
                <option value="896×1600">896×1600</option>
                <option value="1120×1449">1120×1449</option>
              </optgroup>
              <optgroup label="Landscape">
                <option value="1152×896">1152×896</option>
                <option value="1600×896">1600×896</option>
                <option value="1449×1120">1449×1120</option>
              </optgroup>
            </select>
          </div>
          {zimageResMode === "" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
                  Width
                </label>
                <input
                  type="number"
                  min={256}
                  max={2048}
                  step={8}
                  value={zimageWidth}
                  onChange={(e) =>
                    setZimageWidth(parseInt(e.target.value) || 896)
                  }
                  className="w-full text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
                  Height
                </label>
                <input
                  type="number"
                  min={256}
                  max={2048}
                  step={8}
                  value={zimageHeight}
                  onChange={(e) =>
                    setZimageHeight(parseInt(e.target.value) || 1600)
                  }
                  className="w-full text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
          )}
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
        open={zimageOpen}
        onToggle={toggleZimage}
      >
        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
              Checkpoint
            </label>
            <select
              value={zimageModel}
              onChange={(e) => setZimageModel(e.target.value)}
              className="w-full text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">— Pilih Model —</option>
              <optgroup label="BF16">
                <option value="Z-Image/2127ZImageAsianUtopian_v36TurboFFV.safetensors">
                  2127ZImageAsianUtopian_v36TurboFFV
                </option>
                <option value="Z-Image/beyondREALITY_V30.safetensors">
                  beyondREALITY_V30
                </option>
                <option value="Z-Image/bigLove_zt3.safetensors">
                  bigLove_zt3
                </option>
                <option value="Z-Image/copaxTimeless_xplusZ13.safetensors">
                  copaxTimeless_xplusZ13
                </option>
                <option value="Z-Image/cyberrealisticZImage_v50.safetensors">
                  cyberrealisticZImage_v50
                </option>
                <option value="Z-Image/darkBeast_darkblitz6Beyondnsfw.safetensors">
                  darkBeast_darkblitz6Beyondnsfw
                </option>
                <option value="Z-Image/darkBeast_darkblitzZIT5steps.safetensors">
                  darkBeast_darkblitzZIT5steps
                </option>
                <option value="Z-Image/divingZImageTurbo_v60Fp16.safetensors">
                  divingZImageTurbo_v60Fp16
                </option>
                <option value="Z-Image/gonzalomoZpop_v40.safetensors">
                  gonzalomoZpop_v40
                </option>
                <option value="Z-Image/intorealism_zitV50.safetensors">
                  intorealism_zitV50
                </option>
                <option value="Z-Image/jibMixZIT_v20.safetensors">
                  jibMixZIT_v20
                </option>
                <option value="Z-Image/moodyProMix_zitV12DPO.safetensors">
                  moodyProMix_zitV12DPO
                </option>
                <option value="Z-Image/moodyProMix_zitV13.safetensors">
                  moodyProMix_zitV13
                </option>
                <option value="Z-Image/pornmasterZImage_baseV1.safetensors">
                  pornmasterZImage_baseV1
                </option>
                <option value="Z-Image/pornmasterZImage_turboV35Bf16.safetensors">
                  pornmasterZImage_turboV35Bf16
                </option>
                <option value="Z-Image/realDream_zitV6.safetensors">
                  realDream_zitV6
                </option>
                <option value="Z-Image/redcraftERNIERedmix_redzit15AIO.safetensors">
                  redcraftERNIERedmix_redzit15AIO
                </option>
                <option value="Z-Image/unstablebastard_7.safetensors">
                  unstablebastard_7
                </option>
                <option value="Z-Image/unstablebastard_v9.safetensors">
                  unstablebastard_v9
                </option>
                <option value="Z-Image/unstableRevolution_V3Fp16.safetensors">
                  unstableRevolution_V3Fp16
                </option>
                <option value="Z-Image/zImageTurboNSFW_90.safetensors">
                  zImageTurboNSFW_90
                </option>
                <option value="Z-Image/zimageTurboNSFWBy_2602NSFWBF16.safetensors">
                  zimageTurboNSFWBy_2602NSFWBF16
                </option>
                <option value="Z-Image/zit_v11.safetensors">zit_v11</option>
              </optgroup>
              <optgroup label="FP8">
                <option value="Z-Image/FP8/beyondREALITY_30FP8.safetensors">
                  beyondREALITY_30FP8
                </option>
                <option value="Z-Image/FP8/intorealismZITAsian_v20FP8.safetensors">
                  intorealismZITAsian_v20FP8
                </option>
                <option value="Z-Image/FP8/moodyProMix_zitV12DPOFP8.safetensors">
                  moodyProMix_zitV12DPOFP8
                </option>
                <option value="Z-Image/FP8/pornmasterZImage_turboV35Fp8.safetensors">
                  pornmasterZImage_turboV35Fp8
                </option>
                <option value="Z-Image/FP8/unstablebastard_v9_fp8.safetensors">
                  unstablebastard_v9_fp8
                </option>
                <option value="Z-Image/FP8/zImageTurboNSFW_82BF16FP8.safetensors">
                  zImageTurboNSFW_82BF16FP8
                </option>
                <option value="Z-Image/FP8/zimageTurboNSFWBy_2602NSFWFP8.safetensors">
                  zimageTurboNSFWBy_2602NSFWFP8
                </option>
              </optgroup>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
                Sampler
              </label>
              <select
                value={zimageSampler}
                onChange={(e) => setZimageSampler(e.target.value)}
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
                value={zimageScheduler}
                onChange={(e) => setZimageScheduler(e.target.value)}
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
        title="LoRA"
        emoji="🧩"
        open={loraOpen}
        onToggle={toggleLora}
      >
        <div className="space-y-3">
          {availableLoras.length > 0 && (
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
                  Model
                </label>
                <select
                  value={selectedLora}
                  onChange={(e) => setSelectedLora(e.target.value)}
                  className="w-full text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">— Pilih LoRA —</option>
                  {availableLoras
                    .filter(
                      (name) =>
                        !zimageLoras.some(
                          (l) => l.name === normalizeLoraName(name),
                        ),
                    )
                    .map((name) => (
                      <option key={name} value={name}>
                        {normalizeLoraName(name)}
                      </option>
                    ))}
                </select>
              </div>
              <button
                type="button"
                disabled={!selectedLora}
                onClick={() => {
                  if (!selectedLora) return;
                  setZimageLoras(addZImageLora(zimageLoras, selectedLora));
                  setSelectedLora("");
                }}
                className="px-2.5 py-1.5 text-xs rounded-lg bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-40 transition-colors"
                title="Tambah LoRA"
              >
                <Plus size={14} />
              </button>
            </div>
          )}

          {zimageLoras.map((lora, i) => (
            <div
              key={lora.name}
              className="flex items-center gap-2 rounded-lg border border-surface-200 dark:border-surface-700 p-2.5 bg-surface-50 dark:bg-surface-800/50"
            >
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() =>
                    setZimageLoras(moveZImageLora(zimageLoras, i, "up"))
                  }
                  className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 disabled:opacity-20 disabled:cursor-not-allowed leading-none p-0.5"
                >
                  ▲
                </button>
                <button
                  type="button"
                  disabled={i === zimageLoras.length - 1}
                  onClick={() =>
                    setZimageLoras(moveZImageLora(zimageLoras, i, "down"))
                  }
                  className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 disabled:opacity-20 disabled:cursor-not-allowed leading-none p-0.5"
                >
                  ▼
                </button>
              </div>
              <input
                type="checkbox"
                checked={lora.active}
                onChange={(e) =>
                  setZimageLoras(
                    toggleZImageLora(zimageLoras, i, e.target.checked),
                  )
                }
                className="w-3.5 h-3.5 accent-primary-500 shrink-0"
              />
              <span
                className="text-xs text-surface-700 dark:text-surface-300 flex-1 truncate"
                title={lora.name}
              >
                {normalizeLoraName(lora.name)}
              </span>
              <input
                type="number"
                min={-10}
                max={10}
                step={0.01}
                value={lora.strength}
                onChange={(e) =>
                  setZimageLoras(
                    updateZImageLoraStrength(
                      zimageLoras,
                      i,
                      parseFloat(e.target.value) || 0,
                    ),
                  )
                }
                className="w-20 text-xs rounded-lg bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500 text-right"
              />
              <button
                type="button"
                onClick={() => setZimageLoras(removeZImageLora(zimageLoras, i))}
                className="shrink-0 text-surface-400 hover:text-red-500 dark:hover:text-red-400 text-sm p-1"
                title="Hapus LoRA"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </CollapseSection>

      <CollapseSection
        title="Opsi Tingkat Lanjut"
        emoji="🔧"
        open={advancedOpen}
        onToggle={toggleAdvanced}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
                Steps
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={zimageSteps}
                onChange={(e) => setZimageSteps(parseInt(e.target.value) || 8)}
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
                value={zimageCfg}
                onChange={(e) => setZimageCfg(parseFloat(e.target.value) || 1)}
                className="w-full text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
                Seed
              </label>
              <input
                type="number"
                min={-1}
                value={zimageSeed}
                onChange={(e) => setZimageSeed(e.target.value)}
                placeholder="-1 = random"
                className="w-full text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-4 pt-1">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={zimageUseDynamicSeed}
                onChange={(e) => {
                  setZimageUseDynamicSeed(e.target.checked);
                  if (e.target.checked) {
                    setZimageUseIncSeed(false);
                    setZimageSeed("-1");
                  }
                }}
                className="w-3.5 h-3.5 accent-primary-500"
              />
              <span className="text-xs text-surface-600 dark:text-surface-300">
                Acak Seed?
              </span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={zimageUseIncSeed}
                onChange={(e) => {
                  setZimageUseIncSeed(e.target.checked);
                  if (e.target.checked) setZimageUseDynamicSeed(false);
                }}
                disabled={zimageUseDynamicSeed}
                className="w-3.5 h-3.5 accent-primary-500"
              />
              <span className="text-xs text-surface-600 dark:text-surface-300">
                Incremental Seed?
              </span>
            </label>
          </div>
        </div>
      </CollapseSection>
    </div>
  );
});
