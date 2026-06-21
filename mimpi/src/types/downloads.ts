export type DownloadStatus =
  | "pending"
  | "downloading"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled";

export type DownloadType = "lora" | "model" | "image";

export interface DownloadItem {
  id: string;
  filename: string;
  url: string;
  type: DownloadType;
  status: DownloadStatus;
  bytesReceived: number;
  totalBytes: number | null;
  speed: number;
  progress: number;
  error?: string;
  destPath: string;
  tempPath: string;
  createdAt: number;
  completedAt?: number;
  modelVersionId?: number;
  resourceName?: string;
}

export interface DownloadRequest {
  modelVersionId: number;
  resourceName: string;
  type: DownloadType;
  destDir?: string;
}

export interface DownloadProgress {
  id: string;
  bytesReceived: number;
  totalBytes: number | null;
  speed: number;
  progress: number;
}

export interface DownloadResult {
  id: string;
  success: boolean;
  path?: string;
  error?: string;
}

export interface DownloadManagerState {
  downloads: DownloadItem[];
  activeDownloads: number;
  maxConcurrent: number;
}
