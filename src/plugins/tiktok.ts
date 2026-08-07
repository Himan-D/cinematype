import { cuesToSrt } from "../video/formats";
import { retimeCues } from "../video/transcript";
import type { CinematypePlugin } from "./types";

export const tiktokPlugin: CinematypePlugin = {
  id: "tiktok",
  name: "TikTok",
  description: "Fast burn-style captions + vertical-safe SRT pack.",
  platforms: ["TikTok"],
  export: (ctx) => {
    const paced = retimeCues(
      ctx.cues.map((c) => ({
        ...c,
        style: c.style === "title" ? c.style : "burn",
      })),
      { scale: 0.92, minDuration: 0.7 },
    );
    const tips = `# TikTok caption tips — ${ctx.brand.channelName}

- Aspect: 9:16 (1080×1920)
- Keep text above the bottom ~22% (action bar)
- Avoid right-side username / share column
- Brand accent: ${ctx.brand.primaryColor}
- Hook in first 1.5s
`;
    return {
      files: [
        {
          filename: "tiktok-captions.srt",
          mime: "application/x-subrip",
          content: cuesToSrt(paced),
        },
        {
          filename: "TIKTOK-TIPS.md",
          mime: "text/markdown",
          content: tips,
        },
      ],
      notes: ["Import SRT in CapCut, then export vertical for TikTok."],
    };
  },
};

export const reelsPlugin: CinematypePlugin = {
  id: "reels",
  name: "Instagram Reels",
  description: "Reels-safe caption pack with burn-in friendly timing.",
  platforms: ["Instagram Reels", "Stories"],
  export: (ctx) => {
    const paced = retimeCues(
      ctx.cues.map((c) => ({ ...c, style: c.style ?? "burn" })),
      { scale: 0.95, minDuration: 0.75 },
    );
    return {
      files: [
        {
          filename: "reels-captions.srt",
          mime: "application/x-subrip",
          content: cuesToSrt(paced),
        },
        {
          filename: "REELS-TIPS.md",
          mime: "text/markdown",
          content: `# Reels pack — ${ctx.brand.channelName}\n\nUse 9:16. Keep captions centered in the safe zone. Accent ${ctx.brand.primaryColor}.\n`,
        },
      ],
      notes: ["Upload via Instagram app or schedule with Meta Business Suite."],
    };
  },
};
