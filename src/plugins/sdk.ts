/**
 * Phase 4 — Plugin SDK: register community destination adapters.
 */
import { COMMUNITY_PLUGIN_REGISTRY } from "./community-registry";
import { PLUGIN_REGISTRY } from "./builtin";
import type {
  CinematypePlugin,
  PluginContext,
  PluginId,
  PluginResult,
} from "./types";

export type AnyPluginId = PluginId | (string & {});

/** Create a plugin with required fields validated */
export function createPlugin(
  plugin: CinematypePlugin & { id: string },
): CinematypePlugin {
  if (!plugin.id || !plugin.name || typeof plugin.export !== "function") {
    throw new Error("createPlugin requires id, name, and export()");
  }
  return plugin as CinematypePlugin;
}

/** Register a community / custom destination (does not override built-ins) */
export function registerPlugin(plugin: CinematypePlugin & { id: string }): void {
  const id = plugin.id;
  if (id in PLUGIN_REGISTRY) {
    throw new Error(
      `Cannot override built-in destination "${id}". Choose a different id.`,
    );
  }
  if (COMMUNITY_PLUGIN_REGISTRY.has(id)) {
    throw new Error(`Plugin "${id}" is already registered`);
  }
  COMMUNITY_PLUGIN_REGISTRY.set(id, plugin as CinematypePlugin);
}

export function unregisterPlugin(id: string): boolean {
  return COMMUNITY_PLUGIN_REGISTRY.delete(id);
}

export function listCommunityPlugins(): CinematypePlugin[] {
  return [...COMMUNITY_PLUGIN_REGISTRY.values()];
}

export function getCommunityPlugin(id: string): CinematypePlugin | undefined {
  return COMMUNITY_PLUGIN_REGISTRY.get(id);
}

export function resolvePlugin(id: string): CinematypePlugin {
  if (id in PLUGIN_REGISTRY) return PLUGIN_REGISTRY[id as PluginId];
  const community = COMMUNITY_PLUGIN_REGISTRY.get(id);
  if (community) return community;
  throw new Error(
    `Unknown plugin "${id}". Built-ins: ${Object.keys(PLUGIN_REGISTRY).join(", ")}. Community: ${[...COMMUNITY_PLUGIN_REGISTRY.keys()].join(", ") || "(none)"}`,
  );
}

export function runAnyPlugin(id: string, ctx: PluginContext): PluginResult {
  return resolvePlugin(id).export(ctx);
}

export type { PluginContext, PluginResult, CinematypePlugin };
