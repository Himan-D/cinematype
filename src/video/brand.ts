import type { FontId } from "../fonts";
import { fontStack } from "../fonts";
import type { CaptionCue } from "./captions";
import type { OverlayOptions } from "./captions";
import type { AssOptions } from "./formats";
import { hexToAssColour } from "./formats";

export type CaptionAnimation =
  | "none"
  | "fade"
  | "pop"
  | "slide"
  | "word-pop"
  | "karaoke"
  | "bounce"
  | "glitch";

export type CaptionStyle = {
  fontFamily: string; // FontId or CSS family
  fontWeight: number;
  fontSize: number; // px reference for 1080p
  color: string;
  highlightColor: string;
  stroke?: { color: string; width: number };
  shadow?: { color: string; blur: number; offsetX: number; offsetY: number };
  position: "top" | "center" | "bottom";
  alignment: "left" | "center" | "right";
  animation: CaptionAnimation;
};

/** Defaults matching current burn / subtitle overlay look */
export const DEFAULT_CAPTION_STYLE: CaptionStyle = {
  fontFamily: "space-grotesk",
  fontWeight: 600,
  fontSize: 56,
  color: "#ffffff",
  highlightColor: "#d8ff4a",
  stroke: { color: "#000000", width: 3 },
  shadow: { color: "rgba(0,0,0,0.65)", blur: 16, offsetX: 0, offsetY: 2 },
  position: "bottom",
  alignment: "center",
  animation: "fade",
};

export interface BrandKit {
  id?: string;
  name?: string;
  channelName: string;
  tagline?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  backgroundColor: string;
  /** Preferred nested fonts (heading / body / caption) */
  fonts?: { heading: string; body: string; caption: string };
  /** Legacy flat font fields — kept for compat */
  fontDisplay: FontId | string;
  fontBody: FontId | string;
  fontCaption?: FontId | string;
  caption?: CaptionStyle;
  lowerThirdTitle?: string;
  lowerThirdSubtitle?: string;
  logo?: string;
}

export const DEFAULT_BRAND_KIT: BrandKit = {
  id: "default",
  name: "Default",
  channelName: "Your Channel",
  tagline: "New video every week",
  primaryColor: "#d8ff4a",
  secondaryColor: "#ffffff",
  accentColor: "#d8ff4a",
  backgroundColor: "#0b0b0f",
  fonts: {
    heading: "bebas-neue",
    body: "dm-sans",
    caption: "space-grotesk",
  },
  fontDisplay: "bebas-neue",
  fontBody: "dm-sans",
  fontCaption: "space-grotesk",
  caption: { ...DEFAULT_CAPTION_STYLE },
  lowerThirdTitle: "Your Name",
  lowerThirdSubtitle: "Creator",
};

const STORAGE_KEY = "cinematype:brand-kit";
const KITS_STORAGE_KEY = "cinematype:brand-kits";

type BrandKitsStore = {
  activeId: string;
  kits: BrandKit[];
};

function newKitId(): string {
  return `kit-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Normalize legacy kits: fill fonts + caption from flat fields / defaults */
export function migrateBrandKit(raw: Partial<BrandKit> | null | undefined): BrandKit {
  const input = raw ?? {};
  const merged: BrandKit = {
    ...DEFAULT_BRAND_KIT,
    ...input,
  };

  // Prefer explicit raw fonts / flat fields over DEFAULT nested fonts
  const heading =
    input.fonts?.heading ??
    input.fontDisplay ??
    DEFAULT_BRAND_KIT.fonts!.heading;
  const body =
    input.fonts?.body ?? input.fontBody ?? DEFAULT_BRAND_KIT.fonts!.body;
  const captionFont =
    input.fonts?.caption ??
    input.fontCaption ??
    input.fonts?.body ??
    input.fontBody ??
    DEFAULT_BRAND_KIT.fonts!.caption;

  merged.fonts = { heading, body, caption: captionFont };
  merged.fontDisplay = heading;
  merged.fontBody = body;
  merged.fontCaption = captionFont;

  const baseCaption = {
    ...DEFAULT_CAPTION_STYLE,
    ...(DEFAULT_BRAND_KIT.caption ?? {}),
    ...(input.caption ?? {}),
  };
  merged.caption = {
    ...baseCaption,
    fontFamily: input.caption?.fontFamily ?? captionFont,
    color: input.caption?.color ?? input.secondaryColor ?? baseCaption.color,
    highlightColor:
      input.caption?.highlightColor ??
      input.primaryColor ??
      baseCaption.highlightColor,
  };

  if (!merged.id) merged.id = input.id ?? newKitId();
  if (!merged.name) merged.name = input.name ?? (merged.channelName || "Brand kit");

  return merged;
}

function readKitsStore(): BrandKitsStore | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(KITS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BrandKitsStore;
    if (!parsed || !Array.isArray(parsed.kits)) return null;
    return {
      activeId: parsed.activeId || parsed.kits[0]?.id || "default",
      kits: parsed.kits.map((k) => migrateBrandKit(k)),
    };
  } catch {
    return null;
  }
}

function writeKitsStore(store: BrandKitsStore): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(KITS_STORAGE_KEY, JSON.stringify(store));
}

function defaultStore(): BrandKitsStore {
  const kit = migrateBrandKit({ ...DEFAULT_BRAND_KIT });
  return { activeId: kit.id!, kits: [kit] };
}

/** Ensure multi-kit store exists; migrate single-kit key when present */
function ensureKitsStore(): BrandKitsStore {
  const existing = readKitsStore();
  if (existing && existing.kits.length) return existing;

  if (typeof localStorage !== "undefined") {
    try {
      const legacy = localStorage.getItem(STORAGE_KEY);
      if (legacy) {
        const kit = migrateBrandKit(JSON.parse(legacy) as Partial<BrandKit>);
        const store: BrandKitsStore = { activeId: kit.id!, kits: [kit] };
        writeKitsStore(store);
        localStorage.removeItem(STORAGE_KEY);
        return store;
      }
    } catch {
      // fall through to default
    }
  }

  const store = defaultStore();
  writeKitsStore(store);
  return store;
}

export function listBrandKits(): BrandKit[] {
  return ensureKitsStore().kits.map((k) => migrateBrandKit(k));
}

export function saveBrandKits(kits: BrandKit[], activeId: string): void {
  const normalized = kits.map((k) => migrateBrandKit(k));
  const id =
    normalized.find((k) => k.id === activeId)?.id ??
    normalized[0]?.id ??
    "default";
  writeKitsStore({ activeId: id, kits: normalized });
  const active = normalized.find((k) => k.id === id);
  if (active && typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(active));
  }
}

export function getActiveBrandKit(): BrandKit {
  const store = ensureKitsStore();
  const found = store.kits.find((k) => k.id === store.activeId);
  return migrateBrandKit(found ?? store.kits[0] ?? DEFAULT_BRAND_KIT);
}

export function setActiveBrandKit(id: string): BrandKit {
  const store = ensureKitsStore();
  const found = store.kits.find((k) => k.id === id);
  if (!found) return getActiveBrandKit();
  writeKitsStore({ ...store, activeId: id });
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
  }
  return migrateBrandKit(found);
}

export function upsertBrandKit(kit: BrandKit): BrandKit {
  const store = ensureKitsStore();
  const next = migrateBrandKit(kit);
  const idx = store.kits.findIndex((k) => k.id === next.id);
  const kits = [...store.kits];
  if (idx >= 0) kits[idx] = next;
  else kits.push(next);
  writeKitsStore({ activeId: next.id!, kits });
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  return next;
}

export function deleteBrandKit(id: string): BrandKit[] {
  const store = ensureKitsStore();
  const kits = store.kits.filter((k) => k.id !== id);
  if (!kits.length) {
    const fallback = migrateBrandKit({ ...DEFAULT_BRAND_KIT });
    writeKitsStore({ activeId: fallback.id!, kits: [fallback] });
    return [fallback];
  }
  const activeId =
    store.activeId === id ? (kits[0]!.id as string) : store.activeId;
  writeKitsStore({ activeId, kits });
  return kits.map((k) => migrateBrandKit(k));
}

/** Persist the active kit (compat wrapper) */
export function saveBrandKit(kit: BrandKit): void {
  const next = migrateBrandKit(kit);
  upsertBrandKit(next);
  setActiveBrandKit(next.id!);
}

/** Load active kit; migrates legacy single-kit storage */
export function loadBrandKit(): BrandKit {
  return getActiveBrandKit();
}

export function clearBrandKit(): void {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(KITS_STORAGE_KEY);
}

function captionFontFamily(kit: BrandKit): string {
  const id =
    kit.caption?.fontFamily ??
    kit.fonts?.caption ??
    kit.fontCaption ??
    kit.fontBody;
  return fontStack(id);
}

function headingFontFamily(kit: BrandKit): string {
  const id = kit.fonts?.heading ?? kit.fontDisplay;
  return fontStack(id);
}

/** Overlay options tinted by brand + CaptionStyle */
export function brandOverlayOptions(
  kit: BrandKit,
  extras: OverlayOptions = {},
): OverlayOptions {
  const migrated = migrateBrandKit(kit);
  const caption = migrated.caption ?? DEFAULT_CAPTION_STYLE;
  return {
    fontFamily: captionFontFamily(migrated),
    color: caption.color,
    karaokeActiveColor: caption.highlightColor,
    karaokeInactiveColor: "rgba(255,255,255,0.4)",
    kinetic: caption.animation !== "none",
    ...extras,
  };
}

/** Map BrandKit CaptionStyle → ASS style options */
export function brandToAssOptions(
  kit: BrandKit,
  width?: number,
  height?: number,
): AssOptions {
  const migrated = migrateBrandKit(kit);
  const caption = migrated.caption ?? DEFAULT_CAPTION_STYLE;
  const fontName = (() => {
    const family = caption.fontFamily || migrated.fonts?.caption || "space-grotesk";
    try {
      const stack = fontStack(family);
      const first = stack.split(",")[0]?.trim().replace(/^["']|["']$/g, "");
      return first || "Space Grotesk";
    } catch {
      return family;
    }
  })();

  return {
    title: migrated.channelName,
    width: width ?? 1920,
    height: height ?? 1080,
    fontName,
    fontSize: caption.fontSize,
    primaryColour: hexToAssColour(caption.color),
  };
}

/** Inject channel lower-third into cue list (or replace first speaker/lower-third) */
export function applyBrandToCues(cues: CaptionCue[], kit: BrandKit): CaptionCue[] {
  const label = [kit.lowerThirdTitle ?? kit.channelName, kit.lowerThirdSubtitle]
    .filter(Boolean)
    .join("  ·  ");
  let replaced = false;
  const next = cues.map((cue) => {
    if (!replaced && (cue.style === "lower-third" || cue.style === "speaker")) {
      replaced = true;
      return { ...cue, text: label, style: "lower-third" as const, align: "start" as const };
    }
    return cue;
  });
  if (!replaced && cues.length) {
    const last = cues[cues.length - 1]!;
    next.push({
      start: last.end,
      end: last.end + 3,
      text: label,
      style: "lower-third",
      align: "start",
    });
  }
  return next;
}

/** CSS variables for brand theming */
export function brandToCssVars(kit: BrandKit): Record<string, string> {
  const migrated = migrateBrandKit(kit);
  return {
    "--ct-brand-primary": migrated.primaryColor,
    "--ct-brand-secondary": migrated.secondaryColor,
    "--ct-brand-accent": migrated.accentColor ?? migrated.primaryColor,
    "--ct-brand-bg": migrated.backgroundColor,
    "--ct-brand-display": headingFontFamily(migrated),
    "--ct-brand-body": fontStack(migrated.fonts?.body ?? migrated.fontBody),
    "--ct-brand-caption": captionFontFamily(migrated),
  };
}

export function applyBrandCssVars(
  kit: BrandKit,
  target: HTMLElement | null = typeof document !== "undefined"
    ? document.documentElement
    : null,
): void {
  if (!target) return;
  for (const [k, v] of Object.entries(brandToCssVars(kit))) {
    target.style.setProperty(k, v);
  }
}
