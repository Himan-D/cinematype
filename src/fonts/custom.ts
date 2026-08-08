/**
 * Phase 2 — custom (user) fonts registry (runtime, not package-vendored).
 */
import { FONT_CATALOG, fontStack as catalogFontStack, type FontId } from "./catalog";

export interface CustomFont {
  id: string;
  family: string;
  fallbacks?: string[];
  weightRange?: [number, number];
  useCases?: string[];
  cssUrl?: string;
}

const customFonts = new Map<string, CustomFont>();

/** Register a runtime/custom font (load CSS yourself or via cssUrl) */
export function registerCustomFont(input: CustomFont): CustomFont {
  if (!input.id || !input.family) {
    throw new Error("registerCustomFont requires id and family");
  }
  customFonts.set(input.id, input);
  if (input.cssUrl && typeof document !== "undefined") {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = input.cssUrl;
    document.head.appendChild(link);
  }
  return input;
}

export function unregisterCustomFont(id: string): boolean {
  return customFonts.delete(id);
}

export function listCustomFonts(): CustomFont[] {
  return [...customFonts.values()];
}

export function getCustomFont(id: string): CustomFont | undefined {
  return customFonts.get(id);
}

export function resolveFontId(id: string): boolean {
  return Boolean(customFonts.get(id) || FONT_CATALOG[id]);
}

export function fontStackWithCustom(id: string | FontId): string {
  const custom = customFonts.get(String(id));
  if (custom) {
    const fb = (custom.fallbacks ?? ["system-ui", "sans-serif"]).join(", ");
    return `"${custom.family}", ${fb}`;
  }
  return catalogFontStack(id);
}
