import { cuesToSrt } from "../video/formats";
import type { CinematypePlugin } from "./types";

/** Premiere / Resolve marker CSV (Name, Start, End, Comment) */
export function cuesToMarkerCsv(
  cues: Array<{ start: number; end: number; text: string; style?: string }>,
): string {
  const header = "Name,Start,End,Comment";
  const rows = cues.map((c) => {
    const name = csv(c.style ?? "caption");
    const comment = csv(c.text.replace(/\n/g, " "));
    return `${name},${c.start.toFixed(3)},${c.end.toFixed(3)},${comment}`;
  });
  return [header, ...rows].join("\n");
}

export const premierePlugin: CinematypePlugin = {
  id: "premiere",
  name: "Adobe Premiere Pro",
  description: "SRT + marker CSV for Premiere timelines.",
  platforms: ["Adobe Premiere Pro"],
  export: (ctx) => ({
    files: [
      {
        filename: "premiere-captions.srt",
        mime: "application/x-subrip",
        content: cuesToSrt(ctx.cues),
      },
      {
        filename: "premiere-markers.csv",
        mime: "text/csv",
        content: cuesToMarkerCsv(ctx.cues),
        note: "Import as markers or use as a timing reference sheet",
      },
      {
        filename: "PREMIERE-IMPORT.md",
        mime: "text/markdown",
        content: `# Premiere import

1. File → Import → select \`premiere-captions.srt\`
2. Drag the captions item onto your sequence
3. Or: Window → Captions → create track and import SRT
`,
      },
    ],
    notes: ["Premiere prefers SRT for caption tracks."],
  }),
};

export const davinciPlugin: CinematypePlugin = {
  id: "davinci",
  name: "DaVinci Resolve",
  description: "SRT + marker CSV for DaVinci Resolve.",
  platforms: ["DaVinci Resolve"],
  export: (ctx) => ({
    files: [
      {
        filename: "resolve-captions.srt",
        mime: "application/x-subrip",
        content: cuesToSrt(ctx.cues),
      },
      {
        filename: "resolve-markers.csv",
        mime: "text/csv",
        content: cuesToMarkerCsv(ctx.cues),
      },
      {
        filename: "RESOLVE-IMPORT.md",
        mime: "text/markdown",
        content: `# DaVinci Resolve import

Timeline → Create Subtitle Track → Import Subtitle File → choose the SRT.
`,
      },
    ],
    notes: ["Resolve Free and Studio both support SRT import."],
  }),
};

function csv(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}
