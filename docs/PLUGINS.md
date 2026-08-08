# Destinations (plugins API)

Product language: **destinations**. Package API: `cinematype/plugins` (stable).

Import from `cinematype/plugins` (or the root package for common helpers).

| Destination | Id | What it exports |
|-------------|----|-----------------|
| CapCut | `capcut` | SRT + import checklist |
| YouTube | `youtube` | SRT, VTT, chapters, description |
| TikTok | `tiktok` | Paced SRT + tips |
| Instagram Reels | `reels` | Reels-safe SRT |
| Premiere Pro | `premiere` | SRT + marker CSV |
| DaVinci Resolve | `davinci` | SRT + marker CSV |
| FFmpeg | `ffmpeg` | ASS + burn-in / bumper commands |
| Whisper | `whisper` | Import JSON → SRT docs (`whisperJsonToCues`) |
| Remotion | `remotion` | JSON sequence + sample TSX |
| OBS | `obs` | Browser-source HTML + VTT |

## Usage

```ts
import {
  listPlugins,
  runPlugin,
  downloadPluginPack,
  whisperJsonToCues,
} from "cinematype/plugins";
import { DEFAULT_BRAND_KIT } from "cinematype";

const ctx = {
  cues: whisperJsonToCues(whisperVerboseJson),
  brand: DEFAULT_BRAND_KIT,
  aspect: "youtube-shorts" as const,
  title: "STOP SCROLLING",
  videoPath: "clip.mp4",
};

const pack = runPlugin("capcut", ctx);
// or in the browser:
downloadPluginPack("youtube", ctx);
```

Studio: open the **Destinations** tab to download packs without writing code.
