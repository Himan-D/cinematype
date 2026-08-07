/**
 * Curated variable + display font catalog for content creators.
 * Binaries are OFL-licensed originals; Cinematype layers loading + roles on top.
 */

export type FontRole =
  | "body"
  | "ui"
  | "display"
  | "soft"
  | "editorial"
  | "bold-display"
  | "impact"
  | "condensed"
  | "script"
  | "serif"
  | "mono"
  | "mono-ui";

export type FontAxis = "wght" | "opsz" | "wdth" | "SOFT" | "WONK" | "ital";

export interface FontFaceFile {
  /** Path relative to package root (used in CSS url()) */
  path: string;
  style: "normal" | "italic";
  /** CSS font-weight range for variable fonts, or single weight */
  weight: string;
}

export interface FontFamily {
  id: string;
  /** CSS font-family name (OFL original name) */
  family: string;
  role: FontRole;
  description: string;
  /** Creator-facing use cases */
  useCases: string[];
  axes: FontAxis[];
  weightRange: [number, number];
  files: FontFaceFile[];
  fallback: string[];
  /** Metric overrides reduce CLS vs system fallbacks */
  metrics?: {
    ascentOverride?: string;
    descentOverride?: string;
    lineGapOverride?: string;
    sizeAdjust?: string;
  };
  license: "OFL-1.1";
  designer: string;
}

export const FONT_CATALOG: Record<string, FontFamily> = {
  inter: {
    id: "inter",
    family: "Inter",
    role: "body",
    description: "Precision UI & body sans. The default reading face.",
    useCases: ["descriptions", "end screens", "UI overlays"],
    axes: ["wght"],
    weightRange: [100, 900],
    files: [
      {
        path: "fonts/inter/inter-latin-wght-normal.woff2",
        style: "normal",
        weight: "100 900",
      },
      {
        path: "fonts/inter/inter-latin-wght-italic.woff2",
        style: "italic",
        weight: "100 900",
      },
    ],
    fallback: ["ui-sans-serif", "system-ui", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
    metrics: {
      ascentOverride: "90%",
      descentOverride: "22%",
      lineGapOverride: "0%",
      sizeAdjust: "100%",
    },
    license: "OFL-1.1",
    designer: "Rasmus Andersson",
  },
  "dm-sans": {
    id: "dm-sans",
    family: "DM Sans",
    role: "ui",
    description: "Low-contrast geometric sans — modern channel branding & UI.",
    useCases: ["thumbnails", "subscribe CTAs", "product explainers"],
    axes: ["wght"],
    weightRange: [100, 1000],
    files: [
      {
        path: "fonts/dm-sans/dm-sans-latin-wght-normal.woff2",
        style: "normal",
        weight: "100 1000",
      },
      {
        path: "fonts/dm-sans/dm-sans-latin-wght-italic.woff2",
        style: "italic",
        weight: "100 1000",
      },
    ],
    fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
    license: "OFL-1.1",
    designer: "Colophon Foundry / Google",
  },
  outfit: {
    id: "outfit",
    family: "Outfit",
    role: "ui",
    description: "Geometric modern UI sans — clean product interfaces.",
    useCases: ["app demos", "SaaS walkthroughs"],
    axes: ["wght"],
    weightRange: [100, 900],
    files: [
      {
        path: "fonts/outfit/outfit-latin-wght-normal.woff2",
        style: "normal",
        weight: "100 900",
      },
    ],
    fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
    license: "OFL-1.1",
    designer: "Rodrigo Fuenzalida",
  },
  manrope: {
    id: "manrope",
    family: "Manrope",
    role: "soft",
    description: "Soft geometric sans — friendly marketing & product copy.",
    useCases: ["lifestyle vlogs", "soft brand moments"],
    axes: ["wght"],
    weightRange: [200, 800],
    files: [
      {
        path: "fonts/manrope/manrope-latin-wght-normal.woff2",
        style: "normal",
        weight: "200 800",
      },
    ],
    fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
    license: "OFL-1.1",
    designer: "Mikhail Sharanda",
  },
  rubik: {
    id: "rubik",
    family: "Rubik",
    role: "soft",
    description: "Slightly rounded sans — approachable Shorts & community content.",
    useCases: ["Shorts", "community posts", "friendly CTAs"],
    axes: ["wght"],
    weightRange: [300, 900],
    files: [
      {
        path: "fonts/rubik/rubik-latin-wght-normal.woff2",
        style: "normal",
        weight: "300 900",
      },
    ],
    fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
    license: "OFL-1.1",
    designer: "Hubert and Fischer / Meir Sadan / Cyreal",
  },
  "space-grotesk": {
    id: "space-grotesk",
    family: "Space Grotesk",
    role: "display",
    description: "Proportional grotesque — headlines, hero lines, brand moments.",
    useCases: ["cold opens", "chapter titles"],
    axes: ["wght"],
    weightRange: [300, 700],
    files: [
      {
        path: "fonts/space-grotesk/space-grotesk-latin-wght-normal.woff2",
        style: "normal",
        weight: "300 700",
      },
    ],
    fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
    license: "OFL-1.1",
    designer: "Florian Karsten",
  },
  sora: {
    id: "sora",
    family: "Sora",
    role: "display",
    description: "Tech-forward geometric display — startup & AI creators.",
    useCases: ["tech explainers", "launch videos"],
    axes: ["wght"],
    weightRange: [100, 800],
    files: [
      {
        path: "fonts/sora/sora-latin-wght-normal.woff2",
        style: "normal",
        weight: "100 800",
      },
    ],
    fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
    license: "OFL-1.1",
    designer: "Boulevard Lab",
  },
  "bricolage-grotesque": {
    id: "bricolage-grotesque",
    family: "Bricolage Grotesque",
    role: "bold-display",
    description: "Characterful grotesque — distinctive channel identity.",
    useCases: ["brand bumpers", "kinetic titles"],
    axes: ["wght"],
    weightRange: [200, 800],
    files: [
      {
        path: "fonts/bricolage-grotesque/bricolage-grotesque-latin-wght-normal.woff2",
        style: "normal",
        weight: "200 800",
      },
    ],
    fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
    license: "OFL-1.1",
    designer: "Mathieu Triay",
  },
  syne: {
    id: "syne",
    family: "Syne",
    role: "bold-display",
    description: "Bold idiosyncratic display — posters, trailers, kinetic titles.",
    useCases: ["trailers", "event opens"],
    axes: ["wght"],
    weightRange: [400, 800],
    files: [
      {
        path: "fonts/syne/syne-latin-wght-normal.woff2",
        style: "normal",
        weight: "400 800",
      },
    ],
    fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
    license: "OFL-1.1",
    designer: "Bonjour Monde / Lucas Descroix",
  },
  "bebas-neue": {
    id: "bebas-neue",
    family: "Bebas Neue",
    role: "impact",
    description: "Classic condensed caps — YouTube titles & thumbnail type.",
    useCases: ["thumbnails", "all-caps titles", "countdown cards"],
    axes: ["wght"],
    weightRange: [400, 400],
    files: [
      {
        path: "fonts/bebas-neue/bebas-neue-latin-400-normal.woff2",
        style: "normal",
        weight: "400",
      },
    ],
    fallback: ["Impact", "Haettenschweiler", "Arial Narrow", "sans-serif"],
    license: "OFL-1.1",
    designer: "Ryoichi Tsunekawa / Dharma Type",
  },
  anton: {
    id: "anton",
    family: "Anton",
    role: "impact",
    description: "Heavy condensed impact — hooks that read at a glance.",
    useCases: ["hooks", "reaction titles", "Shorts openers"],
    axes: ["wght"],
    weightRange: [400, 400],
    files: [
      {
        path: "fonts/anton/anton-latin-400-normal.woff2",
        style: "normal",
        weight: "400",
      },
    ],
    fallback: ["Impact", "Arial Black", "sans-serif"],
    license: "OFL-1.1",
    designer: "Vernon Adams",
  },
  archivo: {
    id: "archivo",
    family: "Archivo",
    role: "condensed",
    description: "Grotesque with condensed energy — lower-thirds & data labels.",
    useCases: ["lower-thirds", "stats callouts", "news-style captions"],
    axes: ["wght"],
    weightRange: [100, 900],
    files: [
      {
        path: "fonts/archivo/archivo-latin-wght-normal.woff2",
        style: "normal",
        weight: "100 900",
      },
    ],
    fallback: ["Arial Narrow", "ui-sans-serif", "sans-serif"],
    license: "OFL-1.1",
    designer: "Omnibus-Type",
  },
  fraunces: {
    id: "fraunces",
    family: "Fraunces",
    role: "editorial",
    description: "Soft oldstyle serif with personality — editorial & display.",
    useCases: ["story intros", "quotes"],
    axes: ["wght"],
    weightRange: [100, 900],
    files: [
      {
        path: "fonts/fraunces/fraunces-latin-wght-normal.woff2",
        style: "normal",
        weight: "100 900",
      },
    ],
    fallback: ["ui-serif", "Georgia", "Times New Roman", "serif"],
    license: "OFL-1.1",
    designer: "Undercase Type",
  },
  "playfair-display": {
    id: "playfair-display",
    family: "Playfair Display",
    role: "editorial",
    description: "High-contrast transitional serif — luxury & lifestyle brands.",
    useCases: ["luxury intros", "fashion", "quote cards"],
    axes: ["wght"],
    weightRange: [400, 900],
    files: [
      {
        path: "fonts/playfair-display/playfair-display-latin-wght-normal.woff2",
        style: "normal",
        weight: "400 900",
      },
      {
        path: "fonts/playfair-display/playfair-display-latin-wght-italic.woff2",
        style: "italic",
        weight: "400 900",
      },
    ],
    fallback: ["Georgia", "Times New Roman", "serif"],
    license: "OFL-1.1",
    designer: "Claus Eggers Sørensen",
  },
  lora: {
    id: "lora",
    family: "Lora",
    role: "serif",
    description: "Contemporary serif for long-form narration & reading.",
    useCases: ["voiceover cards", "essay videos", "podcast notes"],
    axes: ["wght"],
    weightRange: [400, 700],
    files: [
      {
        path: "fonts/lora/lora-latin-wght-normal.woff2",
        style: "normal",
        weight: "400 700",
      },
      {
        path: "fonts/lora/lora-latin-wght-italic.woff2",
        style: "italic",
        weight: "400 700",
      },
    ],
    fallback: ["Georgia", "serif"],
    license: "OFL-1.1",
    designer: "Cyreal",
  },
  caveat: {
    id: "caveat",
    family: "Caveat",
    role: "script",
    description: "Casual handwriting — personal notes & annotation overlays.",
    useCases: ["annotations", "handwritten CTAs", "vlog notes"],
    axes: ["wght"],
    weightRange: [400, 700],
    files: [
      {
        path: "fonts/caveat/caveat-latin-400-normal.woff2",
        style: "normal",
        weight: "400",
      },
      {
        path: "fonts/caveat/caveat-latin-700-normal.woff2",
        style: "normal",
        weight: "700",
      },
    ],
    fallback: ["Segoe Print", "Comic Sans MS", "cursive"],
    license: "OFL-1.1",
    designer: "Impallari Type",
  },
  "jetbrains-mono": {
    id: "jetbrains-mono",
    family: "JetBrains Mono",
    role: "mono",
    description: "Developer mono — code blocks, terminals, data.",
    useCases: ["coding tutorials", "terminal demos"],
    axes: ["wght"],
    weightRange: [100, 800],
    files: [
      {
        path: "fonts/jetbrains-mono/jetbrains-mono-latin-wght-normal.woff2",
        style: "normal",
        weight: "100 800",
      },
    ],
    fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
    license: "OFL-1.1",
    designer: "JetBrains",
  },
  "geist-mono": {
    id: "geist-mono",
    family: "Geist Mono",
    role: "mono-ui",
    description: "Modern mono for product UIs and dense dashboards.",
    useCases: ["devtools demos", "metrics overlays"],
    axes: ["wght"],
    weightRange: [100, 900],
    files: [
      {
        path: "fonts/geist-mono/geist-mono-latin-wght-normal.woff2",
        style: "normal",
        weight: "100 900",
      },
    ],
    fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
    license: "OFL-1.1",
    designer: "Vercel",
  },
} as const;

export type FontId = keyof typeof FONT_CATALOG;

/** Semantic role → default family id */
export const ROLE_DEFAULTS: Record<FontRole, FontId> = {
  body: "inter",
  ui: "dm-sans",
  display: "sora",
  soft: "rubik",
  editorial: "playfair-display",
  "bold-display": "bricolage-grotesque",
  impact: "bebas-neue",
  condensed: "archivo",
  script: "caveat",
  serif: "lora",
  mono: "jetbrains-mono",
  "mono-ui": "geist-mono",
};

export function getFont(id: FontId | string): FontFamily {
  const font = FONT_CATALOG[id];
  if (!font) {
    throw new Error(
      `Unknown font "${id}". Available: ${Object.keys(FONT_CATALOG).join(", ")}`,
    );
  }
  return font;
}

export function listFonts(): FontFamily[] {
  return Object.values(FONT_CATALOG);
}

export function fontsByRole(role: FontRole): FontFamily[] {
  return listFonts().filter((f) => f.role === role);
}

/** CSS font-family stack for a catalog entry */
export function fontStack(id: FontId | string): string {
  const font = getFont(id);
  return [JSON.stringify(font.family), ...font.fallback].join(", ");
}

/** Suggested fonts for a creator use-case keyword */
export function fontsForUseCase(query: string): FontFamily[] {
  const q = query.toLowerCase();
  return listFonts().filter(
    (f) =>
      f.useCases.some((u) => u.toLowerCase().includes(q)) ||
      f.description.toLowerCase().includes(q) ||
      f.role.includes(q),
  );
}
