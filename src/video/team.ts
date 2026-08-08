/**
 * Phase 4 — team brand kit pack (shareable JSON).
 */
import {
  listBrandKits,
  migrateBrandKit,
  saveBrandKits,
  type BrandKit,
} from "./brand";

export interface TeamBrandPack {
  version: 1;
  team: string;
  updatedAt: string;
  kits: BrandKit[];
  activeId?: string;
}

export function createTeamBrandPack(
  team: string,
  kits: BrandKit[],
  activeId?: string,
): TeamBrandPack {
  return {
    version: 1,
    team,
    updatedAt: new Date().toISOString(),
    kits: kits.map((k) => migrateBrandKit(k)),
    activeId,
  };
}

export function serializeTeamBrandPack(pack: TeamBrandPack): string {
  return `${JSON.stringify(pack, null, 2)}\n`;
}

export function parseTeamBrandPack(raw: string): TeamBrandPack {
  const parsed = JSON.parse(raw) as TeamBrandPack;
  if (parsed.version !== 1 || !Array.isArray(parsed.kits) || !parsed.team) {
    throw new Error("Invalid team brand pack");
  }
  return {
    version: 1,
    team: parsed.team,
    updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    kits: parsed.kits.map((k) => migrateBrandKit(k)),
    activeId: parsed.activeId,
  };
}

/** Merge pack kits into local multi-kit storage (browser / localStorage) */
export function importTeamBrandPack(pack: TeamBrandPack): BrandKit[] {
  const existing = listBrandKits();
  const byId = new Map(existing.map((k) => [k.id!, k]));
  for (const kit of pack.kits) {
    byId.set(kit.id!, migrateBrandKit(kit));
  }
  const merged = [...byId.values()];
  const activeId = pack.activeId ?? merged[0]?.id ?? "default";
  saveBrandKits(merged, activeId);
  return merged;
}
