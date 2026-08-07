import type { FontId } from "../fonts";
import { fontStack } from "../fonts";
import type { CaptionCue } from "./captions";
import type { OverlayOptions } from "./captions";

export interface BrandKit {
  channelName: string;
  tagline?: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  fontDisplay: FontId | string;
  fontBody: FontId | string;
  lowerThirdTitle?: string;
  lowerThirdSubtitle?: string;
}

export const DEFAULT_BRAND_KIT: BrandKit = {
  channelName: "Your Channel",
  tagline: "New video every week",
  primaryColor: "#d8ff4a",
  secondaryColor: "#ffffff",
  backgroundColor: "#0b0b0f",
  fontDisplay: "bebas-neue",
  fontBody: "dm-sans",
  lowerThirdTitle: "Your Name",
  lowerThirdSubtitle: "Creator",
};

const STORAGE_KEY = "cinematype:brand-kit";

export function saveBrandKit(kit: BrandKit): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(kit));
}

export function loadBrandKit(): BrandKit {
  if (typeof localStorage === "undefined") return { ...DEFAULT_BRAND_KIT };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_BRAND_KIT };
    return { ...DEFAULT_BRAND_KIT, ...(JSON.parse(raw) as BrandKit) };
  } catch {
    return { ...DEFAULT_BRAND_KIT };
  }
}

export function clearBrandKit(): void {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

/** Overlay options tinted by brand */
export function brandOverlayOptions(
  kit: BrandKit,
  extras: OverlayOptions = {},
): OverlayOptions {
  return {
    fontFamily: fontStack(kit.fontDisplay),
    color: kit.secondaryColor,
    karaokeActiveColor: kit.primaryColor,
    karaokeInactiveColor: "rgba(255,255,255,0.4)",
    kinetic: true,
    ...extras,
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
  return {
    "--ct-brand-primary": kit.primaryColor,
    "--ct-brand-secondary": kit.secondaryColor,
    "--ct-brand-bg": kit.backgroundColor,
    "--ct-brand-display": fontStack(kit.fontDisplay),
    "--ct-brand-body": fontStack(kit.fontBody),
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
