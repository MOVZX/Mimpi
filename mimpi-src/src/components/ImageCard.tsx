import { useState, useRef, useCallback } from "react";
import { Sparkles, CheckCircle, Circle } from "lucide-react";
import { useGallery } from "@/context/GalleryContext";
import { getThumbnailUrl } from "@/services/mimpi";
import type { GalleryItem } from "@/types";

interface ImageCardProps {
  item: GalleryItem;
}

export function ImageCard({ item }: ImageCardProps) {
  const {
    setSelectedImage,
    selectedIds,
    toggleSelect,
    selectionMode,
    setSelectionMode,
  } = useGallery();
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFired = useRef(false);

  const aspectRatio = item.height && item.width ? item.height / item.width : 1;
  const isSelected = selectedIds.has(item.id);

  const handleClick = () => {
    if (selectionMode || selectedIds.size > 0) {
      toggleSelect(item.id);
    } else {
      setSelectedImage(item);
    }
  };

  const handleTouchStart = useCallback(() => {
    longPressFired.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      if (!selectionMode) {
        setSelectionMode(true);
      }
      toggleSelect(item.id);
    }, 500);
  }, [item.id, selectionMode, setSelectionMode, toggleSelect]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleTouchMove = useCallback(() => {
    // Cancel long press on scroll/drag
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const showCheckbox = selectionMode || isSelected;

  return (
    <article
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      className={`rounded-xl overflow-hidden cursor-pointer group animate-fade-in border transition-all duration-200 select-none ${
        isSelected
          ? "border-primary-500 ring-2 ring-primary-500/30 bg-primary-500/5 dark:bg-primary-500/10"
          : selectionMode
            ? "border-surface-300/60 dark:border-surface-600/60 bg-white dark:bg-surface-900/80 shadow-sm hover:border-primary-300/40 dark:hover:border-primary-600/40"
            : "border-surface-200/80 dark:border-surface-700/80 bg-white dark:bg-surface-900/80 shadow-sm hover:shadow-lg hover:border-primary-300/40 dark:hover:border-primary-600/40"
      }`}
    >
      <div
        className="relative overflow-hidden bg-surface-100 dark:bg-surface-800"
        style={{ paddingBottom: `${Math.min(aspectRatio * 100, 150)}%` }}
      >
        {!loaded && !error && <div className="absolute inset-0 skeleton" />}
        {!error ? (
          <img
            src={getThumbnailUrl(item)}
            alt={item.prompt?.slice(0, 100) || "Generated Image"}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${loaded ? "opacity-100" : "opacity-0"}`}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="text-surface-400" size={32} />
          </div>
        )}
        {/* Selection checkbox — always visible in selection mode */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            toggleSelect(item.id);
          }}
          className={`absolute top-2 left-2 z-10 cursor-pointer transition-opacity duration-200 ${
            showCheckbox ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          {isSelected ? (
            <CheckCircle
              size={22}
              className="text-primary-500 drop-shadow-md"
            />
          ) : (
            <Circle
              size={22}
              className="text-white/80 drop-shadow-md hover:text-white"
            />
          )}
        </div>
        {/* Info overlay bawah */}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-200 bg-linear-to-t from-black/80 to-transparent">
          <div className="flex items-center justify-between gap-2 text-white">
            <span className="text-xs font-medium truncate max-w-32">
              {item.filename || "Unknown"}
            </span>
            <span className="text-[10px] text-white/70 shrink-0">
              {item.resolution || ""}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
