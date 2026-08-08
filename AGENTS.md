# AGENTS.md — cinematype

Instructions for AI coding agents (Cursor, Claude Code, Codex, etc.) working in this repository.

## Mission

**cinematype** is the local-first **typography layer** for video creators: brand-consistent captions and title graphics, exported everywhere.

Optimize for:

1. **Branded preview** (studio: transcript → style → look like *my* brand)
2. **Destination handoff** (CapCut, Premiere, YouTube, FFmpeg packs — adapters in `src/plugins`)
3. **Zero-config local studio** (`bun run studio`)
4. **Portable projects** (`project.ct`)

Product thesis: [docs/PRD.md](./docs/PRD.md).

Non-goals unless explicitly requested: full video editor, cloud accounts, in-browser Whisper weights, CapCut binary plugins, social publishing.

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
| `src/video/` | Captions, CaptionStyle, brand kits, project.ct, formats, canvas, presets |
| `src/plugins/` | Destination adapters (CapCut / YouTube / …) — API `cinematype/plugins` |
| `src/react/` | Provider, Text, KineticText, TypedVideo, hooks |
| `src/cli.ts` | Creator CLI (`bun run ct -- …`) |
| `scripts/get-cinematype.sh` | **Curl installer** (must stay green) |
| `scripts/serve-playground.ts` | Studio server (port `5180`) |
| `playground/` | Creator studio UI (preview + brand + destinations) |
| `tests/` | `bun:test` suites — keep green |
| `docs/` | PRD, CREATOR, PLUGINS (destinations), ONBOARDING |
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
curl -fsSL https://raw.githubusercontent.com/Himan-D/cinematype/main/scripts/get-cinematype.sh | bash

bun install
bun run studio
bun run ct -- help
bun run ct -- captions --text "Stop scrolling" --out hook.srt
bun run ct -- plugin capcut --text "Hook" --out-dir ./pack
bun run ct -- project save --text "Hook" --out project.ct
bun run ct -- doctor

bun test
bun run typecheck
bun run build
bun run lint:package
```

After code changes that touch exports: run **build + publint**.  
After destination/studio changes: smoke CLI pack + mention studio Destinations tab in PR.

## How to extend (common tasks)

### Add a font

1. Vendor woff2 into `fonts/<id>/`
2. Register in `src/fonts/catalog.ts`
3. Update `licenses/ATTRIBUTION.md`
4. `bun run generate:css` (or full `bun run build`)
5. Fix `tests/fonts.test.ts` if needed

### Add a destination (plugin adapter)

1. Implement `CinematypePlugin` in `src/plugins/<name>.ts`
2. Register in `src/plugins/registry.ts` + export from `src/plugins/index.ts`
3. Add/extend `tests/plugins.test.ts`
4. Document in `docs/PLUGINS.md` (Destinations table)
5. Ensure `runPlugin(id, ctx)` returns real files and/or commands

### Change Brand Kit / CaptionStyle

1. Edit `src/video/brand.ts` (`BrandKit`, `CaptionStyle`, migrate helpers)
2. Keep localStorage migration (`cinematype:brand-kit` → `cinematype:brand-kits`)
3. Cover in `tests/brand.test.ts`

### Project files

1. Schema in `src/video/project.ts`
2. Studio Save/Open + CLI `project save|open`
3. Cover in `tests/project.test.ts`

### Change studio UX

1. Edit `playground/` only for UI; keep library logic in `src/`
2. Preserve curl banner + first-run onboarding
3. Keep preview + brand + destinations as the hero path

## Product guardrails

- Creator-first copy in README (curl above npm); brand narrative over “plugin count”
- Keep Latin OFL fonts self-hosted
- Destination packs must be usable offline after download
- CLI must work headlessly for `captions` + `plugin` + `project`
- Studio may use browser APIs (`localStorage`, canvas, download)

## Testing expectations

| Change area | Minimum verification |
|-------------|----------------------|
| `src/plugins/**` | `bun test tests/plugins.test.ts` + one `ct -- plugin …` |
| `src/cli.ts` | `bun test tests/cli.test.ts` |
| `src/video/**` | `bun test tests/video.test.ts tests/creator.test.ts tests/brand.test.ts tests/project.test.ts` |
| `src/fonts/**` | `bun test tests/fonts.test.ts` + `generate:css` |
| playground | `bun run studio` starts; preview + destinations work |
| package exports | `bun run build && bun run lint:package` |

## Do / Don't

**Do**

- Use Bun APIs and `bun:test`
- Route features through PRs
- Keep curl installer working from `main`
- Prefer small, reversible diffs
- Treat destinations as product language; keep `plugins` API stable

**Don't**

- Commit secrets or giant unrelated lockfile churn
- Force-push `main`
- Add Express/Vite/Jest without an explicit user request
- Break `cinematype/plugins` export path
- Ship empty destination packs
- Compete as a full AI video editor

## Quick architecture

```
Creator → curl|CLI|studio
        → transcriptToCues / whisperJsonToCues
        → BrandKit + CaptionStyle
        → live preview (overlay)
        → destinations (plugin adapters: SRT/VTT/ASS/JSON/HTML + commands)
        → CapCut / YouTube / FFmpeg / Remotion / OBS
        → project.ct save/load
```

## When stuck

1. Read `README.md`, `docs/PRD.md`, `docs/ONBOARDING.md`
2. Run `bun run ct -- doctor`
3. Check CI workflow `.github/workflows/ci.yml`
4. Ask the user before publishing npm or changing branch protection
