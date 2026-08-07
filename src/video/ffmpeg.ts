import type { AspectId } from "./aspects";
import { getFrameSize } from "./aspects";

export interface FfmpegBurnOptions {
  /** Input video path */
  input: string;
  /** Output video path */
  output: string;
  /** Subtitle file (.ass preferred for styling, .srt also works) */
  subtitles: string;
  /** Optional: force output size */
  aspect?: AspectId;
  /** CRF quality (lower = better, default 18) */
  crf?: number;
  /** Prefer ass filter (true) or subtitles filter */
  preferAss?: boolean;
}

/** Generate a copy-paste FFmpeg command to burn captions into video */
export function ffmpegBurnInCommand(options: FfmpegBurnOptions): string {
  const crf = options.crf ?? 18;
  const sub = escapeFilterPath(options.subtitles);
  const useAss =
    options.preferAss !== false && options.subtitles.toLowerCase().endsWith(".ass");
  const vfParts: string[] = [];

  if (options.aspect) {
    const frame = getFrameSize(options.aspect);
    vfParts.push(
      `scale=${frame.width}:${frame.height}:force_original_aspect_ratio=decrease`,
      `pad=${frame.width}:${frame.height}:(ow-iw)/2:(oh-ih)/2`,
    );
  }

  vfParts.push(useAss ? `ass=${sub}` : `subtitles=${sub}`);

  return [
    "ffmpeg -y",
    `-i ${shellQuote(options.input)}`,
    `-vf ${shellQuote(vfParts.join(","))}`,
    `-c:a copy`,
    `-c:v libx264 -crf ${crf} -pix_fmt yuv420p`,
    shellQuote(options.output),
  ].join(" ");
}

export interface FfmpegTitleCardOptions {
  image: string;
  output: string;
  duration?: number;
  aspect?: AspectId;
}

/** Still title card → short MP4 bumper */
export function ffmpegTitleCardCommand(options: FfmpegTitleCardOptions): string {
  const duration = options.duration ?? 3;
  const size = options.aspect
    ? getFrameSize(options.aspect)
    : { width: 1920, height: 1080 };
  return [
    "ffmpeg -y",
    `-loop 1 -i ${shellQuote(options.image)}`,
    `-t ${duration}`,
    `-vf ${shellQuote(`scale=${size.width}:${size.height}`)}`,
    `-c:v libx264 -tune stillimage -pix_fmt yuv420p`,
    shellQuote(options.output),
  ].join(" ");
}

/** Human-readable burn-in recipe for docs / studio UI */
export function ffmpegRecipe(input = "input.mp4", subs = "captions.ass"): string {
  return [
    "# 1) Export ASS from cinematype studio",
    "# 2) Burn into your video:",
    ffmpegBurnInCommand({
      input,
      output: "output-burned.mp4",
      subtitles: subs,
      preferAss: true,
    }),
    "",
    "# Title card bumper from PNG:",
    ffmpegTitleCardCommand({
      image: "hook.png",
      output: "hook-bumper.mp4",
      duration: 2.5,
      aspect: "youtube",
    }),
  ].join("\n");
}

function shellQuote(value: string): string {
  if (/^[A-Za-z0-9_./:@+-]+$/.test(value)) return value;
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

/** FFmpeg filter paths need escaping for : and \\ */
function escapeFilterPath(path: string): string {
  return path.replace(/\\/g, "/").replace(/:/g, "\\:").replace(/,/g, "\\,");
}
