import { capcutPlugin } from "./capcut";
import { ffmpegPlugin } from "./ffmpeg";
import { obsPlugin } from "./obs";
import { davinciPlugin, premierePlugin } from "./premiere";
import { remotionPlugin } from "./remotion";
import { reelsPlugin, tiktokPlugin } from "./tiktok";
import type { CinematypePlugin, PluginId } from "./types";
import { whisperPlugin } from "./whisper";
import { youtubePlugin } from "./youtube";

/** Built-in destinations only (no community map — avoids cycles) */
export const PLUGIN_REGISTRY: Record<PluginId, CinematypePlugin> = {
  ffmpeg: ffmpegPlugin,
  capcut: capcutPlugin,
  youtube: youtubePlugin,
  tiktok: tiktokPlugin,
  reels: reelsPlugin,
  premiere: premierePlugin,
  davinci: davinciPlugin,
  whisper: whisperPlugin,
  remotion: remotionPlugin,
  obs: obsPlugin,
};
