# cinematype

**Make your captions look like your brand.**

Create your typography style once. Apply it to every video. Export to CapCut, Premiere, DaVinci, YouTube, Reels, TikTok, or your own app.

[![CI](https://github.com/Himan-D/cinematype/actions/workflows/ci.yml/badge.svg)](https://github.com/Himan-D/cinematype/actions/workflows/ci.yml)

Local-first · open-source · brand-first typography for creators — not another AI video editor.

---

## Start in one command

```bash
curl -fsSL https://raw.githubusercontent.com/Himan-D/cinematype/main/scripts/get-cinematype.sh | bash
```

Opens the **studio** at http://localhost:5180 — pick a style, preview on video, export a destination pack.

### One-shot captions (no UI)

```bash
# SRT for CapCut / Premiere / YouTube
curl -fsSL https://raw.githubusercontent.com/Himan-D/cinematype/main/scripts/get-cinematype.sh \
  | bash -s -- captions --text "Stop scrolling. This changes everything." --out hook.srt

# CapCut destination pack
curl -fsSL https://raw.githubusercontent.com/Himan-D/cinematype/main/scripts/get-cinematype.sh \
  | bash -s -- plugin capcut --text "Stop scrolling. This changes everything." --out-dir ./capcut-pack

# YouTube destination pack
curl -fsSL https://raw.githubusercontent.com/Himan-D/cinematype/main/scripts/get-cinematype.sh \
  | bash -s -- plugin youtube --file voiceover.txt --out-dir ./yt-pack
```

### Already cloned?

```bash
bun install
bun run studio
bun run ct -- captions --text "Hook line" --out hook.srt
bun run ct -- plugin capcut --text "Hook" --out-dir ./pack
bun run ct -- project save --text "Hook" --out project.ct
```

---

## Creator path

| Step | What you do | What you get |
|------|-------------|--------------|
| 1 | Paste transcript / pick template | Timed cues |
| 2 | Apply brand kit · watch preview | *Looks like your content* |
| 3 | Destinations → CapCut / YouTube / … | Download pack |
| 4 | Save `project.ct` | Reopen anytime |

---

## CLI

```bash
bun run ct -- help
bun run ct -- studio
bun run ct -- captions --text "..." --format srt --out out.srt
bun run ct -- plugin <capcut|youtube|tiktok|reels|premiere|davinci|ffmpeg|whisper|remotion|obs>
bun run ct -- project save --text "..." --out project.ct
bun run ct -- project open --file project.ct
bun run ct -- destinations
bun run ct -- doctor
```

---

## For developers

```bash
bun add cinematype
```

```ts
import {
  transcriptToCues,
  downloadSubtitles,
  loadFonts,
  createProject,
  applyBrandToCues,
} from "cinematype";
import { downloadPluginPack } from "cinematype/plugins";
import "cinematype/css";

await loadFonts();
const cues = transcriptToCues("Hook.\n\nValue.", { style: "burn" });
const project = createProject({ cues, platform: "youtube-shorts" });
downloadSubtitles(applyBrandToCues(project.cues, project.brand), "srt", "shorts.srt");
downloadPluginPack("capcut", {
  cues: project.cues,
  brand: project.brand,
  aspect: "youtube-shorts",
});
```

Docs: [docs/PRD.md](./docs/PRD.md) · [docs/SDK.md](./docs/SDK.md) · [docs/CREATOR.md](./docs/CREATOR.md) · [docs/PLUGINS.md](./docs/PLUGINS.md) · [docs/ONBOARDING.md](./docs/ONBOARDING.md) · [CONTRIBUTING.md](./CONTRIBUTING.md) · [AGENTS.md](./AGENTS.md)

---

## What’s inside

- **Studio** — live video preview, brand kits, caption editor, `project.ct`
- **Export destinations** — CapCut, YouTube, TikTok, Reels, Premiere, DaVinci, FFmpeg, Whisper, Remotion, OBS
- **Smart captions** — emphasis, reading-speed score, auto style, batch export, karaoke word cues
- **Plugin SDK** — `registerPlugin` + community templates + team brand packs
- **Typography** — 18 OFL fonts · custom fonts · CaptionStyle · kinetic motion · title cards
- **SDK** — React hooks/components · CLI (`batch`, `smart`, `score`, `whisper`, `style`) · MIT + OFL

## License

MIT (software) · SIL OFL 1.1 (fonts) — see [LICENSE](./LICENSE) + [licenses/](./licenses/)
