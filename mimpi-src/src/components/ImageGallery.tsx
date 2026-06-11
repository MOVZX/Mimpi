import { useEffect, useRef, useCallback } from "react";
import { Sparkles, Trash2, X, CheckSquare, Square } from "lucide-react";
import { ImageCard } from "@/components/ImageCard";
import { useGallery } from "@/context/GalleryContext";
import { deleteImage, batchDeleteImages } from "@/services/mimpi";

interface ImageGalleryProps {
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
}

export function ImageGallery({
  scrollContainerRef,
}: ImageGalleryProps & {
  scrollContainerRef?: React.RefObject<HTMLDivElement> | null;
}) {
  const {
    items,
    total,
    loading,
    hasMore,
    loadMore,
    filters,
    models,
    selectedIds,
    clearSelection,
    refresh,
    selectAll,
    columnCount,
    selectionMode,
    setSelectionMode,
  } = useGallery();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loading) {
        loadMore();
      }
    },
    [hasMore, loading, loadMore],
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(handleObserver, {
      rootMargin: "300px",
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [handleObserver]);

  const handleBatchDelete = async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    if (!confirm(`Yakin ingin menghapus ${ids.length} gambar?`)) return;
    try {
      await batchDeleteImages(ids);
      clearSelection();
      refresh();
    } catch {
      alert("Gagal menghapus gambar");
    }
  };

  // Loading skeleton
  if (loading && items.length === 0) {
    return (
      <div className="flex-1 p-4">
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="break-inside-avoid">
              <div
                className="skeleton rounded-xl"
                style={{ height: `${200 + Math.random() * 200}px` }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <Sparkles
          size={48}
          className="text-surface-300 dark:text-surface-600 mb-4"
        />
        <h3 className="text-lg font-semibold text-surface-500 dark:text-surface-400 mb-2">
          Belum ada gambar
        </h3>
        <p className="text-sm text-surface-400 dark:text-surface-500 max-w-xs">
          Generate gambar dulu lewat tab Generate, nanti otomatis tersimpan di
          sini.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      {/* Batch action bar — appear on selection mode or when items selected */}
      {(selectionMode || selectedIds.size > 0) && (
        <div className="sticky top-0 z-20 px-4 py-2 bg-white/90 dark:bg-surface-900/90 backdrop-blur-sm border-b border-surface-200 dark:border-surface-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={clearSelection}
              className="btn btn-ghost p-1 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
            >
              <X size={16} />
            </button>
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
              {selectedIds.size} / {items.length} dipilih
            </span>
            {selectedIds.size < items.length ? (
              <button
                onClick={() => selectAll(items.map((i) => i.id))}
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
              >
                <CheckSquare size={14} /> Pilih Semua
              </button>
            ) : (
              <button
                onClick={clearSelection}
                className="text-xs text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-300 flex items-center gap-1"
              >
                <Square size={14} /> Hapus Pilihan
              </button>
            )}
          </div>
          <button
            onClick={handleBatchDelete}
            className="btn btn-ghost px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-1.5"
          >
            <Trash2 size={14} /> Hapus {selectedIds.size}
          </button>
        </div>
      )}
      {/* Grid */}
      <div className="flex-1 p-4 min-h-0 overflow-y-auto">
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
          }}
        >
          {items.map((item) => (
            <div key={item.id} className="break-inside-avoid">
              <ImageCard item={item} />
            </div>
          ))}
        </div>
        <div ref={sentinelRef} className="h-4" />
        {loading && (
          <div className="text-center py-4">
            <div className="inline-block w-6 h-6 rounded-full border-2 border-surface-300 dark:border-surface-600 border-t-primary-500 animate-spin" />
          </div>
        )}
        {!hasMore && items.length > 0 && (
          <p className="text-center text-xs text-surface-400 dark:text-surface-500 py-4">
            Menampilkan semua {total} gambar
          </p>
        )}
      </div>
    </div>
  );
}
