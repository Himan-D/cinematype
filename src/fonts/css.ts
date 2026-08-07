import {
  FONT_CATALOG,
  ROLE_DEFAULTS,
  type FontFamily,
  type FontId,
  type FontRole,
  getFont,
} from "./catalog";

export interface FontFaceCssOptions {
  /**
   * How to resolve font file URLs in CSS.
   * - `relative` — paths relative to the CSS file location (bundlers / styles/)
   * - `package` — bare package paths for documentation
   * - custom function
   */
  resolveUrl?: "relative" | "package" | ((path: string) => string);
  /** font-display strategy */
  display?: "auto" | "block" | "swap" | "fallback" | "optional";
  /** Include metric overrides to reduce CLS */
  metrics?: boolean;
  /** Subset of font ids; default all */
  fonts?: Array<FontId | string>;
  /**
   * Prefix for relative paths from styles/ folder.
   * Default `../` so styles/fonts.css can live next to fonts/.
   */
  relativePrefix?: string;
}

function resolveFontUrl(
  path: string,
  options: FontFaceCssOptions,
): string {
  const resolve = options.resolveUrl ?? "relative";
  if (typeof resolve === "function") return resolve(path);
  if (resolve === "package") return path;
  const prefix = options.relativePrefix ?? "../";
  return `${prefix}${path}`;
}

function faceRule(
  font: FontFamily,
  options: FontFaceCssOptions,
): string {
  const display = options.display ?? "swap";
  const useMetrics = options.metrics !== false && font.metrics;

  return font.files
    .map((file) => {
      const url = resolveFontUrl(file.path, options);
      const metricLines = useMetrics
        ? [
            font.metrics?.ascentOverride
              ? `  ascent-override: ${font.metrics.ascentOverride};`
              : null,
            font.metrics?.descentOverride
              ? `  descent-override: ${font.metrics.descentOverride};`
              : null,
            font.metrics?.lineGapOverride
              ? `  line-gap-override: ${font.metrics.lineGapOverride};`
              : null,
            font.metrics?.sizeAdjust
              ? `  size-adjust: ${font.metrics.sizeAdjust};`
              : null,
          ]
            .filter(Boolean)
            .join("\n")
        : "";

      return `@font-face {
  font-family: ${JSON.stringify(font.family)};
  src: url(${JSON.stringify(url)}) format("woff2-variations"),
       url(${JSON.stringify(url)}) format("woff2");
  font-weight: ${file.weight};
  font-style: ${file.style};
  font-display: ${display};
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
${metricLines}
}`.trim();
    })
    .join("\n\n");
}

/** Generate @font-face CSS for selected (or all) catalog fonts */
export function generateFontFaceCss(options: FontFaceCssOptions = {}): string {
  const ids = options.fonts ?? (Object.keys(FONT_CATALOG) as FontId[]);
  const blocks = ids.map((id) => faceRule(getFont(id), options));
  return `/* cinematype — variable font faces (OFL) */\n\n${blocks.join("\n\n")}\n`;
}

/** Utility class map: .ct-font-inter { font-family: ... } */
export function generateFontUtilityCss(): string {
  const lines = Object.values(FONT_CATALOG).map((font) => {
    const stack = [JSON.stringify(font.family), ...font.fallback].join(", ");
    return `.ct-font-${font.id} {\n  font-family: ${stack};\n}`;
  });

  const roles = (Object.keys(ROLE_DEFAULTS) as FontRole[])
    .map((role) => {
      const font = getFont(ROLE_DEFAULTS[role]);
      const stack = [JSON.stringify(font.family), ...font.fallback].join(", ");
      return `.ct-${role} { font-family: ${stack}; }`;
    })
    .join("\n");

  return `/* cinematype — font utility classes */\n\n${lines.join("\n\n")}\n\n${roles}\n`;
}
