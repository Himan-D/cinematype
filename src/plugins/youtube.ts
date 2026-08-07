import { cuesToVtt, type CaptionCue } from "../video/captions";
import { cuesToSrt } from "../video/formats";
import type { CinematypePlugin } from "./types";

/** YouTube chapters from chapter/title cues (or every N seconds fallback) */
export function cuesToYoutubeChapters(cues: CaptionCue[]): string {
  const chapterCues = cues.filter(
    (c) => c.style === "chapter" || c.style === "title" || c.style === "end-card",
  );
  const source = chapterCues.length ? chapterCues : cues.filter((_, i) => i === 0 || i % 3 === 0);
  const lines = ["0:00 Intro"];
  for (const cue of source) {
    if (cue.start < 1) continue;
    lines.push(`${formatChapterTime(cue.start)} ${cue.text.replace(/\n/g, " ").slice(0, 80)}`);
  }
  return [...new Set(lines)].join("\n");
}

export function youtubeDescription(opts: {
  title: string;
  brandName: string;
  tagline?: string;
  chapters: string;
}): string {
  return [
    opts.title,
    "",
    opts.tagline ?? "",
    "",
    "⏱ Chapters",
    opts.chapters,
    "",
    `🔔 ${opts.brandName}`,
    "",
    "#shorts #youtube #content",
  ]
    .filter((l, i, arr) => !(l === "" && arr[i - 1] === ""))
    .join("\n");
}

export const youtubePlugin: CinematypePlugin = {
  id: "youtube",
  name: "YouTube",
  description: "SRT/VTT upload pack, chapters, and description draft.",
  platforms: ["YouTube", "YouTube Shorts"],
  export: (ctx) => {
    const chapters = cuesToYoutubeChapters(ctx.cues);
    const title = ctx.title ?? ctx.cues.find((c) => c.style === "title")?.text ?? "New upload";
    const description = youtubeDescription({
      title,
      brandName: ctx.brand.channelName,
      tagline: ctx.brand.tagline,
      chapters,
    });
    return {
      files: [
        {
          filename: "youtube-captions.srt",
          mime: "application/x-subrip",
          content: cuesToSrt(ctx.cues),
        },
        {
          filename: "youtube-captions.vtt",
          mime: "text/vtt",
          content: cuesToVtt(ctx.cues, ctx.brand.channelName),
        },
        {
          filename: "youtube-chapters.txt",
          mime: "text/plain",
          content: chapters,
        },
        {
          filename: "youtube-description.txt",
          mime: "text/plain",
          content: description,
        },
      ],
      notes: [
        "YouTube Studio → Subtitles → Upload file (SRT or VTT).",
        "Paste chapters.txt into the description (first line must be 0:00).",
      ],
    };
  },
};

function formatChapterTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}
