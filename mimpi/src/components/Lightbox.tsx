import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Trash2,
  X,
  Info,
} from "lucide-react";
import { useGallery } from "@/context/GalleryContext";
import { deleteImage, getGalleryUrl } from "@/services/mimpi";
import type { GalleryItem } from "@/types";

export function Lightbox() {
  const {
    selectedImage,
    setSelectedImage,
    selectedIndex,
    items,
    navigateImage,
    refresh,
  } = useGallery();
  const [loaded, setLoaded] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [showFullPrompt, setShowFullPrompt] = useState(false);
  const [showFullNegative, setShowFullNegative] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const handleClose = useCallback(() => {
    setSelectedImage(null);
    setLoaded(false);
    setShowFullPrompt(false);
    setShowFullNegative(false);
    setShowInfo(false);
  }, [setSelectedImage]);

  const handlePrev = useCallback(() => {
    if (selectedIndex > 0) {
      setLoaded(false);
      navigateImage("prev");
    }
  }, [selectedIndex, navigateImage]);

  const handleNext = useCallback(() => {
    if (selectedIndex < items.length - 1) {
      setLoaded(false);
      navigateImage("next");
    }
  }, [selectedIndex, items.length, navigateImage]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      else if (e.key === "ArrowLeft") handlePrev();
      else if (e.key === "ArrowRight") handleNext();
    };
    if (selectedImage) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKey);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [selectedImage, handleClose, handlePrev, handleNext]);

  const handleDelete = async () => {
    if (!selectedImage) return;
    if (!confirm("Yakin ingin menghapus gambar ini?")) return;
    try {
      await deleteImage(selectedImage.id);
      handleClose();
      refresh();
    } catch (e) {
      alert("Gagal menghapus: " + (e instanceof Error ? e.message : "Unknown"));
    }
  };

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  // ── Swipe handlers ──
  const touchRef = useRef({ startX: 0, startY: 0 });

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchRef.current.startX = e.touches[0].clientX;
    touchRef.current.startY = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const dx = e.changedTouches[0].clientX - touchRef.current.startX;
      const dy = e.changedTouches[0].clientY - touchRef.current.startY;
      // Only horizontal swipes — ignore vertical (scrolling)
      if (Math.abs(dx) > Math.abs(dy) * 1.5 && Math.abs(dx) > 50) {
        if (dx > 0) handlePrev();
        else handleNext();
      }
    },
    [handlePrev, handleNext],
  );

  // ── Wheel scroll navigation (desktop) ──
  const wheelThrottle = useRef(0);
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      // Only on desktop (lg+) — mobile uses touch swipe
      if (window.innerWidth < 1024) return;
      const now = Date.now();
      if (now - wheelThrottle.current < 600) return;
      if (Math.abs(e.deltaY) < 30) return;
      e.preventDefault();
      wheelThrottle.current = now;
      if (e.deltaY > 0) handleNext();
      else handlePrev();
    },
    [handleNext, handlePrev],
  );

  if (!selectedImage) return null;

  const img = selectedImage;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="h-full flex flex-col lg:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
          aria-label="Close"
        >
          <X size={24} />
        </button>
        <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full bg-black/50 text-white text-sm">
          {selectedIndex + 1} / {items.length}
        </div>

        {/* Image — full screen on mobile, flex-1 on desktop */}
        {/* Tap image to close, swipe horizontally to navigate */}
        <div
          className="flex-1 flex items-center justify-center p-4 min-w-0"
          onClick={handleClose}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
        >
          <div className="relative max-w-full max-h-full">
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-white animate-spin" />
              </div>
            )}
            <img
              src={getGalleryUrl(img)}
              alt={img.prompt?.slice(0, 100) || "Generated Image"}
              className={`max-w-full max-h-[90vh] object-contain rounded-lg transition-opacity ${loaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setLoaded(true)}
            />
          </div>

          {/* Mobile info button — bottom-right overlay on image */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowInfo(true);
            }}
            className="lg:hidden absolute bottom-6 right-6 z-10 p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors shadow-lg"
            aria-label="Show info"
          >
            <Info size={22} />
          </button>
        </div>

        {/* Desktop sidebar info — hidden on mobile */}
        <aside className="hidden lg:block lg:w-96 lg:min-w-96 overflow-y-auto bg-white dark:bg-surface-900 border-l border-surface-200 dark:border-surface-800">
          <InfoContent
            img={img}
            selectedIndex={selectedIndex}
            itemsLength={items.length}
            handleDelete={handleDelete}
            copyText={copyText}
            copiedPrompt={copiedPrompt}
            showFullPrompt={showFullPrompt}
            setShowFullPrompt={setShowFullPrompt}
            showFullNegative={showFullNegative}
            setShowFullNegative={setShowFullNegative}
          />
        </aside>
      </div>

      {/* Mobile info overlay — full screen bottom sheet */}
      {showInfo && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex flex-col bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowInfo(false)}
        >
          <div
            className="flex-1 min-h-0 bg-white dark:bg-surface-900 overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-surface-900 z-10 flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-700">
              <span className="text-sm font-semibold text-surface-800 dark:text-surface-100">
                Image Info
              </span>
              <button
                onClick={() => setShowInfo(false)}
                className="p-2 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              <InfoContent
                img={img}
                selectedIndex={selectedIndex}
                itemsLength={items.length}
                handleDelete={handleDelete}
                copyText={copyText}
                copiedPrompt={copiedPrompt}
                showFullPrompt={showFullPrompt}
                setShowFullPrompt={setShowFullPrompt}
                showFullNegative={showFullNegative}
                setShowFullNegative={setShowFullNegative}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-50 dark:bg-surface-800 rounded-lg p-2.5">
      <p className="text-[10px] font-medium text-surface-400 dark:text-surface-500 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm font-medium text-surface-800 dark:text-surface-200 mt-0.5 break-all">
        {value}
      </p>
    </div>
  );
}

function InfoContent({
  img,
  selectedIndex,
  itemsLength,
  handleDelete,
  copyText,
  copiedPrompt,
  showFullPrompt,
  setShowFullPrompt,
  showFullNegative,
  setShowFullNegative,
}: {
  img: GalleryItem;
  selectedIndex: number;
  itemsLength: number;
  handleDelete: () => void;
  copyText: (text: string) => void;
  copiedPrompt: boolean;
  showFullPrompt: boolean;
  setShowFullPrompt: (v: boolean) => void;
  showFullNegative: boolean;
  setShowFullNegative: (v: boolean) => void;
}) {
  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3
          className="font-semibold text-surface-900 dark:text-surface-100 truncate max-w-[200px]"
          title={img.filename}
        >
          {img.filename}
        </h3>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {img.resolution && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium">
            {img.resolution}
          </span>
        )}
        {img.width && img.height && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400">
            {img.width}×{img.height}
          </span>
        )}
        {img.seed && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400">
            Seed: {img.seed}
          </span>
        )}
        {img.timestamp && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400">
            {new Date(img.timestamp).toLocaleDateString()}
          </span>
        )}
      </div>
      <div className="h-px bg-surface-200 dark:bg-surface-700" />
      {img.prompt && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 flex items-center gap-2">
              <Sparkles size={14} /> Prompt
            </h3>
            <button
              onClick={() => copyText(img.prompt!)}
              className="btn btn-ghost p-1.5 text-xs"
            >
              {copiedPrompt ? (
                <>
                  <Check size={14} className="text-green-500" /> Copied
                </>
              ) : (
                <>
                  <Copy size={14} /> Copy
                </>
              )}
            </button>
          </div>
          <div className="relative">
            <p
              className={`text-sm text-surface-600 dark:text-surface-400 bg-surface-50 dark:bg-surface-800 rounded-lg p-3 leading-relaxed ${!showFullPrompt ? "line-clamp-3" : ""}`}
            >
              {img.prompt}
            </p>
            {img.prompt.length > 200 && (
              <button
                onClick={() => setShowFullPrompt(!showFullPrompt)}
                className="mt-1 text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
              >
                {showFullPrompt ? (
                  <>
                    Show less <ChevronUp size={12} />
                  </>
                ) : (
                  <>
                    Show more <ChevronDown size={12} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
      {img.promptNegative && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300">
            Negative Prompt
          </h3>
          <p
            className={`text-sm text-surface-600 dark:text-surface-400 bg-surface-50 dark:bg-surface-800 rounded-lg p-3 leading-relaxed ${!showFullNegative ? "line-clamp-2" : ""}`}
          >
            {img.promptNegative}
          </p>
          {img.promptNegative.length > 150 && (
            <button
              onClick={() => setShowFullNegative(!showFullNegative)}
              className="mt-1 text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
            >
              {showFullNegative ? (
                <>
                  Show less <ChevronUp size={12} />
                </>
              ) : (
                <>
                  Show more <ChevronDown size={12} />
                </>
              )}
            </button>
          )}
        </div>
      )}
      <div className="h-px bg-surface-200 dark:bg-surface-700" />
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300">
          Parameters
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {img.steps > 0 && (
            <DetailItem label="Steps" value={String(img.steps)} />
          )}
          {img.cfg > 0 && <DetailItem label="CFG" value={String(img.cfg)} />}
          {img.sampler && <DetailItem label="Sampler" value={img.sampler} />}
          {img.scheduler && (
            <DetailItem label="Scheduler" value={img.scheduler} />
          )}
        </div>
      </div>
      <div className="h-px bg-surface-200 dark:bg-surface-700" />
      <div className="text-xs text-surface-400 dark:text-surface-500 space-y-1">
        <div className="flex items-center justify-end gap-2 mb-2">
          <button
            onClick={handleDelete}
            className="btn btn-ghost px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
          >
            <Trash2 size={14} /> Hapus
          </button>
        </div>
        <p>Filename: {img.filename}</p>
        {img.width && img.height && (
          <p>
            Size: {img.width}×{img.height}
          </p>
        )}
        <p>Date: {new Date(img.timestamp).toLocaleString()}</p>
      </div>
    </div>
  );
}
