import type {
  CinematypePlugin,
  PluginContext,
  PluginId,
  PluginResult,
} from "./types";
import { downloadBlob } from "../video/export";
import { PLUGIN_REGISTRY } from "./builtin";
import {
  getCommunityPlugin,
  listCommunityPlugins,
  resolvePlugin,
} from "./sdk";

export { PLUGIN_REGISTRY };

export function listPlugins(): CinematypePlugin[] {
  return [...Object.values(PLUGIN_REGISTRY), ...listCommunityPlugins()];
}

export function getPlugin(id: PluginId | string): CinematypePlugin {
  try {
    return resolvePlugin(id);
  } catch {
    const community = getCommunityPlugin(id);
    if (community) return community;
    throw new Error(
      `Unknown plugin "${id}". Available: ${listPlugins()
        .map((p) => p.id)
        .join(", ")}`,
    );
  }
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
