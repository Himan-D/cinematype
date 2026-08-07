import type { CaptionCue } from "./captions";
import { cuesToVtt } from "./captions";
import { cuesToAss, cuesToSrt } from "./formats";

export type SubtitleFormat = "vtt" | "srt" | "ass";

/** Serialize cues to a subtitle format string */
export function exportSubtitles(
  cues: CaptionCue[],
  format: SubtitleFormat = "srt",
  title = "cinematype",
): string {
  if (format === "vtt") return cuesToVtt(cues, title);
  if (format === "ass") return cuesToAss(cues, { title });
  return cuesToSrt(cues);
}

export function subtitleMime(format: SubtitleFormat): string {
  if (format === "vtt") return "text/vtt";
  if (format === "ass") return "text/plain";
  return "application/x-subrip";
}

export function subtitleExtension(format: SubtitleFormat): string {
  return format;
}

/** Trigger a browser download for subtitle text */
export function downloadSubtitles(
  cues: CaptionCue[],
  format: SubtitleFormat = "srt",
  filename = `captions.${format}`,
): void {
  if (typeof document === "undefined") {
    throw new Error("downloadSubtitles requires a browser document");
  }
  const body = exportSubtitles(cues, format);
  const blob = new Blob([body], { type: `${subtitleMime(format)};charset=utf-8` });
  downloadBlob(blob, filename.endsWith(`.${format}`) ? filename : `${filename}.${format}`);
}

/** Canvas → Blob (PNG/WebP/JPEG) */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: "image/png" | "image/webp" | "image/jpeg" = "image/png",
  quality = 0.92,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("canvas.toBlob failed"));
        else resolve(blob);
      },
      type,
      quality,
    );
  });
}

/** Canvas → data URL */
export function canvasToDataURL(
  canvas: HTMLCanvasElement,
  type: "image/png" | "image/webp" | "image/jpeg" = "image/png",
  quality = 0.92,
): string {
  return canvas.toDataURL(type, quality);
}

/** Trigger a browser download for a canvas frame (title card / thumbnail) */
export async function downloadCanvas(
  canvas: HTMLCanvasElement,
  filename = "title-card.png",
  type: "image/png" | "image/webp" | "image/jpeg" = "image/png",
): Promise<void> {
  const blob = await canvasToBlob(canvas, type);
  downloadBlob(blob, filename);
}

export function downloadBlob(blob: Blob, filename: string): void {
  if (typeof document === "undefined") {
    throw new Error("downloadBlob requires a browser document");
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Download every cue as a numbered PNG sequence (for editors / encoders) */
export async function downloadCuePngSequence(
  frames: Array<{ canvas: HTMLCanvasElement; cue: CaptionCue; time: number }>,
  prefix = "cue",
): Promise<void> {
  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i]!;
    const name = `${prefix}-${String(i + 1).padStart(3, "0")}-${frame.time.toFixed(2)}s.png`;
    await downloadCanvas(frame.canvas, name);
  }
}
