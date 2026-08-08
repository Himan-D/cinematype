/**
 * Phase 2 — batch export helpers for multiple destinations / formats.
 */
import type { BrandKit } from "./brand";
import type { AspectId } from "./aspects";
import type { CaptionCue } from "./captions";
import { exportSubtitles, type SubtitleFormat } from "./export";
import { brandToAssOptions } from "./brand";
import { cuesToAss } from "./formats";
import { framePixels } from "./aspects";

export interface BatchExportItem {
  filename: string;
  mime: string;
  content: string;
}

export interface BatchExportOptions {
  cues: CaptionCue[];
  brand: BrandKit;
  aspect: AspectId;
  basename?: string;
  formats?: SubtitleFormat[];
}

/** Build SRT/VTT/ASS (branded) files in one shot */
export function batchExportFormats(options: BatchExportOptions): BatchExportItem[] {
  const basename = options.basename ?? "captions";
  const formats = options.formats ?? ["srt", "vtt", "ass"];
  const { width, height } = framePixels(options.aspect);
  const items: BatchExportItem[] = [];

  for (const format of formats) {
    let content: string;
    if (format === "ass") {
      content = cuesToAss(
        options.cues,
        brandToAssOptions(options.brand, width, height),
      );
    } else {
      content = exportSubtitles(options.cues, format);
    }
    items.push({
      filename: `${basename}.${format}`,
      mime:
        format === "vtt"
          ? "text/vtt"
          : format === "ass"
            ? "text/plain"
            : "application/x-subrip",
      content,
    });
  }
  return items;
}
