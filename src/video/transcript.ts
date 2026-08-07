import type { CaptionCue } from "./captions";

export interface TranscriptOptions {
  /** Words per minute for rough timing (default 150) */
  wpm?: number;
  /** Gap between cues in seconds */
  gap?: number;
  /** Max words per cue */
  maxWords?: number;
  /** Start offset in seconds */
  startAt?: number;
  /** Default cue style */
  style?: CaptionCue["style"];
  /** Split on blank lines as hard cue breaks */
  respectParagraphs?: boolean;
}

/** Split plain text / Whisper-ish transcript into timed caption cues */
export function transcriptToCues(
  text: string,
  options: TranscriptOptions = {},
): CaptionCue[] {
  const wpm = options.wpm ?? 150;
  const gap = options.gap ?? 0.12;
  const maxWords = options.maxWords ?? 8;
  const startAt = options.startAt ?? 0;
  const style = options.style ?? "burn";
  const respectParagraphs = options.respectParagraphs !== false;

  const chunks = respectParagraphs
    ? text
        .replace(/\r\n/g, "\n")
        .split(/\n\s*\n/)
        .map((p) => p.replace(/\n/g, " ").trim())
        .filter(Boolean)
    : [text.replace(/\s+/g, " ").trim()].filter(Boolean);

  const lines: string[] = [];
  for (const chunk of chunks) {
    const words = chunk.split(/\s+/).filter(Boolean);
    for (let i = 0; i < words.length; i += maxWords) {
      lines.push(words.slice(i, i + maxWords).join(" "));
    }
  }

  const secondsPerWord = 60 / wpm;
  let t = startAt;
  return lines.map((line) => {
    const words = line.split(/\s+/).length;
    const duration = Math.max(1.2, words * secondsPerWord + 0.35);
    const cue: CaptionCue = {
      start: round2(t),
      end: round2(t + duration),
      text: line,
      style,
    };
    t += duration + gap;
    return cue;
  });
}

/** Scale / shift cue timings (e.g. match a shorter cut) */
export function retimeCues(
  cues: CaptionCue[],
  options: { scale?: number; shift?: number; minDuration?: number } = {},
): CaptionCue[] {
  const scale = options.scale ?? 1;
  const shift = options.shift ?? 0;
  const minDuration = options.minDuration ?? 0.8;
  return cues.map((cue) => {
    const start = Math.max(0, cue.start * scale + shift);
    let end = cue.end * scale + shift;
    if (end - start < minDuration) end = start + minDuration;
    return { ...cue, start: round2(start), end: round2(end) };
  });
}

/** One karaoke cue covering the full phrase */
export function wordsToKaraokeCues(
  text: string,
  options: { startAt?: number; secondsPerWord?: number } = {},
): CaptionCue[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const spw = options.secondsPerWord ?? 0.35;
  const startAt = options.startAt ?? 0;
  const end = startAt + Math.max(1, words.length) * spw;
  return [
    {
      start: startAt,
      end: round2(end),
      text: words.join(" "),
      style: "karaoke",
    },
  ];
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
