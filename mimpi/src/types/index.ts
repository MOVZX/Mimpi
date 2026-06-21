export interface GalleryItem {
  id: number;
  filename: string;
  thumbnail?: string;
  prompt: string;
  promptNegative: string;
  seed: string;
  checkpoint: string;
  sampler: string;
  scheduler: string;
  steps: number;
  cfg: number;
  resolution: string;
  imageMode: string;
  galleryName: string;
  width?: number;
  height?: number;
  timestamp: string;
  storageMode?: string;
}

export interface GalleryResponse {
  items: GalleryItem[];
  total: number;
  page: number;
  total_pages: number;
}

export interface Stats {
  total: number;
  top_models?: { name: string; count: number }[];
  samplers?: { name: string; count: number }[];
  monthly?: { month: string; count: number }[];
}

export interface GalleryFilters {
  query: string;
  sort: "newest" | "oldest";
  model: string;
  gallery: string;
}

export interface CheckpointModel {
  filename: string;
  displayName: string;
  mapping?: Record<string, unknown>;
}

export interface CheckpointCategory {
  name: string;
  models: CheckpointModel[];
}

export interface PresetsData {
  general?: Record<string, { label: string; prompts: Record<string, string> }>;
  sfw?: Record<string, { label: string; prompts: Record<string, string> }>;
  nsfw?: Record<string, { label: string; prompts: Record<string, string> }>;
}

export type TabId = "gallery" | "generate" | "stats";

export type ViewMode = "masonry" | "grid" | "list";
