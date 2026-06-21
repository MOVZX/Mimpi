import { useRef, useState, useEffect } from "react";
import {
  Sparkles,
  Loader2,
  Download,
  Trash2,
  X,
  Plus,
  Pencil,
} from "lucide-react";
import { useGallery } from "@/context/GalleryContext";
import { useToast } from "@/context/ToastContext";
import { useCollapse } from "@/constants/generation";
import { CollapseSection } from "@/components/CollapseSection";
import {
  generateImage,
  pollHistory,
  getImageUrl,
  saveToGallery,
  fetchGalleries,
  createGallery,
  updateGallery,
  deleteGallery,
  type Gallery,
} from "@/services/mimpi";
import { GenerateModeSwitcher } from "@/components/GenerateModeSwitcher";
import {
  SdxlGenerator,
  type SdxlGeneratorHandle,
} from "@/components/generate/SdxlGenerator";
import {
  ZImageGenerator,
  type ZImageGeneratorHandle,
} from "@/components/generate/ZImageGenerator";
import {
  buildSdxlWorkflow,
  buildZImageWorkflow,
  type GenerationMode,
  type SdxlGenerationState,
  type ZimageGenerationState,
} from "@/components/generate/utils";

export function GenerateTab() {
  const { refresh } = useGallery();
  const { addToast } = useToast();
  const zimageRef = useRef<ZImageGeneratorHandle>(null);
  const sdxlRef = useRef<SdxlGeneratorHandle>(null);

  const [genMode, setGenMode] = useState<GenerationMode>(
    () => (localStorage.getItem("mimpi_genMode") as GenerationMode) || "zimage",
  );
  const [generating, setGenerating] = useState(false);
  const [unloading, setUnloading] = useState(false);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [canGenerate, setCanGenerate] = useState(false);
  const [fullScreenImg, setFullScreenImg] = useState("");

  // Gallery collapse
  const [galleryOpen, toggleGallery] = useCollapse("gallery", true);

  // Gallery state
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [selectedGallery, setSelectedGallery] = useState(
    () => localStorage.getItem("mimpi_selectedGallery") || "",
  );
  const [galleryEditing, setGalleryEditing] = useState(false);
  const [editingGalleryId, setEditingGalleryId] = useState<number | null>(null);
  const [editGalleryName, setEditGalleryName] = useState("");

  useEffect(() => {
    fetchGalleries().then(setGalleries);
  }, []);

  useEffect(() => {
    localStorage.setItem("mimpi_selectedGallery", selectedGallery);
  }, [selectedGallery]);

  const handleAddGallery = () => {
    setGalleryEditing(true);
    setEditingGalleryId(null);
    setEditGalleryName("");
  };

  const handleEditGallery = () => {
    if (!selectedGallery) return;
    const g = galleries.find((g) => g.name === selectedGallery);
    if (!g) return;
    setGalleryEditing(true);
    setEditingGalleryId(g.id);
    setEditGalleryName(g.name);
  };

  const handleDeleteGallery = async () => {
    if (!selectedGallery) return;
    const g = galleries.find((g) => g.name === selectedGallery);
    if (!g) return;
    if (!confirm(`Hapus gallery "${selectedGallery}"?`)) return;
    const ok = await deleteGallery(g.id);
    if (ok) {
      setGalleries((prev) => prev.filter((x) => x.id !== g.id));
      setSelectedGallery("");
    }
  };

  const handleSaveGallery = async () => {
    if (!editGalleryName.trim()) return;
    if (editingGalleryId !== null) {
      // Edit existing
      const ok = await updateGallery(editingGalleryId, editGalleryName.trim());
      if (ok) {
        setGalleries((prev) =>
          prev.map((g) =>
            g.id === editingGalleryId
              ? { ...g, name: editGalleryName.trim() }
              : g,
          ),
        );
        setSelectedGallery(editGalleryName.trim());
      }
    } else {
      // Add new
      const result = await createGallery(editGalleryName.trim());
      if (result) {
        setGalleries((prev) => [
          ...prev,
          { id: result.id, name: result.name, created_at: "" },
        ]);
        setSelectedGallery(result.name);
      }
    }
    setGalleryEditing(false);
    setEditingGalleryId(null);
  };

  const handleGenerate = async () => {
    if (generating) return;

    let state: ZimageGenerationState | SdxlGenerationState | null = null;
    if (genMode === "zimage")
      state = zimageRef.current?.prepareGenerate() ?? null;
    else state = sdxlRef.current?.prepareGenerate() ?? null;

    if (!state?.prompt.trim()) return;

    setGenerating(true);
    setStatus("Menyiapkan workflow...");

    try {
      const built =
        genMode === "zimage"
          ? buildZImageWorkflow(state as ZimageGenerationState)
          : buildSdxlWorkflow(state as SdxlGenerationState);

      const { prompt_id } = await generateImage(built.workflow);
      setStatus("Menunggu hasil...");

      let imgData: any = null;
      for (let i = 0; i < 60; i++) {
        await new Promise((r) => setTimeout(r, 1500));
        imgData = await pollHistory(prompt_id);
        if (imgData) break;
      }

      if (!imgData)
        throw new Error("Timeout: gambar tidak selesai dalam 90 detik");

      const url = getImageUrl(
        imgData.filename,
        imgData.subfolder,
        imgData.type,
      );
      setResultUrl(url);

      const metadata = built.metadata;
      if (genMode === "zimage") {
        zimageRef.current?.updateSeed(
          String(metadata.seed),
          Number(metadata.seed),
        );
      } else {
        sdxlRef.current?.updateSeed(
          String(metadata.seed),
          Number(metadata.seed),
        );
      }

      try {
        const blob = await (await fetch(url)).blob();
        await saveToGallery(blob, built.metadata, selectedGallery);
        setStatus("✅ Gambar berhasil dibuat & disimpan!");
        refresh();
      } catch {
        setStatus("✅ Gambar berhasil dibuat");
      }
    } catch (e: any) {
      setStatus(`❌ ${e.message || "Error"}`);
      addToast(e.message || "Gagal generate", "error");
    } finally {
      setGenerating(false);
    }
  };

  const handleUnloadModels = async () => {
    setUnloading(true);
    try {
      const r = await fetch("/api/comfy/free", { method: "POST" });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.detail || "Gagal unload model");
      }
    } catch (e: any) {
      setStatus(`❌ ${e.message || "Error unload"}`);
    } finally {
      setUnloading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 max-w-4xl mx-auto w-full">
      <div className="flex flex-col gap-4">
        <GenerateModeSwitcher mode={genMode} onModeChange={setGenMode} />

        {genMode === "zimage" ? (
          <ZImageGenerator
            ref={zimageRef}
            onCanGenerateChange={setCanGenerate}
            addToast={addToast}
            selectedGallery={selectedGallery}
            onSelectedGalleryChange={setSelectedGallery}
            galleries={galleries}
            galleryEditing={galleryEditing}
            editingGalleryId={editingGalleryId}
            editGalleryName={editGalleryName}
            onEditGalleryNameChange={setEditGalleryName}
            onAddGallery={handleAddGallery}
            onEditGallery={handleEditGallery}
            onDeleteGallery={handleDeleteGallery}
            onSaveGallery={handleSaveGallery}
            onCancelGallery={() => {
              setGalleryEditing(false);
              setEditingGalleryId(null);
            }}
          />
        ) : (
          <SdxlGenerator
            ref={sdxlRef}
            onCanGenerateChange={setCanGenerate}
            addToast={addToast}
            selectedGallery={selectedGallery}
            onSelectedGalleryChange={setSelectedGallery}
            galleries={galleries}
            galleryEditing={galleryEditing}
            editingGalleryId={editingGalleryId}
            editGalleryName={editGalleryName}
            onEditGalleryNameChange={setEditGalleryName}
            onAddGallery={handleAddGallery}
            onEditGallery={handleEditGallery}
            onDeleteGallery={handleDeleteGallery}
            onSaveGallery={handleSaveGallery}
            onCancelGallery={() => {
              setGalleryEditing(false);
              setEditingGalleryId(null);
            }}
          />
        )}

        {/* Reset ke Default */}
        <div className="flex justify-end">
          <button
            onClick={() => {
              const currentMode =
                localStorage.getItem("mimpi_genMode") || "zimage";
              const keys = Object.keys(localStorage).filter((k) => {
                if (!k.startsWith("mimpi_") || k === "mimpi_genMode")
                  return false;
                if (currentMode === "zimage")
                  return (
                    k.startsWith("mimpi_zimage") ||
                    k.startsWith("mimpi_selectedZimage")
                  );
                return (
                  !k.startsWith("mimpi_zimage") &&
                  !k.startsWith("mimpi_selectedZimage")
                );
              });
              keys.forEach((k) => localStorage.removeItem(k));
              window.location.reload();
            }}
            className="text-[10px] text-surface-400 dark:text-surface-500 hover:text-red-500 dark:hover:text-red-400 transition-colors underline underline-offset-2"
          >
            🔄 Reset semua setting ke default
          </button>
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={generating || !canGenerate}
          className="w-full py-3 rounded-xl text-sm font-semibold bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors shadow-sm"
        >
          {generating ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              {status}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Sparkles size={16} />✨ Buat Gambar
            </span>
          )}
        </button>

        <button
          onClick={handleUnloadModels}
          disabled={unloading}
          className="w-full py-2.5 rounded-xl text-xs font-medium bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 disabled:opacity-50 disabled:cursor-not-allowed text-surface-600 dark:text-surface-300 transition-colors border border-surface-200 dark:border-surface-700"
        >
          {unloading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-surface-400 border-t-transparent rounded-full" />
              Unloading...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              🗑️ Unload All Models (Free VRAM)
            </span>
          )}
        </button>

        {status && !generating && (
          <p
            className={`text-xs ${status.includes("❌") ? "text-red-500" : "text-emerald-500"}`}
          >
            {status}
          </p>
        )}

        {/* Result — auto-scroll ke sini */}
        {resultUrl ? (
          <div className="rounded-xl overflow-hidden border border-surface-200 dark:border-surface-700 bg-surface-950">
            <img
              src={resultUrl}
              alt="Generated"
              className="w-full cursor-pointer"
              onClick={() => setFullScreenImg(resultUrl)}
              onLoad={(e) => {
                e.currentTarget.scrollIntoView({
                  behavior: "smooth",
                  block: "end",
                });
              }}
            />
            <div className="flex gap-2 p-2 bg-surface-100 dark:bg-surface-800">
              <a
                href={resultUrl}
                download
                className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white transition-colors shadow-sm"
              >
                <Download size={14} /> Download
              </a>
              <button
                onClick={() => setResultUrl("")}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 dark:bg-red-500/30 dark:hover:bg-red-500/40 text-red-600 dark:text-red-400 transition-colors"
              >
                <Trash2 size={14} /> Clear
              </button>
            </div>
          </div>
        ) : generating ? (
          <div className="rounded-xl overflow-hidden border border-surface-200 dark:border-surface-700">
            {/* Image skeleton */}
            <div className="relative aspect-square bg-surface-100 dark:bg-surface-800 overflow-hidden">
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-surface-100 via-surface-200 to-surface-100 dark:from-surface-800 dark:via-surface-700 dark:to-surface-800" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="animate-spin text-primary-500" size={32} />
              </div>
            </div>
            <div className="p-3 text-xs text-surface-600 dark:text-surface-400 bg-surface-50 dark:bg-surface-800/80">
              {status || "Sedang generate..."}
            </div>
          </div>
        ) : null}
      </div>

      {fullScreenImg && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setFullScreenImg("")}
        >
          <div
            className="relative max-w-5xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setFullScreenImg("")}
              className="absolute top-2 right-2 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              <X size={20} />
            </button>
            <img
              src={fullScreenImg}
              alt="Full screen generated"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
