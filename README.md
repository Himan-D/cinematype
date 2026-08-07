# cinematype

**Captions + title cards for content creators — from script to CapCut/YouTube in under a minute.**

[![CI](https://github.com/Himan-D/cinematype/actions/workflows/ci.yml/badge.svg)](https://github.com/Himan-D/cinematype/actions/workflows/ci.yml)

---

## Start in one command

```bash
curl -fsSL https://raw.githubusercontent.com/Himan-D/cinematype/main/scripts/get-cinematype.sh | bash
```

That installs Bun (if needed), clones the kit, and opens the **studio** at http://localhost:5180.

### One-shot captions (no UI)

```bash
# SRT for CapCut / Premiere / YouTube
curl -fsSL https://raw.githubusercontent.com/Himan-D/cinematype/main/scripts/get-cinematype.sh \
  | bash -s -- captions --text "Stop scrolling. This changes everything." --out hook.srt

# Full CapCut pack (SRT + import checklist)
curl -fsSL https://raw.githubusercontent.com/Himan-D/cinematype/main/scripts/get-cinematype.sh \
  | bash -s -- plugin capcut --text "Stop scrolling. This changes everything." --out-dir ./capcut-pack

# YouTube pack (SRT + VTT + chapters + description)
curl -fsSL https://raw.githubusercontent.com/Himan-D/cinematype/main/scripts/get-cinematype.sh \
  | bash -s -- plugin youtube --file voiceover.txt --out-dir ./yt-pack
```

### Already cloned?

```bash
bun install
bun run studio          # same as: bunx cinematype studio
bun run ct -- captions --text "Hook line" --out hook.srt
bun run ct -- plugin capcut --text "Hook" --out-dir ./pack
```

---

## Creator path (the product)

| Step | What you do | What you get |
|------|-------------|--------------|
| 1 | Paste transcript / Whisper JSON | Auto-timed cues |
| 2 | Tweak times in the cue list | Broadcast-ready timing |
| 3 | Plugins → CapCut / YouTube | Download pack |
| 4 | Drop SRT into editor | Upload |

Optional: Brand kit (name + colors), title-card PNG, FFmpeg burn-in command.

---

## CLI

```bash
bun run ct -- help
bun run ct -- studio
bun run ct -- captions --text "..." --format srt --out out.srt
bun run ct -- plugin <capcut|youtube|tiktok|reels|premiere|davinci|ffmpeg|whisper|remotion|obs>
bun run ct -- templates
bun run ct -- plugins
bun run ct -- doctor
```

After publish to npm: `bunx cinematype …` / `npx cinematype …`.

---

## For developers

```bash
bun add cinematype
```

```ts
import { transcriptToCues, downloadSubtitles, loadFonts } from "cinematype";
import { downloadPluginPack } from "cinematype/plugins";
import "cinematype/css";

await loadFonts();
const cues = transcriptToCues("Hook.\n\nValue.", { style: "burn" });
downloadSubtitles(cues, "srt", "shorts.srt");
downloadPluginPack("capcut", { cues, brand: { /* … */ }, aspect: "youtube-shorts" });
```

Docs: [docs/CREATOR.md](./docs/CREATOR.md) · [docs/PLUGINS.md](./docs/PLUGINS.md) · [docs/ONBOARDING.md](./docs/ONBOARDING.md) · [CONTRIBUTING.md](./CONTRIBUTING.md) · [AGENTS.md](./AGENTS.md) (for AI coding agents)

---

## What’s inside

- **Studio** with first-run onboarding
- **10 plugins** — CapCut, YouTube, TikTok, Reels, Premiere, DaVinci, FFmpeg, Whisper, Remotion, OBS
- **18 OFL fonts** · kinetic motion · brand kit · social frames · title cards
- **React** hooks/components · MIT software + OFL fonts

## License

MIT (software) · SIL OFL 1.1 (fonts) — see [LICENSE](./LICENSE) + [licenses/](./licenses/)
