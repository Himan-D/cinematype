import type { CaptionCue } from "../video/captions";
import { transcriptToCues } from "../video/transcript";
import { cuesToSrt } from "../video/formats";
import type { CinematypePlugin, PluginContext } from "./types";

/** OpenAI Whisper verbose_json segment shape (subset) */
export interface WhisperSegment {
  id?: number;
  start: number;
  end: number;
  text: string;
}

export interface WhisperVerboseJson {
  text?: string;
  segments?: WhisperSegment[];
  language?: string;
}

/** Convert Whisper verbose_json (or segments array) into CaptionCue[] */
export function whisperJsonToCues(input: unknown): CaptionCue[] {
  if (Array.isArray(input)) {
    return normalizeSegments(input as WhisperSegment[]);
  }
  if (input && typeof input === "object") {
    const doc = input as WhisperVerboseJson;
    if (doc.segments?.length) return normalizeSegments(doc.segments);
    if (doc.text?.trim()) {
      return transcriptToCues(doc.text, { style: "burn", maxWords: 8 });
    }
  }
  if (typeof input === "string") {
    try {
      return whisperJsonToCues(JSON.parse(input));
    } catch {
      return transcriptToCues(input, { style: "burn", maxWords: 8 });
    }
  }
  return [];
}

function normalizeSegments(segments: WhisperSegment[]): CaptionCue[] {
  return segments
    .filter((s) => s && typeof s.start === "number" && typeof s.end === "number")
    .map((s) => ({
      start: round2(s.start),
      end: round2(Math.max(s.end, s.start + 0.4)),
      text: s.text.replace(/^\s+/, "").trim(),
      style: "burn" as const,
    }))
    .filter((c) => c.text);
}

export const whisperPlugin: CinematypePlugin = {
  id: "whisper",
  name: "Whisper",
  description: "Import Whisper JSON / plain transcript and re-export SRT.",
  platforms: ["OpenAI Whisper", "whisper.cpp", "faster-whisper"],
  export: (ctx: PluginContext) => ({
    files: [
      {
        filename: "from-whisper.srt",
        mime: "application/x-subrip",
        content: cuesToSrt(ctx.cues),
      },
      {
        filename: "WHISPER-IMPORT.md",
        mime: "text/markdown",
        content: `# Whisper → cinematype

1. Transcribe with Whisper using \`verbose_json\`
2. In the studio: Transcript tab → paste JSON or plain text
3. Or in code: \`whisperJsonToCues(json)\`

\`\`\`ts
import { whisperJsonToCues, downloadSubtitles } from "cinematype/plugins";
const cues = whisperJsonToCues(whisperOutput);
downloadSubtitles(cues, "srt", "episode.srt");
\`\`\`
`,
      },
    ],
    notes: [
      "Studio accepts pasted Whisper JSON in the Transcript tab (auto-detect).",
      "Use whisperJsonToCues() in code for verbose_json files.",
    ],
  }),
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
