import type { CinematypePlugin } from "./types";

/** Mutable community plugin map (shared by SDK + registry) */
export const COMMUNITY_PLUGIN_REGISTRY = new Map<string, CinematypePlugin>();
