import type { CaptionCue } from "./captions";

function pad(n: number, width = 2): string {
  return String(n).padStart(width, "0");
}

/** SRT timestamp: 00:00:01,500 */
export function formatSrtTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms, 3)}`;
}

/** Convert cues to SubRip (.srt) — widely supported by CapCut, Premiere, YouTube */
export function cuesToSrt(cues: CaptionCue[]): string {
  return [...cues]
    .sort((a, b) => a.start - b.start)
    .map((cue, i) => {
      return `${i + 1}\n${formatSrtTime(cue.start)} --> ${formatSrtTime(cue.end)}\n${cue.text}\n`;
    })
    .join("\n");
}

export interface AssOptions {
  title?: string;
  /** PlayResX / PlayResY for layout */
  width?: number;
  height?: number;
  fontName?: string;
  fontSize?: number;
  primaryColour?: string; // ASS &HAABBGGRR
}

/**
 * Convert #RRGGBB / #RGB / rgba() approx to ASS &HAABBGGRR (opaque unless alpha given).
 * ASS uses AABBGGRR with inverted alpha (00 = opaque).
 */
export function hexToAssColour(hex: string): string {
  const raw = hex.trim();
  const short = raw.match(/^#([0-9a-fA-F]{3})$/);
  const full = raw.match(/^#([0-9a-fA-F]{6})([0-9a-fA-F]{2})?$/);
  const rgba = raw.match(
    /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)$/i,
  );

  let r = 255;
  let g = 255;
  let b = 255;
  let a = 1;

  if (short) {
    const s = short[1]!;
    r = parseInt(s[0]! + s[0]!, 16);
    g = parseInt(s[1]! + s[1]!, 16);
    b = parseInt(s[2]! + s[2]!, 16);
  } else if (full) {
    const h = full[1]!;
    r = parseInt(h.slice(0, 2), 16);
    g = parseInt(h.slice(2, 4), 16);
    b = parseInt(h.slice(4, 6), 16);
    if (full[2]) a = parseInt(full[2], 16) / 255;
  } else if (rgba) {
    r = Number(rgba[1]);
    g = Number(rgba[2]);
    b = Number(rgba[3]);
    a = rgba[4] !== undefined ? Number(rgba[4]) : 1;
  } else {
    return "&H00FFFFFF";
  }

  const assA = Math.round((1 - Math.min(1, Math.max(0, a))) * 255);
  const toHex = (n: number) =>
    Math.round(Math.min(255, Math.max(0, n)))
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();
  return `&H${toHex(assA)}${toHex(b)}${toHex(g)}${toHex(r)}`;
}

function assTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const cs = Math.round((seconds % 1) * 100);
  return `${h}:${pad(m)}:${pad(s)}.${pad(cs)}`;
}

/**
 * Convert cues to Advanced SubStation Alpha (.ass) with basic style mapping.
 * Useful for burn-in in FFmpeg / Aegisub workflows.
 */
export function cuesToAss(cues: CaptionCue[], options: AssOptions = {}): string {
  const width = options.width ?? 1920;
  const height = options.height ?? 1080;
  const font = options.fontName ?? "Space Grotesk";
  const size = options.fontSize ?? 56;
  const primary = options.primaryColour ?? "&H00FFFFFF";

  const header = `[Script Info]
Title: ${options.title ?? "cinematype"}
ScriptType: v4.00+
PlayResX: ${width}
PlayResY: ${height}
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${font},${size},${primary},&H000000FF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,3,1,2,80,80,60,1
Style: Title,${font},${Math.round(size * 1.6)},${primary},&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,4,2,5,80,80,40,1
Style: Lower,${font},${Math.round(size * 0.85)},${primary},&H000000FF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,3,1,1,80,80,90,1
Style: Karaoke,${font},${Math.round(size * 1.1)},${primary},&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,3,1,2,80,80,70,1
Style: Chapter,${font},${Math.round(size * 1.2)},${primary},&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,3,1,8,80,80,40,1
Style: EndCard,${font},${Math.round(size * 1.4)},${primary},&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,4,2,5,80,80,40,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const styleMap: Record<string, string> = {
    subtitle: "Default",
    title: "Title",
    "lower-third": "Lower",
    karaoke: "Karaoke",
    chapter: "Chapter",
    "end-card": "EndCard",
    speaker: "Lower",
    burn: "Default",
  };

  const events = [...cues]
    .sort((a, b) => a.start - b.start)
    .map((cue) => {
      const style = styleMap[cue.style ?? "subtitle"] ?? "Default";
      const text = cue.text.replace(/\n/g, "\\N");
      return `Dialogue: 0,${assTime(cue.start)},${assTime(cue.end)},${style},,0,0,0,,${text}`;
    })
    .join("\n");

  return `${header}${events}\n`;
}

/** Parse a simple SRT file into cues (ignores HTML tags) */
export function parseSrt(input: string): CaptionCue[] {
  const blocks = input.replace(/\r\n/g, "\n").trim().split(/\n\s*\n/);
  const cues: CaptionCue[] = [];
  for (const block of blocks) {
    const lines = block.split("\n").filter(Boolean);
    if (lines.length < 2) continue;
    const timeLine = lines.find((l) => l.includes("-->"));
    if (!timeLine) continue;
    const [startRaw, endRaw] = timeLine.split("-->").map((s) => s.trim());
    const start = parseSrtTimestamp(startRaw ?? "");
    const end = parseSrtTimestamp(endRaw ?? "");
    const textStart = lines.indexOf(timeLine) + 1;
    const text = lines
      .slice(textStart)
      .join("\n")
      .replace(/<[^>]+>/g, "")
      .trim();
    if (Number.isFinite(start) && Number.isFinite(end) && text) {
      cues.push({ start, end, text });
    }
  }
  return cues;
}

function parseSrtTimestamp(value: string): number {
  const m = value.match(/(\d+):(\d+):(\d+)[,.](\d+)/);
  if (!m) return NaN;
  const h = Number(m[1]);
  const min = Number(m[2]);
  const s = Number(m[3]);
  const ms = Number(m[4]);
  return h * 3600 + min * 60 + s + ms / 1000;
}
