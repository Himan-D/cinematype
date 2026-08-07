# Plugins

Import from `cinematype/plugins` (or the root package for common helpers).

| Plugin | Id | What it exports |
|--------|----|-----------------|
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

In the studio: open the **Plugins** tab → pick a tool → **Download pack**.
