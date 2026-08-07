import { capcutPlugin } from "./capcut";
import { ffmpegPlugin } from "./ffmpeg";
import { obsPlugin } from "./obs";
import { davinciPlugin, premierePlugin } from "./premiere";
import { remotionPlugin } from "./remotion";
import { reelsPlugin, tiktokPlugin } from "./tiktok";
import type {
  CinematypePlugin,
  PluginContext,
  PluginId,
  PluginResult,
} from "./types";
import { whisperPlugin } from "./whisper";
import { youtubePlugin } from "./youtube";
import { downloadBlob } from "../video/export";

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

export function listPlugins(): CinematypePlugin[] {
  return Object.values(PLUGIN_REGISTRY);
}

export function getPlugin(id: PluginId | string): CinematypePlugin {
  const plugin = PLUGIN_REGISTRY[id as PluginId];
  if (!plugin) {
    throw new Error(
      `Unknown plugin "${id}". Available: ${Object.keys(PLUGIN_REGISTRY).join(", ")}`,
    );
  }
  return plugin;
}

export function runPlugin(
  id: PluginId | string,
  ctx: PluginContext,
): PluginResult {
  return getPlugin(id).export(ctx);
}

/** Download every text file a plugin produces (browser) */
export function downloadPluginPack(
  id: PluginId | string,
  ctx: PluginContext,
): PluginResult {
  const result = runPlugin(id, ctx);
  for (const file of result.files ?? []) {
    if (typeof file.content === "string") {
      const blob = new Blob([file.content], {
        type: `${file.mime};charset=utf-8`,
      });
      downloadBlob(blob, file.filename);
    } else {
      downloadBlob(file.content, file.filename);
    }
  }
  return result;
}
