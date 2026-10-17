import type {
  CaptionAnimation,
  CaptionStyleId,
  KineticPreset,
} from "../src/index";

export type Tab = "studio" | "style" | "destinations" | "more";
export type MorePanel = "motion" | "fonts" | "cards" | "transcript";

export const PRESETS: KineticPreset[] = [
  "fade-up",
  "pop",
  "bounce-in",
  "blur-in",
  "scale-in",
  "slide-left",
  "weight-morph",
  "scramble",
  "typewriter",
  "wave",
  "glitch",
];

export const ANIMATIONS: CaptionAnimation[] = [
  "none",
  "fade",
  "pop",
  "slide",
  "word-pop",
  "karaoke",
  "bounce",
  "glitch",
];

export const STYLE_IDS: CaptionStyleId[] = [
  "subtitle",
  "title",
  "lower-third",
  "karaoke",
  "chapter",
  "end-card",
  "speaker",
  "burn",
];

export const DEMO_VIDEO =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

export const TABS = [
  ["studio", "Studio"],
  ["style", "Style / Brand"],
  ["destinations", "Destinations"],
  ["more", "More"],
] as const;

export const MORE_PANELS = [
  ["transcript", "Transcript"],
  ["motion", "Motion"],
  ["fonts", "Fonts"],
  ["cards", "Cards"],
] as const;

export function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable
  );
}
