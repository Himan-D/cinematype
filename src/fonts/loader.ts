import {
  FONT_CATALOG,
  type FontId,
  getFont,
  fontStack,
} from "./catalog";
import { generateFontFaceCss } from "./css";

export type FontLoadStatus = "idle" | "loading" | "loaded" | "error";

export interface LoadFontsOptions {
  fonts?: Array<FontId | string>;
  /** Inject generated @font-face CSS into document head */
  injectCss?: boolean;
  /** CSS id attribute for the injected style tag */
  styleId?: string;
  /**
   * Base URL for font files when injecting CSS without a bundler.
   * e.g. "https://cdn.example.com/cinematype/" or "/node_modules/cinematype/"
   */
  baseUrl?: string;
  display?: "auto" | "block" | "swap" | "fallback" | "optional";
  /** Timeout in ms before rejecting (0 = no timeout) */
  timeoutMs?: number;
}

export interface FontLoadResult {
  loaded: string[];
  failed: Array<{ id: string; error: string }>;
  status: FontLoadStatus;
}

let injected = false;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export { prefersReducedMotion };

/** Inject @font-face rules once */
export function injectFontCss(options: LoadFontsOptions = {}): void {
  if (typeof document === "undefined") return;
  const styleId = options.styleId ?? "cinematype-fonts";
  if (document.getElementById(styleId)) {
    injected = true;
    return;
  }

  const css = generateFontFaceCss({
    fonts: options.fonts,
    display: options.display ?? "swap",
    resolveUrl: options.baseUrl
      ? (path) => {
          const base = options.baseUrl!.replace(/\/?$/, "/");
          return `${base}${path}`;
        }
      : "package",
  });

  const style = document.createElement("style");
  style.id = styleId;
  style.setAttribute("data-cinematype", "fonts");
  style.textContent = css;
  document.head.appendChild(style);
  injected = true;
}

/**
 * Load catalog fonts via the CSS Font Loading API.
 * Waits until faces are ready so kinetic animations don't jump.
 */
export async function loadFonts(
  options: LoadFontsOptions = {},
): Promise<FontLoadResult> {
  const ids = options.fonts ?? (Object.keys(FONT_CATALOG) as FontId[]);
  const loaded: string[] = [];
  const failed: Array<{ id: string; error: string }> = [];

  if (typeof document === "undefined") {
    return { loaded, failed: ids.map((id) => ({ id, error: "no document" })), status: "error" };
  }

  if (options.injectCss !== false) {
    injectFontCss(options);
  }

  const loadOne = async (id: string) => {
    const font = getFont(id);
    const sampleWeight = Math.round((font.weightRange[0] + font.weightRange[1]) / 2);
    // Trigger load for a mid-weight sample of each style present
    const styles = new Set(font.files.map((f) => f.style));
    const jobs: Promise<FontFace[]>[] = [];
    for (const style of styles) {
      const descriptor =
        style === "italic"
          ? `italic ${sampleWeight} 16px "${font.family}"`
          : `${sampleWeight} 16px "${font.family}"`;
      jobs.push(document.fonts.load(descriptor));
    }
    await Promise.all(jobs);
    loaded.push(id);
  };

  const work = Promise.all(
    ids.map(async (id) => {
      try {
        await loadOne(id);
      } catch (err) {
        failed.push({
          id,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }),
  );

  if (options.timeoutMs && options.timeoutMs > 0) {
    await Promise.race([
      work,
      new Promise<void>((resolve) => setTimeout(resolve, options.timeoutMs)),
    ]);
  } else {
    await work;
  }

  // Also wait for document.fonts.ready for any pending faces
  try {
    await document.fonts.ready;
  } catch {
    /* ignore */
  }

  const status: FontLoadStatus =
    failed.length === 0 ? "loaded" : loaded.length > 0 ? "loaded" : "error";

  return { loaded, failed, status };
}

/** Apply a catalog font to an element (inline style + optional CSS variable) */
export function applyFont(
  el: HTMLElement,
  id: FontId | string,
  options?: { weight?: number; italic?: boolean; cssVar?: string },
): void {
  const font = getFont(id);
  el.style.fontFamily = fontStack(id);
  if (options?.weight != null) {
    el.style.fontWeight = String(options.weight);
    el.style.fontVariationSettings = `"wght" ${options.weight}`;
  }
  if (options?.italic) {
    el.style.fontStyle = "italic";
  }
  if (options?.cssVar) {
    el.style.setProperty(options.cssVar, fontStack(id));
  }
}

/** Set CSS variables on :root for Tailwind / design systems */
export function applyFontVariables(
  mapping: Partial<Record<string, FontId | string>> = {
    "--font-sans": "inter",
    "--font-ui": "dm-sans",
    "--font-display": "sora",
    "--font-soft": "rubik",
    "--font-serif": "playfair-display",
    "--font-hero": "bricolage-grotesque",
    "--font-impact": "bebas-neue",
    "--font-script": "caveat",
    "--font-condensed": "archivo",
    "--font-mono": "jetbrains-mono",
    "--font-mono-ui": "geist-mono",
  },
  target: HTMLElement | null = typeof document !== "undefined" ? document.documentElement : null,
): void {
  if (!target) return;
  for (const [cssVar, id] of Object.entries(mapping)) {
    if (!id) continue;
    target.style.setProperty(cssVar, fontStack(id));
  }
}

export function isCssInjected(): boolean {
  return injected;
}

/** Check if a family is available in document.fonts */
export function isFontAvailable(family: string): boolean {
  if (typeof document === "undefined" || !document.fonts?.check) return false;
  return document.fonts.check(`16px "${family}"`);
}
