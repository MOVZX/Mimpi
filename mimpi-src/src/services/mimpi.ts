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
): Promise<GalleryResponse> {
  let url = `${API}/gallery?page=${page}&limit=48&sort=${sort}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (model) url += `&model=${encodeURIComponent(model)}`;
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
  for (const nodeId of ["157"]) {
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
): Promise<boolean> {
  const fd = new FormData();
  fd.append("image", imageBlob, `mimpi_${Date.now()}.png`);
  Object.entries(metadata).forEach(([k, v]) => fd.append(k, String(v ?? "")));
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
  return `/thumbnails/${item.thumbnail || item.filename}`;
}

export function getGalleryUrl(item: GalleryItem): string {
  return `/gallery/${item.filename}`;
}
