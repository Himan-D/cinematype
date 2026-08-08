# Creator recipes (no React required)

## 1) Studio (easiest)

```bash
bun install
bun run playground
```

Open http://localhost:5180

1. Pick a template (YouTube opener, Shorts hook, …)
2. Upload your video (or keep the demo)
3. Paste a transcript → **Generate captions**
4. Edit cue times in the right panel (Split / Merge · keyboard shortcuts)
5. **Style / Brand** — fonts, colors, caption look (saved in the browser)
6. **Destinations** → CapCut / YouTube pack, or SRT / VTT / ASS + title PNG
7. **Save .ct** to reopen the project later
8. Copy the FFmpeg command to burn ASS into the video

## 2) CapCut / Premiere / YouTube

1. Export **SRT** from the studio
2. CapCut: Captions → Import captions  
   Premiere: File → Import → select `.srt`  
   YouTube Studio: Subtitles → Upload file

## 3) FFmpeg burn-in

```bash
# From studio Export tab, or:
ffmpeg -y -i your-video.mp4 -vf ass=captions.ass \
  -c:a copy -c:v libx264 -crf 18 -pix_fmt yuv420p output-burned.mp4
```

## 4) Code snippet — transcript to SRT

```ts
import {
  transcriptToCues,
  downloadSubtitles,
  renderTitleCard,
  downloadCanvas,
  applyBrandToCues,
  loadBrandKit,
} from "cinematype";

const cues = transcriptToCues(myScript, { style: "burn", maxWords: 6 });
const branded = applyBrandToCues(cues, loadBrandKit());
downloadSubtitles(branded, "srt", "episode.srt");

const card = renderTitleCard("STOP SCROLLING", "shorts-punch");
await downloadCanvas(card, "hook.png");
```

## 5) Brand kit

Saved under `localStorage` key `cinematype:brand-kit` when using the studio.
In apps, use `saveBrandKit` / `loadBrandKit` / `useBrandKit()` from `cinematype/react`.
