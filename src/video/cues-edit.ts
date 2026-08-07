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

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
