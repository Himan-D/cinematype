import { ffmpegBurnInCommand, ffmpegTitleCardCommand } from "../video/ffmpeg";
import { cuesToAss } from "../video/formats";
import type { CinematypePlugin } from "./types";

export const ffmpegPlugin: CinematypePlugin = {
  id: "ffmpeg",
  name: "FFmpeg",
  description: "Burn ASS captions into video and build title-card bumpers.",
  platforms: ["CLI", "macOS", "Windows", "Linux"],
  export: (ctx) => {
    const ass = cuesToAss(ctx.cues, {
      title: ctx.title ?? ctx.brand.channelName,
      fontName: String(ctx.brand.fontDisplay),
    });
    const input = ctx.videoPath ?? "input.mp4";
    return {
      files: [
        {
          filename: "captions.ass",
          mime: "text/plain",
          content: ass,
          note: "Styled subtitles for ass= filter",
        },
      ],
      commands: [
        ffmpegBurnInCommand({
          input,
          output: "output-burned.mp4",
          subtitles: "captions.ass",
          aspect: ctx.aspect,
        }),
        ffmpegTitleCardCommand({
          image: "hook.png",
          output: "hook-bumper.mp4",
          duration: 2.5,
          aspect: ctx.aspect,
        }),
      ],
      notes: [
        "Install FFmpeg, place captions.ass next to your video, run the burn-in command.",
      ],
    };
  },
};
