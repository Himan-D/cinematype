# AGENTS.md — cinematype

Instructions for AI coding agents (Cursor, Claude Code, Codex, etc.) working in this repository.

## Mission

**cinematype** helps content creators go from voiceover script → CapCut / YouTube-ready captions + title cards in under a minute.

Optimize for:

1. **Time-to-first-SRT** (curl / CLI / studio)
2. **Editor handoff** (CapCut, Premiere, YouTube, FFmpeg packs)
3. **Zero-config local studio** (`bun run studio`)

Non-goals unless explicitly requested: cloud accounts, in-browser Whisper weights, CapCut binary plugins.

## Stack (non-negotiable)

- **Bun only** — not Node/npm/pnpm/yarn/vite for app scripts (see `CLAUDE.md` / `.cursor/rules`)
- TypeScript, React 19 (optional peer) for studio + `cinematype/react`
- Package builds with **tsup**; tests with **`bun test`**
- Publish surface: `dist/`, `fonts/`, `styles/`, `docs/`, `scripts/get-cinematype.sh`

## Repo map

| Path | Purpose |
|------|---------|
| `src/index.ts` | Public root API + `version` |
| `src/fonts/` | Catalog, CSS gen, loader |
| `src/motion/` | Split text + kinetic engine |
| `src/video/` | Captions, formats, canvas, brand, transcript, ffmpeg, presets |
| `src/plugins/` | CapCut / YouTube / TikTok / Reels / Premiere / DaVinci / FFmpeg / Whisper / Remotion / OBS |
| `src/react/` | Provider, Text, KineticText, TypedVideo, hooks |
| `src/cli.ts` | Creator CLI (`bun run ct -- …`) |
| `scripts/get-cinematype.sh` | **Curl installer** (must stay green) |
| `scripts/serve-playground.ts` | Studio server (port `5180`) |
| `playground/` | Creator studio UI |
| `tests/` | `bun:test` suites — keep green |
| `docs/` | CREATOR, PLUGINS, ONBOARDING |
| `.github/` | CI, PR template, CODEOWNERS |

## Branch & PR rules (always)

- **Never commit directly to `main`** — it is protected (PR + CI required)
- Workflow:

```bash
git checkout main && git pull origin main
git checkout -b feature/short-name
# work
bun test && bun run typecheck && bun run build && bun run lint:package
git push -u origin HEAD
gh pr create
```

- Prefer **squash merge**; fill PR template
- One focused change per PR

## Commands agents must know

```bash
# Install / studio (creator north star)
curl -fsSL https://raw.githubusercontent.com/Himan-D/cinematype/main/scripts/get-cinematype.sh | bash

# Local
bun install
bun run studio                 # http://localhost:5180
bun run ct -- help
bun run ct -- captions --text "Stop scrolling" --out hook.srt
bun run ct -- plugin capcut --text "Hook" --out-dir ./pack
bun run ct -- doctor

# Verify (same as CI)
bun test
bun run typecheck
bun run build
bun run lint:package
```

After code changes that touch exports: run **build + publint**.  
After plugin/studio changes: smoke CLI pack + mention studio Plugins tab in PR.

## How to extend (common tasks)

### Add a font

1. Vendor woff2 into `fonts/<id>/` (`bun run vendor:fonts` or copy from Fontsource)
2. Register in `src/fonts/catalog.ts` (role, useCases, weightRange, files)
3. Update `licenses/ATTRIBUTION.md`
4. `bun run generate:css` (or full `bun run build`)
5. Fix `tests/fonts.test.ts` expectations if needed

### Add a plugin

1. Implement `CinematypePlugin` in `src/plugins/<name>.ts`
2. Register in `src/plugins/registry.ts` + export from `src/plugins/index.ts`
3. Add/extend `tests/plugins.test.ts`
4. Document in `docs/PLUGINS.md`
5. Ensure `runPlugin(id, ctx)` returns real files and/or commands

### Add a creator template / title card

1. Edit `src/video/presets.ts` (`CREATOR_TEMPLATES` / `TITLE_CARD_PRESETS`)
2. Keep cue styles valid: `subtitle | title | lower-third | karaoke | chapter | end-card | speaker | burn`
3. Cover in tests if behavior is non-trivial

### Change studio UX

1. Edit `playground/` only for UI; keep library logic in `src/`
2. Preserve curl banner + first-run onboarding (`Onboarding.tsx`)
3. Do not require accounts or network except optional demo video URL

### Change public API

1. Update `src/index.ts` / subpath barrels
2. Update `package.json` `exports` + `tsup.config.ts` entrypoints
3. Bump `version` in `package.json` **and** `src/index.ts` (+ CLI version string if needed)
4. Update README / docs examples

## Product guardrails

- **Creator-first copy** in README (curl above npm)
- Keep Latin OFL fonts self-hosted; do not add Google Fonts runtime dependency
- Plugin packs must be usable offline after download (files on disk)
- CLI must work headlessly for `captions` + `plugin` (no browser)
- Studio may use browser APIs (`localStorage`, canvas, download)

## Testing expectations

| Change area | Minimum verification |
|-------------|----------------------|
| `src/plugins/**` | `bun test tests/plugins.test.ts` + one `ct -- plugin …` |
| `src/cli.ts` | `bun test tests/cli.test.ts` |
| `src/video/**` | `bun test tests/video.test.ts tests/creator.test.ts` |
| `src/fonts/**` | `bun test tests/fonts.test.ts` + `generate:css` |
| playground | `bun run studio` starts; no console hook errors |
| package exports | `bun run build && bun run lint:package` |

## Do / Don't

**Do**

- Use Bun APIs and `bun:test`
- Route features through PRs
- Keep curl installer (`scripts/get-cinematype.sh`) working from `main`
- Write focused tests next to new behavior
- Prefer small, reversible diffs

**Don't**

- Commit secrets, `.env`, or giant unrelated lockfile churn
- Force-push `main` or bypass hooks
- Add Express/Vite/Jest without an explicit user request
- Break `cinematype/plugins` export path
- Ship empty plugin packs or stub “TODO” downloads

## Quick architecture

```
Creator → curl|CLI|studio
        → transcriptToCues / whisperJsonToCues
        → cues + brand kit
        → plugins (SRT/VTT/ASS/JSON/HTML + commands)
        → CapCut / YouTube / FFmpeg / Remotion / OBS
```

## When stuck

1. Read `README.md` (curl + CLI) and `docs/ONBOARDING.md`
2. Run `bun run ct -- doctor`
3. Check CI workflow `.github/workflows/ci.yml`
4. Ask the user before publishing npm or changing branch protection
