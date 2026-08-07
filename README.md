# cinematype

Typography + caption toolkit for **content creators** — local studio, **export plugins** (CapCut, YouTube, FFmpeg, Remotion, Whisper, OBS…), OFL fonts, kinetic type, transcript→cues, brand kit, and VTT/SRT/ASS.

## For creators (no app coding)

```bash
bun install
bun run playground   # http://localhost:5180
```

**Studio flow:** pick template → upload video → paste transcript → edit cue times → set brand → download SRT/ASS + title PNG → burn in with the shown FFmpeg command.

Full walkthrough: [docs/CREATOR.md](./docs/CREATOR.md)

## For developers

```bash
bun add cinematype
```

```ts
import {
  loadFonts,
  loadBrandKit,
  transcriptToCues,
  downloadSubtitles,
  renderTitleCard,
  downloadCanvas,
  ffmpegBurnInCommand,
} from "cinematype";
import { downloadPluginPack } from "cinematype/plugins";
import "cinematype/css";

await loadFonts();

const cues = transcriptToCues("Hook line.\n\nHere is the value.", {
  style: "burn",
  maxWords: 6,
});
downloadSubtitles(cues, "srt", "shorts.srt");

const card = renderTitleCard("STOP SCROLLING", "shorts-punch");
await downloadCanvas(card, "hook.png");

downloadPluginPack("capcut", {
  cues,
  brand: loadBrandKit(),
  aspect: "youtube-shorts",
});

console.log(
  ffmpegBurnInCommand({
    input: "clip.mp4",
    output: "burned.mp4",
    subtitles: "shorts.ass",
  }),
);
```

### React

```tsx
import {
  CinematypeProvider,
  KineticText,
  TypedVideo,
  useBrandKit,
} from "cinematype/react";
import { getCreatorTemplate } from "cinematype";

const template = getCreatorTemplate("youtube-opener");

export function App() {
  const { brand } = useBrandKit();
  return (
    <CinematypeProvider>
      <KineticText text={brand.channelName} preset="pop" font="bebas-neue" />
      <TypedVideo src="/reel.mp4" cues={template.cues} />
    </CinematypeProvider>
  );
}
```

## What’s included (v0.4)

| Area | Details |
|------|---------|
| **Studio** | BYO video, cue timeline, transcript/Whisper JSON, brand kit, safe zones, **Plugins** tab |
| **Plugins** | CapCut, YouTube, TikTok, Reels, Premiere, DaVinci, FFmpeg, Whisper, Remotion, OBS — see [docs/PLUGINS.md](./docs/PLUGINS.md) |
| **18 OFL fonts** | Impact, editorial, UI, script, mono… |
| **Captions** | VTT / SRT / ASS + SRT parse |
| **Transcript** | Plain text / Whisper JSON → timed cues |
| **Brand kit** | Channel colors/fonts/lower-third (localStorage) |
| **Frames** | YouTube, Shorts, TikTok, Reels, Stories, square, 4:5… |
| **Title cards** | Preset PNG generators |
| **Motion** | 14 kinetic presets |
| **React hooks** | `useKinetic`, `useVideoOverlay`, `useBrandKit` |

## Scripts

```bash
bun run playground      # creator studio
bun run build
bun test
bun run vendor:fonts    # refresh fonts/ from Fontsource (dev)
```

## License

- **Software**: MIT — [LICENSE](./LICENSE)
- **Fonts**: SIL OFL 1.1 — [licenses/OFL.txt](./licenses/OFL.txt), [licenses/ATTRIBUTION.md](./licenses/ATTRIBUTION.md)
