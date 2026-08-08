/**
 * Phase 2 — smart caption timing, emphasis, and reading-speed validation.
 */
import type { CaptionCue } from "./captions";
import { normalizeCues } from "./cues-edit";

const EMPHASIS_HINTS =
  /\b(\d+%?|\$[\d,.]+|million|billion|free|now|secret|hack|stop|never|always|must|double|triple|first|best|new|finally|warning|important|cta|subscribe|follow|save|share)\b/gi;

const EMOTION_WORDS =
  /\b(love|hate|crazy|insane|shocking|amazing|terrible|broken|fixed|won|lost|fear|hope)\b/gi;

export interface EmphasisSpan {
  start: number; // char index in cue.text
  end: number;
  word: string;
  reason: "number" | "keyword" | "emotion" | "caps";
}

export interface ReadingSpeedIssue {
  cueIndex: number;
  kind: "too-fast" | "too-slow" | "too-long" | "overlap" | "dense";
  message: string;
  wpm: number;
}

export interface CaptionQualityReport {
  score: number; // 0–100
  issues: ReadingSpeedIssue[];
  cueCount: number;
  avgWpm: number;
}

/** Detect words worth highlighting inside a cue */
export function detectEmphasis(text: string): EmphasisSpan[] {
  const spans: EmphasisSpan[] = [];
  const push = (word: string, index: number, reason: EmphasisSpan["reason"]) => {
    spans.push({ start: index, end: index + word.length, word, reason });
  };

  for (const match of text.matchAll(EMPHASIS_HINTS)) {
    if (match.index !== undefined) push(match[0]!, match.index, /\d|\$/.test(match[0]!) ? "number" : "keyword");
  }
  for (const match of text.matchAll(EMOTION_WORDS)) {
    if (match.index !== undefined) push(match[0]!, match.index, "emotion");
  }
  for (const match of text.matchAll(/\b[A-Z]{2,}(?:\s+[A-Z]{2,})*\b/g)) {
    if (match.index !== undefined && match[0]!.length >= 2) {
      push(match[0]!, match.index, "caps");
    }
  }

  // de-dupe overlapping by start
  const seen = new Set<number>();
  return spans
    .sort((a, b) => a.start - b.start)
    .filter((s) => {
      if (seen.has(s.start)) return false;
      seen.add(s.start);
      return true;
    });
}

/** Wrap emphasis words in **markdown-ish** markers for export/preview hints */
export function applyEmphasisMarkers(text: string): string {
  const spans = detectEmphasis(text);
  if (!spans.length) return text;
  let out = text;
  for (const span of [...spans].reverse()) {
    out =
      out.slice(0, span.start) +
      `**${out.slice(span.start, span.end)}**` +
      out.slice(span.end);
  }
  return out;
}

export function emphasizeCues(cues: CaptionCue[]): CaptionCue[] {
  return cues.map((cue) => ({
    ...cue,
    text: applyEmphasisMarkers(cue.text),
  }));
}

/** Words-per-minute for a single cue */
export function cueWpm(cue: CaptionCue): number {
  const words = cue.text.trim().split(/\s+/).filter(Boolean).length;
  const dur = Math.max(0.01, cue.end - cue.start);
  return (words / dur) * 60;
}

/** Validate reading speed / overlaps / density */
export function validateReadingSpeed(
  cues: CaptionCue[],
  options: { minWpm?: number; maxWpm?: number; maxChars?: number } = {},
): ReadingSpeedIssue[] {
  const minWpm = options.minWpm ?? 90;
  const maxWpm = options.maxWpm ?? 220;
  const maxChars = options.maxChars ?? 84;
  const issues: ReadingSpeedIssue[] = [];
  const sorted = [...cues].sort((a, b) => a.start - b.start);

  sorted.forEach((cue, i) => {
    const wpm = cueWpm(cue);
    if (wpm > maxWpm) {
      issues.push({
        cueIndex: i,
        kind: "too-fast",
        message: `Cue #${i + 1} is ${Math.round(wpm)} wpm (max ${maxWpm})`,
        wpm,
      });
    } else if (wpm < minWpm && cue.text.split(/\s+/).length > 2) {
      issues.push({
        cueIndex: i,
        kind: "too-slow",
        message: `Cue #${i + 1} is ${Math.round(wpm)} wpm (min ${minWpm})`,
        wpm,
      });
    }
    if (cue.text.length > maxChars) {
      issues.push({
        cueIndex: i,
        kind: "dense",
        message: `Cue #${i + 1} has ${cue.text.length} chars (max ${maxChars})`,
        wpm,
      });
    }
    if (cue.end - cue.start > 8) {
      issues.push({
        cueIndex: i,
        kind: "too-long",
        message: `Cue #${i + 1} lasts ${(cue.end - cue.start).toFixed(1)}s`,
        wpm,
      });
    }
    const next = sorted[i + 1];
    if (next && cue.end > next.start + 0.01) {
      issues.push({
        cueIndex: i,
        kind: "overlap",
        message: `Cue #${i + 1} overlaps cue #${i + 2}`,
        wpm,
      });
    }
  });

  return issues;
}

/** Phase 3 quality score (0–100) from reading-speed issues */
export function scoreCaptionQuality(cues: CaptionCue[]): CaptionQualityReport {
  const issues = validateReadingSpeed(cues);
  const wpms = cues.map(cueWpm).filter((n) => Number.isFinite(n));
  const avgWpm = wpms.length
    ? wpms.reduce((a, b) => a + b, 0) / wpms.length
    : 0;
  const penalty = Math.min(80, issues.length * 12);
  return {
    score: Math.max(0, 100 - penalty),
    issues,
    cueCount: cues.length,
    avgWpm: Math.round(avgWpm),
  };
}

/**
 * Smart retime: stretch/compress cues toward a target WPM while keeping order.
 */
export function smartRetime(
  cues: CaptionCue[],
  options: { targetWpm?: number; gap?: number } = {},
): CaptionCue[] {
  const targetWpm = options.targetWpm ?? 160;
  const gap = options.gap ?? 0.08;
  let t = cues[0]?.start ?? 0;
  const next = cues.map((cue) => {
    const words = Math.max(1, cue.text.trim().split(/\s+/).filter(Boolean).length);
    const duration = Math.max(0.9, (words / targetWpm) * 60 + 0.25);
    const start = round2(t);
    const end = round2(t + duration);
    t = end + gap;
    return { ...cue, start, end };
  });
  return normalizeCues(next);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
