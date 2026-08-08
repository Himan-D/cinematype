import type { CaptionCue } from "./captions";

/** Update a single cue immutably */
export function updateCue(
  cues: CaptionCue[],
  index: number,
  patch: Partial<CaptionCue>,
): CaptionCue[] {
  return cues.map((cue, i) => (i === index ? { ...cue, ...patch } : cue));
}

export function removeCue(cues: CaptionCue[], index: number): CaptionCue[] {
  return cues.filter((_, i) => i !== index);
}

export function addCue(
  cues: CaptionCue[],
  cue: CaptionCue = {
    start: cues.length ? cues[cues.length - 1]!.end : 0,
    end: cues.length ? cues[cues.length - 1]!.end + 2 : 2,
    text: "New caption",
    style: "burn",
  },
): CaptionCue[] {
  return [...cues, cue].sort((a, b) => a.start - b.start);
}

/** Nudge all cues by delta seconds */
export function shiftCues(cues: CaptionCue[], delta: number): CaptionCue[] {
  return cues.map((cue) => ({
    ...cue,
    start: Math.max(0, round2(cue.start + delta)),
    end: Math.max(0.1, round2(cue.end + delta)),
  }));
}

/** Clamp / fix overlapping ends */
export function normalizeCues(cues: CaptionCue[]): CaptionCue[] {
  const sorted = [...cues].sort((a, b) => a.start - b.start);
  for (let i = 0; i < sorted.length; i++) {
    const cue = sorted[i]!;
    if (cue.end <= cue.start) cue.end = round2(cue.start + 0.8);
    const next = sorted[i + 1];
    if (next && cue.end > next.start) {
      cue.end = round2(Math.max(cue.start + 0.4, next.start - 0.02));
    }
  }
  return sorted;
}

/**
 * Split cue at `index` after `atWord` words (0-based word boundary).
 * Default splits at the midpoint word.
 */
export function splitCue(
  cues: CaptionCue[],
  index: number,
  atWord?: number,
): CaptionCue[] {
  if (index < 0 || index >= cues.length) return [...cues];
  const cue = cues[index]!;
  const words = cue.text.trim().split(/\s+/).filter(Boolean);
  if (words.length < 2) return [...cues];

  const mid = Math.floor(words.length / 2);
  const splitAt = Math.min(
    words.length - 1,
    Math.max(1, atWord === undefined ? mid : atWord),
  );
  const leftWords = words.slice(0, splitAt);
  const rightWords = words.slice(splitAt);
  if (!leftWords.length || !rightWords.length) return [...cues];

  const duration = Math.max(0.2, cue.end - cue.start);
  const ratio = leftWords.length / words.length;
  const midTime = round2(cue.start + duration * ratio);

  const left: CaptionCue = {
    ...cue,
    text: leftWords.join(" "),
    end: midTime,
  };
  const right: CaptionCue = {
    ...cue,
    text: rightWords.join(" "),
    start: midTime,
  };

  return [...cues.slice(0, index), left, right, ...cues.slice(index + 1)];
}

/** Merge cue at `index` with the following cue */
export function mergeCues(cues: CaptionCue[], index: number): CaptionCue[] {
  if (index < 0 || index >= cues.length - 1) return [...cues];
  const a = cues[index]!;
  const b = cues[index + 1]!;
  const merged: CaptionCue = {
    ...a,
    text: `${a.text.trim()} ${b.text.trim()}`.trim(),
    end: Math.max(a.end, b.end),
    style: a.style ?? b.style,
    align: a.align ?? b.align,
    speaker: a.speaker ?? b.speaker,
  };
  return [...cues.slice(0, index), merged, ...cues.slice(index + 2)];
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
