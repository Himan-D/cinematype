# Onboarding (product)

## Promise

> From voiceover script → CapCut/YouTube captions in **under 60 seconds**.

## North-star funnel

1. **Discover** — README curl one-liner  
2. **Activate** — studio opens, welcome wizard  
3. **Aha** — first SRT/plugin pack downloaded  
4. **Habit** — brand kit saved, templates reused  

## Install surfaces

| Surface | Command |
|---------|---------|
| Curl studio | `curl -fsSL …/get-cinematype.sh \| bash` |
| Curl captions | `… \| bash -s -- captions --text "…" --out hook.srt` |
| Curl CapCut pack | `… \| bash -s -- plugin capcut --text "…" --out-dir ./pack` |
| Local | `bun run studio` / `bun run ct -- …` |

## Success metrics (track later)

- Time-to-first-SRT  
- % users who open Plugins tab  
- CapCut vs YouTube pack downloads  
- Return visits (brand kit present in localStorage)

## Non-goals (for now)

- Cloud accounts  
- In-browser Whisper model  
- CapCut binary plugin (we export files CapCut already understands)
