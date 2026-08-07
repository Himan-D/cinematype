import type { CaptionCue } from "../video/captions";
import type { BrandKit } from "../video/brand";
import type { AspectId } from "../video/aspects";

export type PluginId =
  | "ffmpeg"
  | "capcut"
  | "youtube"
  | "tiktok"
  | "reels"
  | "premiere"
  | "davinci"
  | "whisper"
  | "remotion"
  | "obs";

export interface PluginContext {
  cues: CaptionCue[];
  brand: BrandKit;
  aspect: AspectId;
  title?: string;
  videoPath?: string;
}

export interface PluginExportFile {
  filename: string;
  mime: string;
  content: string | Blob;
  note?: string;
}

export interface PluginResult {
  files?: PluginExportFile[];
  commands?: string[];
  notes?: string[];
  data?: unknown;
}

export interface CinematypePlugin {
  id: PluginId;
  name: string;
  description: string;
  platforms: string[];
  /** Build export artifacts / commands for this tool */
  export: (ctx: PluginContext) => PluginResult;
}
