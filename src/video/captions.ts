/**
 * Video text overlays — WebVTT-friendly captions + kinetic timed lines.
 */

import type { CaptionStyleId } from "./presets";

export type { CaptionStyleId };

export interface CaptionCue {
  /** Start time in seconds */
  start: number;
  /** End time in seconds */
  end: number;
  text: string;
  /** Optional style preset for kinetic / overlay render */
  style?: CaptionStyleId;
  align?: "start" | "center" | "end";
  /** Optional speaker / role label for lower-thirds */
  speaker?: string;
}

export interface CaptionTrackOptions {
  language?: string;
  label?: string;
  /** Default true — show track immediately */
  showing?: boolean;
}

/** Convert cues to WebVTT string */
export function cuesToVtt(cues: CaptionCue[], title = "cinematype"): string {
  const lines = ["WEBVTT", `NOTE ${title}`, ""];
  cues.forEach((cue, i) => {
    lines.push(String(i + 1));
    lines.push(`${formatTs(cue.start)} --> ${formatTs(cue.end)}`);
    lines.push(cue.text);
    lines.push("");
  });
  return lines.join("\n");
}

function formatTs(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  return `${pad(h)}:${pad(m)}:${pad(s)}.${String(ms).padStart(3, "0")}`;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Attach a TextTrack from cues to an HTMLVideoElement */
export function attachCaptions(
  video: HTMLVideoElement,
  cues: CaptionCue[],
  options: CaptionTrackOptions = {},
): TextTrack {
  const vtt = cuesToVtt(cues);
  const blob = new Blob([vtt], { type: "text/vtt" });
  const url = URL.createObjectURL(blob);

  // Remove existing cinematype tracks
  const tracks = video.querySelectorAll('track[data-cinematype="1"]');
  tracks.forEach((t) => t.remove());

  const trackEl = document.createElement("track");
  trackEl.kind = "captions";
  trackEl.label = options.label ?? "Cinematype";
  trackEl.srclang = options.language ?? "en";
  trackEl.src = url;
  trackEl.dataset.cinematype = "1";
  if (options.showing !== false) trackEl.default = true;
  video.appendChild(trackEl);

  const textTrack = video.textTracks[video.textTracks.length - 1];
  if (textTrack && options.showing !== false) {
    textTrack.mode = "showing";
  }

  return textTrack!;
}

export interface OverlayOptions {
  /** Container for overlay DOM (default: wraps video parent) */
  container?: HTMLElement;
  className?: string;
  /** Font family CSS value */
  fontFamily?: string;
  fontSize?: string;
  color?: string;
  /** Use kinetic reveal when cue changes */
  kinetic?: boolean;
  /** Color for inactive karaoke words */
  karaokeInactiveColor?: string;
  /** Color for the active karaoke word */
  karaokeActiveColor?: string;
}

export interface OverlayController {
  destroy: () => void;
  setCues: (cues: CaptionCue[]) => void;
  readonly current: CaptionCue | null;
}

function applyStyleLayout(
  overlay: HTMLElement,
  cue: CaptionCue,
  options: OverlayOptions,
) {
  overlay.dataset.style = cue.style ?? "subtitle";
  overlay.style.textAlign = cue.align ?? "center";

  overlay.style.background = "transparent";
  overlay.style.padding = "0 6%";
  overlay.style.left = "0";
  overlay.style.right = "0";
  overlay.style.width = "auto";
  overlay.style.textTransform = "none";
  overlay.style.letterSpacing = "-0.02em";

  if (cue.style === "title" || cue.style === "end-card") {
    overlay.style.bottom = "auto";
    overlay.style.top = "50%";
    overlay.style.transform = "translateY(-50%)";
    overlay.style.fontSize = options.fontSize ?? "clamp(1.5rem, 5vw, 3.5rem)";
    overlay.style.fontFamily =
      options.fontFamily ?? '"Bebas Neue", "Syne", system-ui, sans-serif';
    overlay.style.letterSpacing = cue.style === "end-card" ? "0.04em" : "-0.02em";
  } else if (cue.style === "chapter") {
    overlay.style.bottom = "auto";
    overlay.style.top = "8%";
    overlay.style.transform = "none";
    overlay.style.fontSize = options.fontSize ?? "clamp(1rem, 2.5vw, 1.6rem)";
    overlay.style.letterSpacing = "0.12em";
    overlay.style.textTransform = "uppercase";
  } else if (cue.style === "lower-third" || cue.style === "speaker") {
    overlay.style.bottom = "12%";
    overlay.style.top = "auto";
    overlay.style.transform = "none";
    overlay.style.textAlign = cue.align ?? "start";
    overlay.style.fontSize = options.fontSize ?? "clamp(0.95rem, 2vw, 1.35rem)";
    overlay.style.background = "rgba(0,0,0,0.45)";
    overlay.style.padding = "0.55rem 1rem";
    overlay.style.left = "6%";
    overlay.style.right = "auto";
    overlay.style.width = "max-content";
    overlay.style.maxWidth = "80%";
  } else if (cue.style === "karaoke") {
    overlay.style.bottom = "10%";
    overlay.style.top = "auto";
    overlay.style.transform = "none";
    overlay.style.fontSize = options.fontSize ?? "clamp(1.1rem, 3vw, 2rem)";
  } else if (cue.style === "burn") {
    overlay.style.bottom = "14%";
    overlay.style.top = "auto";
    overlay.style.transform = "none";
    overlay.style.fontSize = options.fontSize ?? "clamp(1.05rem, 2.8vw, 1.85rem)";
    overlay.style.background = "rgba(0,0,0,0.72)";
    overlay.style.padding = "0.45rem 0.85rem";
    overlay.style.width = "max-content";
    overlay.style.maxWidth = "88%";
    overlay.style.left = "50%";
    overlay.style.right = "auto";
    overlay.style.transform = "translateX(-50%)";
  } else {
    overlay.style.bottom = "8%";
    overlay.style.top = "auto";
    overlay.style.transform = "none";
    overlay.style.textTransform = "none";
  }
}

function renderKaraokeWords(
  line: HTMLElement,
  cue: CaptionCue,
  time: number,
  options: OverlayOptions,
) {
  const tokens = cue.text.split(/(\s+)/);
  const wordIndexes: number[] = [];
  tokens.forEach((token, i) => {
    if (token.trim()) wordIndexes.push(i);
  });

  const duration = Math.max(0.001, cue.end - cue.start);
  const progress = Math.min(1, Math.max(0, (time - cue.start) / duration));
  const activeWord =
    wordIndexes.length === 0
      ? -1
      : Math.min(
          wordIndexes.length - 1,
          Math.floor(progress * wordIndexes.length),
        );

  const inactive = options.karaokeInactiveColor ?? "rgba(255,255,255,0.45)";
  const active = options.karaokeActiveColor ?? options.color ?? "#fff";

  line.replaceChildren();
  let wordOrdinal = 0;
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]!;
    if (!token.trim()) {
      line.appendChild(document.createTextNode(token));
      continue;
    }
    const span = document.createElement("span");
    span.className = "ct-karaoke-word";
    span.dataset.active = wordOrdinal === activeWord ? "true" : "false";
    span.textContent = token;
    span.style.color = wordOrdinal === activeWord ? active : inactive;
    span.style.transition = "color 80ms linear, opacity 80ms linear";
    if (wordOrdinal === activeWord) {
      span.style.opacity = "1";
      span.style.fontVariationSettings = '"wght" 700';
    } else if (wordOrdinal < activeWord) {
      span.style.opacity = "0.85";
    } else {
      span.style.opacity = "0.45";
    }
    line.appendChild(span);
    wordOrdinal++;
  }
}

/**
 * Custom DOM overlay synced to video time — better styling than native VTT.
 * Supports lower-thirds, titles, karaoke-style active words.
 */
export function createVideoOverlay(
  video: HTMLVideoElement,
  cues: CaptionCue[],
  options: OverlayOptions = {},
): OverlayController {
  let activeCues = [...cues].sort((a, b) => a.start - b.start);
  let current: CaptionCue | null = null;
  let lastKaraokeKey = "";

  const parent = options.container ?? video.parentElement ?? document.body;
  if (getComputedStyle(parent).position === "static") {
    parent.style.position = "relative";
  }

  const overlay = document.createElement("div");
  overlay.className = options.className ?? "ct-video-overlay";
  overlay.setAttribute("aria-live", "polite");
  Object.assign(overlay.style, {
    position: "absolute",
    left: "0",
    right: "0",
    bottom: "8%",
    padding: "0 6%",
    pointerEvents: "none",
    textAlign: "center",
    fontFamily: options.fontFamily ?? '"Space Grotesk", system-ui, sans-serif',
    fontSize: options.fontSize ?? "clamp(1rem, 2.5vw, 1.75rem)",
    color: options.color ?? "#fff",
    textShadow: "0 2px 16px rgba(0,0,0,0.65), 0 1px 2px rgba(0,0,0,0.9)",
    lineHeight: "1.25",
    letterSpacing: "-0.02em",
    fontWeight: "600",
    zIndex: "5",
    transition: "opacity 180ms ease",
  } as CSSStyleDeclaration);

  const line = document.createElement("div");
  line.className = "ct-video-overlay-line";
  overlay.appendChild(line);
  parent.appendChild(overlay);

  const findCue = (t: number): CaptionCue | null => {
    for (const c of activeCues) {
      if (t >= c.start && t < c.end) return c;
    }
    return null;
  };

  const render = (cue: CaptionCue | null, time: number) => {
    if (!cue) {
      if (current !== null) {
        current = null;
        lastKaraokeKey = "";
        overlay.style.opacity = "0";
        line.textContent = "";
      }
      return;
    }

    if (cue.style === "karaoke") {
      const wordCount = cue.text.trim().split(/\s+/).filter(Boolean).length;
      const duration = Math.max(0.001, cue.end - cue.start);
      const progress = Math.min(1, Math.max(0, (time - cue.start) / duration));
      const activeWord =
        wordCount === 0 ? -1 : Math.min(wordCount - 1, Math.floor(progress * wordCount));
      const key = `${cue.start}:${cue.end}:${cue.text}:${activeWord}`;
      if (key === lastKaraokeKey) return;
      lastKaraokeKey = key;
      current = cue;
      overlay.style.opacity = "1";
      applyStyleLayout(overlay, cue, options);
      renderKaraokeWords(line, cue, time, options);
      return;
    }

    if (cue === current) return;
    current = cue;
    lastKaraokeKey = "";
    overlay.style.opacity = "1";
    applyStyleLayout(overlay, cue, options);
    if (cue.speaker || cue.style === "speaker") {
      const label = cue.speaker ? `${cue.speaker}\n${cue.text}` : cue.text;
      line.textContent = label;
    } else {
      line.textContent = cue.text;
    }

    if (options.kinetic) {
      line.style.opacity = "0";
      line.style.transform = "translateY(0.4em)";
      requestAnimationFrame(() => {
        line.style.transition =
          "opacity 280ms cubic-bezier(0.16,1,0.3,1), transform 280ms cubic-bezier(0.16,1,0.3,1)";
        line.style.opacity = "1";
        line.style.transform = "translateY(0)";
      });
    }
  };

  const onTime = () => {
    const t = video.currentTime;
    render(findCue(t), t);
  };

  video.addEventListener("timeupdate", onTime);
  video.addEventListener("seeked", onTime);
  onTime();

  return {
    get current() {
      return current;
    },
    setCues(next) {
      activeCues = [...next].sort((a, b) => a.start - b.start);
      lastKaraokeKey = "";
      onTime();
    },
    destroy() {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("seeked", onTime);
      overlay.remove();
    },
  };
}
