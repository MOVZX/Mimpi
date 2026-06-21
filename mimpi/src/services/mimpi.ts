import type {
  GalleryItem,
  GalleryResponse,
  Stats,
  CheckpointCategory,
  PresetsData,
} from "@/types";

const API = "/api";

// Fetch with credentials (cookies) for session auth
async function fetchApi(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  return fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}

export async function fetchGallery(
  page = 1,
  sort = "newest",
  search = "",
  model = "",
  gallery = "",
): Promise<GalleryResponse> {
  let url = `${API}/gallery?page=${page}&limit=48&sort=${sort}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (model) url += `&model=${encodeURIComponent(model)}`;
  if (gallery) url += `&gallery=${encodeURIComponent(gallery)}`;
  const res = await fetchApi(url);
  if (!res.ok) throw new Error("Failed to fetch gallery");
  return res.json();
}

export async function fetchStats(): Promise<Stats> {
  const res = await fetchApi(`${API}/stats`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export async function fetchModels(): Promise<string[]> {
  const res = await fetchApi(`${API}/models`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.models || [];
}

export async function deleteImage(id: number): Promise<void> {
  const res = await fetchApi(`${API}/gallery/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete");
}

export async function batchDeleteImages(ids: number[]): Promise<void> {
  const res = await fetchApi(`${API}/gallery/batch-delete`, {
    method: "POST",
    body: JSON.stringify(ids),
  });
  if (!res.ok) throw new Error("Failed to batch delete");
}

export async function fetchCheckpoints(): Promise<CheckpointCategory[]> {
  const res = await fetchApi(`${API}/checkpoints`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.categories || [];
}

export async function fetchPresets(): Promise<PresetsData> {
  const res = await fetchApi(`${API}/presets`);
  if (!res.ok) return {};
  return res.json();
}

export async function generateImage(
  workflow: Record<string, unknown>,
): Promise<{ prompt_id: string }> {
  const res = await fetchApi(`${API}/generate`, {
    method: "POST",
    body: JSON.stringify({ workflow }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function pollHistory(
  promptId: string,
): Promise<{ filename: string; subfolder: string; type: string } | null> {
  const res = await fetchApi(`${API}/history/${promptId}`);
  if (!res.ok) return null;
  const history = await res.json();
  const outputs = history[promptId]?.outputs;
  if (!outputs) return null;
  for (const nodeId of ["9", "157", "267"]) {
    if (outputs[nodeId]?.images?.[0]) return outputs[nodeId].images[0];
  }
  return null;
}

export function getImageUrl(
  filename: string,
  subfolder = "",
  type = "output",
): string {
  return `/api/view?filename=${encodeURIComponent(filename)}&subfolder=${encodeURIComponent(subfolder)}&type=${encodeURIComponent(type)}`;
}

export async function saveToGallery(
  imageBlob: Blob,
  metadata: Record<string, unknown>,
  galleryName = "",
): Promise<boolean> {
  const fd = new FormData();
  fd.append("image", imageBlob, `mimpi_${Date.now()}.png`);
  Object.entries(metadata).forEach(([k, v]) => fd.append(k, String(v ?? "")));
  if (galleryName) fd.append("galleryName", galleryName);
  try {
    const res = await fetch(`${API}/save`, {
      method: "POST",
      body: fd,
      credentials: "include",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function getThumbnailUrl(item: GalleryItem): string {
  const thumb = item.thumbnail || item.filename;
  if (item.galleryName) {
    return `/api/image/${encodeURIComponent(item.galleryName)}/${encodeURIComponent(thumb)}`;
  }
  return `/api/image/${encodeURIComponent(thumb)}`;
}

export function getGalleryUrl(item: GalleryItem): string {
  if (item.galleryName) {
    return `/api/image/${encodeURIComponent(item.galleryName)}/${encodeURIComponent(item.filename)}`;
  }
  return `/api/image/${encodeURIComponent(item.filename)}`;
}

// ── Z-Image Presets ──
export interface ZimagePreset {
  id: number;
  title: string;
  prompt: string;
  negative: string;
  model: string;
  sampler: string;
  scheduler: string;
  steps: number;
  cfg: number;
  width: number;
  height: number;
  created_at: string;
}

export async function fetchZimagePresets(): Promise<ZimagePreset[]> {
  const res = await fetchApi(`${API}/zimage-presets`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.presets || [];
}

export async function createZimagePreset(
  data: Partial<ZimagePreset> & { title: string; prompt: string },
): Promise<boolean> {
  const res = await fetchApi(`${API}/zimage-presets`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.ok;
}

export async function deleteZimagePreset(id: number): Promise<boolean> {
  const res = await fetchApi(`${API}/zimage-presets/${id}`, {
    method: "DELETE",
  });
  return res.ok;
}

export async function updateZimagePreset(
  id: number,
  data: Partial<ZimagePreset> & { title: string; prompt: string },
): Promise<boolean> {
  const res = await fetchApi(`${API}/zimage-presets/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.ok;
}

// ── SDXL Presets ──
export interface SdxlPreset {
  id: number;
  title: string;
  prompt: string;
  negative: string;
  model: string;
  sampler: string;
  scheduler: string;
  steps: number;
  cfg: number;
  width: number;
  height: number;
  res_mode: string;
  loras: string;
  use_dynamic_seed: boolean;
  use_inc_seed: boolean;
  created_at: string;
}

export async function fetchSdxlPresets(): Promise<SdxlPreset[]> {
  const res = await fetchApi(`${API}/sdxl-presets`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.presets || [];
}

export async function createSdxlPreset(
  data: Partial<SdxlPreset> & { title: string; prompt: string },
): Promise<boolean> {
  const res = await fetchApi(`${API}/sdxl-presets`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.ok;
}

export async function deleteSdxlPreset(id: number): Promise<boolean> {
  const res = await fetchApi(`${API}/sdxl-presets/${id}`, {
    method: "DELETE",
  });
  return res.ok;
}

export async function updateSdxlPreset(
  id: number,
  data: Partial<SdxlPreset> & { title: string; prompt: string },
): Promise<boolean> {
  const res = await fetchApi(`${API}/sdxl-presets/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.ok;
}

// ── Z-Image LoRA List ──
export async function fetchZimageLoras(): Promise<string[]> {
  const res = await fetchApi(`${API}/zimage/loras`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.loras || [];
}

// ── Gallery CRUD ──
export interface Gallery {
  id: number;
  name: string;
  created_at: string;
}

export async function fetchGalleries(): Promise<Gallery[]> {
  const res = await fetchApi(`${API}/galleries`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.galleries || [];
}

export async function createGallery(
  name: string,
): Promise<{ id: number; name: string } | null> {
  const res = await fetchApi(`${API}/galleries`, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function updateGallery(
  id: number,
  name: string,
): Promise<boolean> {
  const res = await fetchApi(`${API}/galleries/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name }),
  });
  return res.ok;
}

export async function deleteGallery(id: number): Promise<boolean> {
  const res = await fetchApi(`${API}/galleries/${id}`, {
    method: "DELETE",
  });
  return res.ok;
}

// ── Z-Image Models Registry ──
export interface ZimageModelEntry {
  name: string;
  file: string;
}

export interface ZimageModelsResponse {
  checkpoints: ZimageModelEntry[];
  loras: string[];
}

export async function fetchZimageModels(): Promise<ZimageModelsResponse> {
  try {
    const res = await fetchApi(`${API}/zimage-models`);
    if (!res.ok) return { checkpoints: [], loras: [] };
    return await res.json();
  } catch {
    return { checkpoints: [], loras: [] };
  }
}
