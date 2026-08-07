/**
 * Type scale & typography tokens.
 * Math-based scales (Major Third default) with role-aware tracking & leading.
 */

export type TypeScaleRatio =
  | "minor-second"
  | "major-second"
  | "minor-third"
  | "major-third"
  | "perfect-fourth"
  | "augmented-fourth"
  | "perfect-fifth";

export const RATIOS: Record<TypeScaleRatio, number> = {
  "minor-second": 1.067,
  "major-second": 1.125,
  "minor-third": 1.2,
  "major-third": 1.25,
  "perfect-fourth": 1.333,
  "augmented-fourth": 1.414,
  "perfect-fifth": 1.5,
};

export type TypeStep =
  | "2xs"
  | "xs"
  | "sm"
  | "base"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl"
  | "7xl"
  | "hero";

/** Step index relative to base (0) */
const STEP_INDEX: Record<TypeStep, number> = {
  "2xs": -3,
  xs: -2,
  sm: -1,
  base: 0,
  lg: 1,
  xl: 2,
  "2xl": 3,
  "3xl": 4,
  "4xl": 5,
  "5xl": 6,
  "6xl": 7,
  "7xl": 8,
  hero: 9,
};

export interface TypeToken {
  step: TypeStep;
  /** rem */
  size: number;
  /** unitless */
  lineHeight: number;
  /** em */
  letterSpacing: number;
  /** suggested weight */
  weight: number;
  /** CSS font-family role variable */
  role: "body" | "ui" | "display" | "editorial" | "bold-display" | "mono";
}

export interface TypeScaleOptions {
  basePx?: number;
  ratio?: TypeScaleRatio | number;
  /** Round rem to this many decimals */
  precision?: number;
}

function round(n: number, precision: number): number {
  const p = 10 ** precision;
  return Math.round(n * p) / p;
}

function lineHeightFor(sizePx: number): number {
  if (sizePx <= 14) return 1.65;
  if (sizePx <= 20) return 1.55;
  if (sizePx <= 28) return 1.35;
  if (sizePx <= 40) return 1.2;
  if (sizePx <= 56) return 1.1;
  return 1.02;
}

function trackingFor(sizePx: number, step: TypeStep): number {
  if (step === "hero" || sizePx >= 64) return -0.04;
  if (sizePx >= 40) return -0.03;
  if (sizePx >= 28) return -0.02;
  if (sizePx >= 20) return -0.01;
  if (sizePx <= 12) return 0.02;
  if (sizePx <= 14) return 0.01;
  return 0;
}

function weightFor(step: TypeStep): number {
  if (step === "hero" || step === "7xl" || step === "6xl") return 700;
  if (step === "5xl" || step === "4xl" || step === "3xl") return 650;
  if (step === "2xl" || step === "xl") return 600;
  if (step === "lg") return 500;
  return 400;
}

function roleFor(step: TypeStep): TypeToken["role"] {
  if (step === "hero" || step === "7xl" || step === "6xl") return "bold-display";
  if (step === "5xl" || step === "4xl") return "display";
  if (step === "3xl" || step === "2xl") return "editorial";
  if (step === "xl" || step === "lg") return "ui";
  if (step === "2xs" || step === "xs") return "ui";
  return "body";
}

export function createTypeScale(options: TypeScaleOptions = {}): Record<TypeStep, TypeToken> {
  const basePx = options.basePx ?? 16;
  const ratio =
    typeof options.ratio === "number"
      ? options.ratio
      : RATIOS[options.ratio ?? "major-third"];
  const precision = options.precision ?? 4;

  const scale = {} as Record<TypeStep, TypeToken>;
  for (const [step, index] of Object.entries(STEP_INDEX) as Array<[TypeStep, number]>) {
    const sizePx = basePx * ratio ** index;
    const sizeRem = round(sizePx / 16, precision);
    scale[step] = {
      step,
      size: sizeRem,
      lineHeight: round(lineHeightFor(sizePx), 3),
      letterSpacing: round(trackingFor(sizePx, step), 4),
      weight: weightFor(step),
      role: roleFor(step),
    };
  }
  return scale;
}

/** Default production scale (16px base, major third) */
export const defaultTypeScale = createTypeScale();

/** Emit CSS custom properties for a scale */
export function typeScaleToCss(
  scale: Record<TypeStep, TypeToken> = defaultTypeScale,
  selector = ":root",
): string {
  const lines: string[] = [];
  for (const token of Object.values(scale)) {
    lines.push(`  --ct-text-${token.step}: ${token.size}rem;`);
    lines.push(`  --ct-leading-${token.step}: ${token.lineHeight};`);
    lines.push(`  --ct-tracking-${token.step}: ${token.letterSpacing}em;`);
    lines.push(`  --ct-weight-${token.step}: ${token.weight};`);
  }

  // Semantic aliases
  lines.push(`  --ct-text-body: var(--ct-text-base);`);
  lines.push(`  --ct-text-caption: var(--ct-text-sm);`);
  lines.push(`  --ct-text-label: var(--ct-text-xs);`);
  lines.push(`  --ct-text-title: var(--ct-text-2xl);`);
  lines.push(`  --ct-text-headline: var(--ct-text-4xl);`);
  lines.push(`  --ct-text-display: var(--ct-text-6xl);`);

  return `/* cinematype — type scale tokens */\n${selector} {\n${lines.join("\n")}\n}\n`;
}

/** Utility classes for each step */
export function typeUtilitiesCss(
  scale: Record<TypeStep, TypeToken> = defaultTypeScale,
): string {
  const blocks = Object.values(scale).map((t) => {
    const familyVar =
      t.role === "body"
        ? "var(--font-sans, Inter, system-ui, sans-serif)"
        : t.role === "ui"
          ? "var(--font-ui, 'DM Sans', Outfit, system-ui, sans-serif)"
          : t.role === "display"
            ? "var(--font-display, Sora, 'Space Grotesk', system-ui, sans-serif)"
            : t.role === "editorial"
              ? "var(--font-serif, 'Playfair Display', Fraunces, Georgia, serif)"
              : t.role === "bold-display"
                ? "var(--font-hero, 'Bricolage Grotesque', Syne, system-ui, sans-serif)"
                : "var(--font-mono, 'JetBrains Mono', monospace)";

    return `.ct-text-${t.step} {
  font-family: ${familyVar};
  font-size: var(--ct-text-${t.step});
  line-height: var(--ct-leading-${t.step});
  letter-spacing: var(--ct-tracking-${t.step});
  font-weight: var(--ct-weight-${t.step});
  font-variation-settings: "wght" var(--ct-weight-${t.step});
}`;
  });

  return `/* cinematype — type utilities */\n${blocks.join("\n\n")}\n`;
}

export interface FluidTypeOptions {
  minVw?: number;
  maxVw?: number;
  minSizeRem?: number;
  maxSizeRem?: number;
}

/** CSS clamp() fluid type between two viewport widths */
export function fluidType(options: FluidTypeOptions = {}): string {
  const minVw = options.minVw ?? 360;
  const maxVw = options.maxVw ?? 1280;
  const minSize = options.minSizeRem ?? 1;
  const maxSize = options.maxSizeRem ?? 1.25;
  const slope = (maxSize - minSize) / (maxVw - minVw);
  const intercept = minSize - slope * minVw;
  return `clamp(${minSize}rem, ${round(intercept, 4)}rem + ${round(slope * 100, 4)}vw, ${maxSize}rem)`;
}
