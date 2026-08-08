# Cinematype — Product Requirements Document

## Product

**Cinematype** — a local-first typography and caption studio that turns a transcript or video into beautifully branded, platform-ready captions and title graphics.

### One-line

**Make your captions look like your brand.**

### Promise

Create your caption style once. Export it everywhere.

### Positioning

Cinematype is the **typography layer for modern video creators** — not another AI video editor.

It is local-first, open-source, brand-first, typography-focused, developer-friendly, and export-anywhere. It makes CapCut, Premiere, DaVinci, YouTube, and FFmpeg better; it does not replace them.

### Primary user

Short-form creators who publish talking-head, educational, podcast, commentary, coaching, or product videos.

### Secondary users

Video editors, creator agencies, social managers, developers building creator tools, teams with multiple brands.

---

## Problem

Creators already have editors. The friction is:

1. Caption styling is repetitive
2. Brand consistency is hard across tools
3. Destinations need different formats
4. Designers want control; creators want speed
5. Developers lack a reusable caption/typography engine

---

## Core journey

1. Import — video, transcript, SRT, Whisper JSON, or demo
2. Style — visual templates (Bold Creator, Podcast, Minimal, …)
3. Brand — fonts, colors, stroke, position, animation, lower-thirds
4. Preview — captions rendered on real video
5. Edit — cue text, timing, split/merge
6. Export — CapCut, Premiere, DaVinci, YouTube, TikTok, Reels, SRT/VTT/ASS, FFmpeg
7. Save — `project.ct` for reopen / CLI / Git

**Success:** usable branded asset in under 60 seconds.

---

## P0 pillars

| Pillar | Intent |
|--------|--------|
| Caption engine | transcript/SRT/Whisper → timed cues + edit |
| Typography / CaptionStyle | one style → preview + ASS + overlays |
| Brand kit | first-class multi-kit identity |
| Studio | preview-first shell |
| Destinations | export adapters (API still `cinematype/plugins`) |
| Project file | portable `project.ct` |

## Non-goals (Phase 1)

Full video editor, cloud storage, social publishing, AI avatars/video gen, stock/music marketplaces, mandatory cloud AI, mobile app, browser Whisper weights.

---

## Metrics

**North star:** successfully exported branded video assets per active creator.

Activation: video/transcript → styled preview → export in first session.

Targets: preview &lt; 30s · export &lt; 60s · first-session export &gt; 50%.

---

## Roadmap

- **Phase 1** — Studio hero, Brand Kit v2, CaptionStyle, project.ct, destinations IA, caption editor
- **Phase 2** — Smart timing/emphasis, platform presets polish, karaoke, custom fonts, batch export
- **Phase 3** — Local Whisper, quality scoring, auto style, multi-language
- **Phase 4** — Plugin SDK, community templates, Remotion depth, team brand kits

## Strategic sentence

Cinematype should not build another video editor. It should build the typography layer every video editor wishes it had.
