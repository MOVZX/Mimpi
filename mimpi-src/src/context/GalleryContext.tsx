import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  type ReactNode,
} from "react";
import type { GalleryItem, GalleryFilters, ViewMode, Stats } from "@/types";
import { fetchGallery, fetchStats, fetchModels } from "@/services/mimpi";
import { useToast } from "@/context/ToastContext";

interface GalleryContextType {
  items: GalleryItem[];
  total: number;
  loading: boolean;
  hasMore: boolean;
  filters: GalleryFilters;
  viewMode: ViewMode;
  columnCount: number;
  selectedImage: GalleryItem | null;
  selectedIndex: number;
  sidebarCollapsed: boolean;
  stats: Stats | null;
  models: string[];
  selectedIds: Set<number>;
  selectionMode: boolean;
  setSelectionMode: (on: boolean) => void;
  setFilters: (filters: Partial<GalleryFilters>) => void;
  setViewMode: (mode: ViewMode) => void;
  setColumnCount: (count: number) => void;
  setSelectedImage: (image: GalleryItem | null) => void;
  navigateImage: (dir: "prev" | "next") => void;
  loadMore: () => void;
  refresh: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSelect: (id: number) => void;
  selectAll: (ids: number[]) => void;
  clearSelection: () => void;
}

const defaultFilters: GalleryFilters = {
  query: "",
  sort: "newest",
  model: "",
};

const GalleryContext = createContext<GalleryContextType | null>(null);

export function GalleryProvider({ children }: { children: ReactNode }) {
  const { addToast } = useToast();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFiltersState] = useState<GalleryFilters>(defaultFilters);
  const [viewMode, setViewMode] = useState<ViewMode>("masonry");
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [models, setModels] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [columnCount, setColumnCount] = useState(() => {
    const saved = localStorage.getItem("mimpi_columnCount");
    if (saved === null) return 2;
    const n = parseInt(saved);
    return n >= 1 && n <= 10 ? n : 2;
  });
  const refreshRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadGallery = useCallback(
    async (reset = false) => {
      setLoading(true);
      try {
        const p = reset ? 1 : page;
        const data = await fetchGallery(
          p,
          filters.sort,
          filters.query,
          filters.model,
        );
        if (reset) {
          setItems(data.items);
          setPage(1);
        } else {
          setItems((prev) => [...prev, ...data.items]);
        }
        setTotal(data.total);
        setTotalPages(data.total_pages);
        if (!reset) setPage((prev) => prev + 1);
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    },
    [page, filters],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      refreshRef.current++;
      loadGallery(true);
      fetchStats()
        .then(setStats)
        .catch(() => addToast("Gagal memuat statistik", "error"));
      fetchModels()
        .then(setModels)
        .catch(() => addToast("Gagal memuat model", "error"));
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filters.sort, filters.query, filters.model]);

  const selectedIndex = useMemo(
    () => items.findIndex((i) => i.id === selectedImage?.id),
    [items, selectedImage],
  );

  const setFilters = useCallback((partial: Partial<GalleryFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...partial }));
  }, []);

  const loadMore = useCallback(() => {
    if (!loading && page < totalPages) loadGallery(false);
  }, [loading, page, totalPages, loadGallery]);

  const refresh = useCallback(() => {
    setPage(1);
    setItems([]);
    setTotalPages(0);
    loadGallery(true);
    fetchStats()
      .then(setStats)
      .catch(() => addToast("Gagal refresh statistik", "error"));
  }, [loadGallery]);

  const navigateImage = useCallback(
    (dir: "prev" | "next") => {
      const idx = items.findIndex((i) => i.id === selectedImage?.id);
      const newIdx = dir === "prev" ? idx - 1 : idx + 1;
      if (newIdx >= 0 && newIdx < items.length) {
        setSelectedImage(items[newIdx]);
      }
      if (
        dir === "next" &&
        newIdx >= items.length - 3 &&
        page < totalPages &&
        !loading
      ) {
        loadMore();
      }
    },
    [items, selectedImage, page, totalPages, loading, loadMore],
  );

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback((ids: number[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setSelectionMode(false);
  }, []);

  useEffect(() => {
    localStorage.setItem("mimpi_columnCount", String(columnCount));
  }, [columnCount]);

  return (
    <GalleryContext.Provider
      value={{
        items,
        total,
        loading,
        hasMore: page < totalPages,
        filters,
        viewMode,
        columnCount,
        selectedImage,
        selectedIndex,
        sidebarCollapsed,
        stats,
        models,
        selectedIds,
        selectionMode,
        setSelectionMode,
        setFilters,
        setViewMode,
        setColumnCount,
        setSelectedImage,
        navigateImage,
        loadMore,
        refresh,
        setSidebarCollapsed,
        toggleSelect,
        selectAll,
        clearSelection,
      }}
    >
      {children}
    </GalleryContext.Provider>
  );
}

export function useGallery() {
  const ctx = useContext(GalleryContext);
  if (!ctx) throw new Error("useGallery must be used within GalleryProvider");
  return ctx;
}
