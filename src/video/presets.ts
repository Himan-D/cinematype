import { fontStack, type FontId } from "../fonts";
import type { KineticPreset } from "../motion";
import type { AspectId } from "./aspects";
import { framePixels } from "./aspects";
import type { CaptionCue } from "./captions";
import type { CanvasTextOptions } from "./canvas";
import { renderTextFrame } from "./canvas";

export type CaptionStyleId =
  | "subtitle"
  | "title"
  | "lower-third"
  | "karaoke"
  | "chapter"
  | "end-card"
  | "speaker"
  | "burn";

export interface TitleCardPreset {
  id: string;
  label: string;
  description: string;
  aspect: AspectId;
  font: FontId;
  background: string;
  color: string;
  fontWeight: number;
  fontSizeRatio: number;
  tracking?: number;
  align?: CanvasTextAlign;
  shadow?: boolean;
}

export interface CreatorTemplate {
  id: string;
  label: string;
  description: string;
  aspect: AspectId;
  font: FontId;
  kinetic?: KineticPreset;
  cues: CaptionCue[];
  titleCard?: TitleCardPreset;
}

/** Ready-to-render title / thumbnail card looks */
export const TITLE_CARD_PRESETS: Record<string, TitleCardPreset> = {
  "yt-hook": {
    id: "yt-hook",
    label: "YouTube Hook",
    description: "Big condensed caps for thumbnail / cold open.",
    aspect: "youtube",
    font: "bebas-neue",
    background: "#0b0b0f",
    color: "#f5f5f0",
    fontWeight: 400,
    fontSizeRatio: 0.14,
    tracking: 2,
  },
  "shorts-punch": {
    id: "shorts-punch",
    label: "Shorts Punch",
    description: "Vertical impact title for TikTok / Reels / Shorts.",
    aspect: "youtube-shorts",
    font: "anton",
    background: "#111018",
    color: "#ffe566",
    fontWeight: 400,
    fontSizeRatio: 0.11,
    tracking: 1,
  },
  "luxury-quote": {
    id: "luxury-quote",
    label: "Luxury Quote",
    description: "Editorial serif card for lifestyle & brand stories.",
    aspect: "portrait",
    font: "playfair-display",
    background: "#1a1410",
    color: "#f3e7d3",
    fontWeight: 500,
    fontSizeRatio: 0.08,
    tracking: 0,
  },
  "tech-launch": {
    id: "tech-launch",
    label: "Tech Launch",
    description: "Clean geometric title for product drops.",
    aspect: "youtube",
    font: "sora",
    background: "#07090f",
    color: "#e8ff6a",
    fontWeight: 700,
    fontSizeRatio: 0.09,
  },
  "podcast-chapter": {
    id: "podcast-chapter",
    label: "Podcast Chapter",
    description: "Chapter marker card for long-form audio/video.",
    aspect: "square",
    font: "archivo",
    background: "#121212",
    color: "#ffffff",
    fontWeight: 600,
    fontSizeRatio: 0.08,
    align: "left",
  },
  "end-screen": {
    id: "end-screen",
    label: "End Screen",
    description: "Subscribe / next-up end card.",
    aspect: "youtube",
    font: "dm-sans",
    background: "#0e0e12",
    color: "#ffffff",
    fontWeight: 700,
    fontSizeRatio: 0.07,
  },
  "handwritten-note": {
    id: "handwritten-note",
    label: "Handwritten Note",
    description: "Casual annotation overlay look.",
    aspect: "youtube",
    font: "caveat",
    background: "#f7f1e6",
    color: "#1c1a17",
    fontWeight: 700,
    fontSizeRatio: 0.12,
    shadow: false,
  },
};

export function listTitleCardPresets(): TitleCardPreset[] {
  return Object.values(TITLE_CARD_PRESETS);
}

export function getTitleCardPreset(id: string): TitleCardPreset {
  const preset = TITLE_CARD_PRESETS[id];
  if (!preset) {
    throw new Error(
      `Unknown title card preset "${id}". Available: ${Object.keys(TITLE_CARD_PRESETS).join(", ")}`,
    );
  }
  return preset;
}

/** Render a title card preset to canvas */
export function renderTitleCard(
  text: string,
  presetId: string,
  overrides: Partial<CanvasTextOptions> = {},
): HTMLCanvasElement {
  const preset = getTitleCardPreset(presetId);
  const { width, height } = framePixels(preset.aspect);
  return renderTextFrame(text, {
    width,
    height,
    background: preset.background,
    color: preset.color,
    fontFamily: fontStack(preset.font),
    fontWeight: preset.fontWeight,
    fontSize: Math.round(height * preset.fontSizeRatio),
    tracking: preset.tracking,
    align: preset.align ?? "center",
    shadow: preset.shadow,
    ...overrides,
  });
}

/** Full creator templates with timed cues */
export const CREATOR_TEMPLATES: Record<string, CreatorTemplate> = {
  "youtube-opener": {
    id: "youtube-opener",
    label: "YouTube Opener",
    description: "Cold open title → karaoke hook → lower-third name.",
    aspect: "youtube",
    font: "bebas-neue",
    kinetic: "fade-up",
    titleCard: TITLE_CARD_PRESETS["yt-hook"],
    cues: [
      { start: 0, end: 2.2, text: "WATCH THIS", style: "title" },
      {
        start: 2.2,
        end: 6,
        text: "Three things nobody tells you about growth",
        style: "karaoke",
      },
      {
        start: 6,
        end: 9,
        text: "Alex Rivera  ·  Creator",
        style: "lower-third",
        align: "start",
      },
    ],
  },
  "shorts-hook": {
    id: "shorts-hook",
    label: "Shorts / Reels Hook",
    description: "Punchy vertical opener with burn-in captions.",
    aspect: "youtube-shorts",
    font: "anton",
    kinetic: "scale-in",
    titleCard: TITLE_CARD_PRESETS["shorts-punch"],
    cues: [
      { start: 0, end: 1.5, text: "STOP SCROLLING", style: "title" },
      {
        start: 1.5,
        end: 4.5,
        text: "This one setting changed everything",
        style: "burn",
      },
      { start: 4.5, end: 7, text: "Save this for later", style: "karaoke" },
    ],
  },
  "podcast-markers": {
    id: "podcast-markers",
    label: "Podcast Chapters",
    description: "Chapter cards + speaker lower-thirds.",
    aspect: "youtube",
    font: "archivo",
    kinetic: "slide-left",
    titleCard: TITLE_CARD_PRESETS["podcast-chapter"],
    cues: [
      { start: 0, end: 3, text: "CHAPTER 01  ·  ORIGINS", style: "chapter" },
      {
        start: 3,
        end: 7,
        text: "Maya Chen  ·  Guest",
        style: "speaker",
        align: "start",
      },
      {
        start: 7,
        end: 11,
        text: "We almost shut the whole thing down",
        style: "subtitle",
      },
    ],
  },
  "tutorial-captions": {
    id: "tutorial-captions",
    label: "Tutorial Captions",
    description: "Clean burn-in captions for how-to content.",
    aspect: "youtube",
    font: "dm-sans",
    kinetic: "fade-in",
    cues: [
      { start: 0, end: 3, text: "Step 1 — Open the project panel", style: "burn" },
      { start: 3, end: 6, text: "Step 2 — Drop your B-roll on V2", style: "burn" },
      { start: 6, end: 9, text: "Step 3 — Add captions from this kit", style: "burn" },
    ],
  },
  "luxury-story": {
    id: "luxury-story",
    label: "Luxury Story",
    description: "Editorial quote + soft title for lifestyle brands.",
    aspect: "portrait",
    font: "playfair-display",
    kinetic: "blur-in",
    titleCard: TITLE_CARD_PRESETS["luxury-quote"],
    cues: [
      {
        start: 0,
        end: 4,
        text: "“Craft is the new currency.”",
        style: "title",
      },
      {
        start: 4,
        end: 8,
        text: "Autumn Lookbook  ·  2026",
        style: "lower-third",
        align: "start",
      },
    ],
  },
  "stream-end": {
    id: "stream-end",
    label: "Stream / Video End",
    description: "End card with subscribe energy.",
    aspect: "youtube",
    font: "sora",
    kinetic: "wave",
    titleCard: TITLE_CARD_PRESETS["end-screen"],
    cues: [
      { start: 0, end: 3, text: "THANKS FOR WATCHING", style: "end-card" },
      { start: 3, end: 6, text: "Subscribe for weekly drops", style: "karaoke" },
    ],
  },
};

export function listCreatorTemplates(): CreatorTemplate[] {
  return Object.values(CREATOR_TEMPLATES);
}

export function getCreatorTemplate(id: string): CreatorTemplate {
  const template = CREATOR_TEMPLATES[id];
  if (!template) {
    throw new Error(
      `Unknown template "${id}". Available: ${Object.keys(CREATOR_TEMPLATES).join(", ")}`,
    );
  }
  return template;
}
