import { cuesToSrt } from "../video/formats";
import type { CinematypePlugin } from "./types";

export const capcutPlugin: CinematypePlugin = {
  id: "capcut",
  name: "CapCut",
  description: "Export CapCut-friendly SRT + import checklist.",
  platforms: ["CapCut desktop", "CapCut mobile"],
  export: (ctx) => {
    const srt = cuesToSrt(ctx.cues);
    const readme = `# CapCut import — ${ctx.brand.channelName}

1. Open your project in CapCut
2. Timeline → Text / Captions → Import captions
3. Choose \`${ctx.brand.channelName.replace(/\s+/g, "-").toLowerCase()}-captions.srt\`
4. Style: match brand primary ${ctx.brand.primaryColor}
5. Font suggestion: ${ctx.brand.fontDisplay}
6. Keep captions inside the safe zone for ${ctx.aspect}

Lower-third text: ${ctx.brand.lowerThirdTitle ?? ctx.brand.channelName}${
      ctx.brand.lowerThirdSubtitle ? ` · ${ctx.brand.lowerThirdSubtitle}` : ""
    }
`;
    return {
      files: [
        {
          filename: `${slug(ctx.brand.channelName)}-captions.srt`,
          mime: "application/x-subrip",
          content: srt,
        },
        {
          filename: "CAPCUT-IMPORT.md",
          mime: "text/markdown",
          content: readme,
        },
      ],
      notes: [
        "CapCut accepts SRT. After import, apply Auto captions styling or manual font.",
      ],
    };
  },
};

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "cinematype";
}
