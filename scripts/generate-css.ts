/**
 * Generate static CSS files from the TypeScript token/font generators.
 * Run via: bun run scripts/generate-css.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { generateFontFaceCss, generateFontUtilityCss } from "../src/fonts/css";
import { typeScaleToCss, typeUtilitiesCss } from "../src/tokens";

const root = join(import.meta.dir, "..");
const styles = join(root, "styles");
mkdirSync(styles, { recursive: true });

const fontsCss = generateFontFaceCss({
  resolveUrl: "relative",
  relativePrefix: "../",
  display: "swap",
  metrics: true,
});

const utilities = generateFontUtilityCss();
const tokens = typeScaleToCss();
const typeUtils = typeUtilitiesCss();

const motionCss = `/* cinematype — motion helpers */
.ct-char,
.ct-word,
.ct-line {
  will-change: transform, opacity, filter;
  backface-visibility: hidden;
}

.ct-kinetic {
  overflow: hidden;
}

@media (prefers-reduced-motion: reduce) {
  .ct-char,
  .ct-word,
  .ct-line {
    transition: none !important;
    animation: none !important;
    transform: none !important;
    filter: none !important;
    opacity: 1 !important;
  }
}
`;

const videoCss = `/* cinematype — video overlay */
.ct-video-overlay {
  position: absolute;
  inset-inline: 0;
  bottom: 8%;
  padding-inline: 6%;
  pointer-events: none;
  z-index: 5;
  text-align: center;
  color: #fff;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.65), 0 1px 2px rgba(0, 0, 0, 0.9);
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.25;
}

.ct-video-overlay[data-style="title"] {
  bottom: auto;
  top: 50%;
  transform: translateY(-50%);
  font-size: clamp(1.5rem, 5vw, 3.5rem);
}

.ct-video-overlay[data-style="lower-third"] {
  bottom: 12%;
  text-align: start;
  font-size: clamp(0.95rem, 2vw, 1.35rem);
}

.ct-video-overlay[data-style="karaoke"] {
  bottom: 10%;
  font-size: clamp(1.1rem, 3vw, 2rem);
}

.ct-video-overlay[data-style="chapter"] {
  bottom: auto;
  top: 8%;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: clamp(1rem, 2.5vw, 1.6rem);
}

.ct-video-overlay[data-style="end-card"] {
  bottom: auto;
  top: 50%;
  transform: translateY(-50%);
  letter-spacing: 0.04em;
  font-size: clamp(1.5rem, 5vw, 3.5rem);
}

.ct-video-overlay[data-style="speaker"],
.ct-video-overlay[data-style="lower-third"] {
  bottom: 12%;
  text-align: start;
  left: 6%;
  right: auto;
  width: max-content;
  max-width: 80%;
  padding: 0.55rem 1rem;
  background: rgba(0, 0, 0, 0.45);
  font-size: clamp(0.95rem, 2vw, 1.35rem);
}

.ct-video-overlay[data-style="burn"] {
  bottom: 14%;
  left: 50%;
  right: auto;
  transform: translateX(-50%);
  width: max-content;
  max-width: 88%;
  padding: 0.45rem 0.85rem;
  background: rgba(0, 0, 0, 0.72);
  font-size: clamp(1.05rem, 2.8vw, 1.85rem);
}

.ct-karaoke-word {
  display: inline;
  white-space: pre;
}

.ct-karaoke-word[data-active="true"] {
  color: #fff;
}

.ct-typed-video {
  position: relative;
  overflow: hidden;
  background: #000;
}

.ct-typed-video video {
  display: block;
  width: 100%;
  height: auto;
}

.ct-safe-guides {
  pointer-events: none;
  position: absolute;
  inset: 12%;
  border: 1px dashed rgba(255, 255, 255, 0.25);
}
`;

const bundle = `/* cinematype — full stylesheet */
${fontsCss}
${utilities}
${tokens}
${typeUtils}
${motionCss}
${videoCss}
`;

writeFileSync(join(styles, "fonts.css"), `${fontsCss}\n${utilities}\n`);
writeFileSync(join(styles, "tokens.css"), `${tokens}\n${typeUtils}\n`);
writeFileSync(join(styles, "motion.css"), motionCss);
writeFileSync(join(styles, "video.css"), videoCss);
writeFileSync(join(styles, "cinematype.css"), bundle);

console.log("✓ styles/fonts.css");
console.log("✓ styles/tokens.css");
console.log("✓ styles/motion.css");
console.log("✓ styles/video.css");
console.log("✓ styles/cinematype.css");
