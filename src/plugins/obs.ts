import { cuesToVtt } from "../video/captions";
import type { CinematypePlugin } from "./types";

export const obsPlugin: CinematypePlugin = {
  id: "obs",
  name: "OBS Studio",
  description: "Browser-source overlay HTML + VTT for live captions.",
  platforms: ["OBS Studio"],
  export: (ctx) => {
    const vtt = cuesToVtt(ctx.cues, ctx.brand.channelName);
    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(ctx.brand.channelName)} · cinematype overlay</title>
  <style>
    html, body { margin: 0; background: transparent; overflow: hidden; }
    #line {
      position: fixed; left: 6%; right: 6%; bottom: 10%;
      font-family: ${JSON.stringify(String(ctx.brand.fontDisplay))}, system-ui, sans-serif;
      font-size: clamp(28px, 4vw, 56px); font-weight: 700;
      color: ${ctx.brand.secondaryColor};
      text-align: center;
      text-shadow: 0 2px 16px rgba(0,0,0,0.65);
    }
    #lower {
      position: fixed; left: 6%; bottom: 18%;
      background: rgba(0,0,0,0.55); color: ${ctx.brand.secondaryColor};
      padding: 0.55rem 1rem; font-size: 28px;
      border-left: 4px solid ${ctx.brand.primaryColor};
      font-family: system-ui, sans-serif;
    }
  </style>
</head>
<body>
  <div id="lower">${escapeHtml(ctx.brand.lowerThirdTitle ?? ctx.brand.channelName)}${
      ctx.brand.lowerThirdSubtitle
        ? ` · ${escapeHtml(ctx.brand.lowerThirdSubtitle)}`
        : ""
    }</div>
  <div id="line">${escapeHtml(ctx.title ?? "Live")}</div>
  <script>
    // Drive #line from your dock / websocket, or replace with static lower-third only.
  </script>
</body>
</html>
`;
    return {
      files: [
        {
          filename: "obs-overlay.html",
          mime: "text/html",
          content: html,
        },
        {
          filename: "obs-captions.vtt",
          mime: "text/vtt",
          content: vtt,
        },
        {
          filename: "OBS-SETUP.md",
          mime: "text/markdown",
          content: `# OBS setup

1. Sources → Browser → local file \`obs-overlay.html\` (width 1920 height 1080)
2. Or host the HTML and use a URL
3. For VOD captions, use \`obs-captions.vtt\` in your editor after recording
`,
        },
      ],
      notes: ["Browser source should use a transparent background."],
    };
  },
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
